import { HttpEvent, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as localforage from 'localforage';

@Injectable({
  providedIn: 'root',
})
export class CacheService {
  constructor() {}

  async getCache(
    request: HttpRequest<unknown>
  ): Promise<HttpResponse<unknown> | null> {
    if (request.method === 'GET') {
      const r = (await localforage.getItem(
        serialize(request)
      )) as HttpResponse<unknown> | null;
      return r;
    }
    throw new Error('not implemented.');
  }

  async setCache(
    request: HttpRequest<unknown>,
    response: HttpResponse<unknown>
  ) {
    if (request.method === 'GET') {
      localforage.setItem(serialize(request), response.body);
    }
  }
}

const serialize = (request: HttpRequest<unknown>) => {
  return request.method + ' ' + request.url;
};
