import { HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as localforage from 'localforage';
import { addOrder, getDefaultItem } from '../misc/offline-tools';
import { Idable } from './../interfaces/idable';

@Injectable({
  providedIn: 'root',
})
export class CacheService {
  constructor() {}

  async getCache(request: HttpRequest<unknown>): Promise<unknown | null> {
    console.log('getCache on request: ', serialize(request));

    if (request.method === 'GET') {
      const r = await localforage.getItem(serialize(request));
      return r;
    }
    return null;
  }

  async setCache(
    request: HttpRequest<unknown>,
    response: HttpResponse<unknown>
  ) {
    if (request.method === 'GET') {
      localforage.setItem(serialize(request), response.body);
      return;
    }
    if (request.method === 'POST') {
      if (typeof request.body !== 'object') {
        return;
      }
      await addOrder({
        url: request.url,
        type: 'add',
        document: request.body,
      });

      const documents = await getDocuments(request);
      const document = { ...request.body, id: 'temporary' };
      documents.push(document);
      await saveDocuments(request, documents);
      return;
    }
    if (request.method === 'DELETE') {
      const ids = request.body as string[];
      await addOrder({
        url: request.url,
        type: 'remove',
        ids,
      });

      const documents = await getDocuments(request);
      const remainingDocuments = documents.filter((d) => !ids.includes(d.id));
      await saveDocuments(request, remainingDocuments);
      return;
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
