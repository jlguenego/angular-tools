import {
  HttpRequest,
  HttpResponse,
  HttpClient,
  HttpHeaders,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as localforage from 'localforage';
import { isMatch } from 'matcher';
import { lastValueFrom } from 'rxjs';
import { Idable } from '../../interfaces/idable';
import { HttpMethod, OfflineOrder } from '../../interfaces/offline-order';
import {
  addOrder,
  getDefaultItem,
  getOrders,
  setOrders,
} from '../../misc/offline-tools';
import { OfflineStorageConfig } from '../config/offline-storage.config';

@Injectable()
export class CacheService {
  isSyncRunning = false;

  constructor(private config: OfflineStorageConfig, private http: HttpClient) {}

  async addOrder(
    request: HttpRequest<unknown>
  ): Promise<HttpResponse<unknown> | null> {
    // it is a POST, PUT, PATCH, DELETE
    if (!this.isProgressiveUrl(request.url)) {
      return null;
    }
    console.log('progressive url. about to add order');

    // add an order.
    await addOrder({
      url: request.url,
      method: request.method as HttpMethod,
      body: request.body,
    });

    console.log('order added');

    const documents = await getDocuments(request);
    if (request.method === 'POST') {
      // detect load image blob
      console.log('request.body: ', request.body);

      if (typeof request.body !== 'object') {
        return null;
      }

      const document = { ...request.body, id: 'temporary' };
      documents.push(document);
      await saveDocuments(request, documents);
      return new HttpResponse({
        status: 201,
        body: document,
      });
    }
    if (request.method === 'DELETE') {
      const ids = request.body as string[];
      const remainingDocuments = documents.filter((d) => !ids.includes(d.id));
      await saveDocuments(request, remainingDocuments);
      return new HttpResponse({
        status: 204,
      });
    }
    return null;
  }

  async getCache(
    request: HttpRequest<unknown>
  ): Promise<HttpResponse<unknown>> {
    const documents = await getDocuments(request);
    return new HttpResponse({
      status: 200,
      body: documents,
    });
  }

  isProgressiveUrl(url: string) {
    console.log('url: ', url);
    console.log('this.config.progressiveUrl: ', this.config.progressiveUrl);
    const result = isMatch(url, this.config.progressiveUrl);
    console.log('result: ', result);
    return result;
  }

  async loadImage(img: HTMLImageElement, url: string) {
    const filename = basename(url);
    const file = await localforage.getItem(filename);
    if (!(file instanceof File)) {
      return;
    }
    const str = URL.createObjectURL(file);

    img.src = str;
    img.onload = function () {
      URL.revokeObjectURL(str);
    };
  }

  async runOrder(order: OfflineOrder): Promise<void> {
    if (order.type === 'formdata') {
      // build the formdata
      const formdata = new FormData();
      for (const [key, value] of Object.entries(
        order.body as { [key: string]: string }
      )) {
        const file = await localforage.getItem(value);
        if (!(file instanceof File)) {
          throw new Error('cannot retrieve a file from localforage');
        }
        formdata.append(key, file);
      }

      // send the post request
      await lastValueFrom(this.http.post(order.url, formdata));
      return;
    }
    if (order.method === 'DELETE') {
      const options = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
        }),
        body: order.body,
      };
      await lastValueFrom(this.http.delete(order.url, options));
      return;
    }
    if (order.method === 'POST') {
      await lastValueFrom(this.http.post(order.url, order.body));
      return;
    }
  }

  async setCache(
    request: HttpRequest<unknown>,
    response: HttpResponse<unknown>
  ) {
    await localforage.setItem(serialize(request), response.body);
  }

  async sync() {
    if (this.isSyncRunning) {
      return;
    }
    this.isSyncRunning = true;
    const orders = await getOrders();
    const urls = new Set<string>();
    while (orders.length > 0) {
      const order = orders[0];
      if (order.type !== 'formdata') {
        urls.add(order.url);
      }

      orders.shift();
      await setOrders(orders);
      try {
        await this.runOrder(order);
      } catch (err) {
        console.error('runOrder failed. err: ', err);
      }
    }
    try {
      for (const url of urls) {
        // update the cache data.
        await lastValueFrom(this.http.get(url));
      }
    } catch (err) {
      console.error('err: ', err);
    }
    this.isSyncRunning = false;
  }
}

const serialize = (request: HttpRequest<unknown>) => {
  return request.method + ' ' + request.url;
};

const getDocuments = async (request: HttpRequest<unknown>) => {
  const key = `GET ${request.url}`;
  return await getDefaultItem<Idable[]>(key, []);
};

const saveDocuments = async (
  request: HttpRequest<unknown>,
  documents: Idable[]
) => {
  const key = `GET ${request.url}`;
  await localforage.setItem(key, documents);
};

const basename = (path: string) => {
  return path.split('/').reverse()[0];
};
