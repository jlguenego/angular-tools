import { getOrders, setOrders } from './../misc/offline-tools';
import {
  HttpRequest,
  HttpResponse,
  HttpClient,
  HttpHeaders,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as localforage from 'localforage';
import { lastValueFrom } from 'rxjs';
import { HttpMethod, OfflineOrder } from '../interfaces/offline-order';
import { blackAndWhiteFilter } from '../misc/black-and-white-filter';
import { addOrder, getDefaultItem } from '../misc/offline-tools';
import { Idable } from './../interfaces/idable';
import { ProgressiveRequestService } from './progressive-request.service';

@Injectable({
  providedIn: 'root',
})
export class CacheService {
  constructor(
    private config: ProgressiveRequestService,
    private http: HttpClient
  ) {}

  isProgressiveUrl(url: string) {
    console.log('this.config: ', this.config);
    return blackAndWhiteFilter(url, this.config.progressiveUrl);
  }

  async getCache(
    request: HttpRequest<unknown>
  ): Promise<HttpResponse<unknown> | null> {
    console.log('getCache on request: ', serialize(request));

    if (request.method === 'GET') {
      const documents = await getDocuments(request);
      return new HttpResponse({
        status: 200,
        body: documents,
      });
    }

    // it is a POST, PUT, PATCH, DELETE
    if (!this.isProgressiveUrl(request.url)) {
      return null;
    }

    // add an order.
    await addOrder({
      url: request.url,
      method: request.method as HttpMethod,
      body: request.body,
    });

    const documents = await getDocuments(request);
    if (request.method === 'POST') {
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

  async setCache(
    request: HttpRequest<unknown>,
    response: HttpResponse<unknown>
  ) {
    console.log('set cache start (normally we are online');
    if (request.method === 'GET') {
      await localforage.setItem(serialize(request), response.body);
      return;
    }
    return;
  }

  async runOrder(order: OfflineOrder): Promise<void> {
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

  async sync() {
    console.log('starting sync');
    const orders = await getOrders();
    console.log('orders: ', orders);
    const urls = new Set<string>();
    while (orders.length > 0) {
      const order = orders[0];
      urls.add(order.url);
      console.log('about to play order: ', order);
      await this.runOrder(order);
      orders.shift();
      await setOrders(orders);
    }
    for (const url of urls) {
      this.http.get(url);
    }
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
