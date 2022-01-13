import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, switchMap } from 'rxjs';
import { CacheService } from '../services/cache.service';
import { NetworkService } from '../services/network.service';

@Injectable()
export class NetworkInterceptor implements HttpInterceptor {
  constructor(
    private networkService: NetworkService,
    private cacheService: CacheService
  ) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      switchMap(async (response) => {
        if (!(response instanceof HttpResponse)) {
          return response;
        }
        this.networkService.set('online');
        if (isMethodGet(request) && isCachableRequest(request)) {
          await this.cacheService.setCache(request, response);
        }

        await this.cacheService.sync();
        if (isMethodGet(request) && isCachableRequest(request)) {
          return await this.cacheService.getCache(request);
        }
        return response;
      }),
      catchError(async (error) => {
        console.log('network interceptor error: ', error);
        if (!(error instanceof HttpErrorResponse)) {
          throw error;
        }
        if (![0, 504].includes(error.status)) {
          this.networkService.set('online');
          throw error;
        }

        this.networkService.set('offline');
        // get back the cache...
        if (isMethodGet(request)) {
          return await this.cacheService.getCache(request);
        }
        const response = await this.cacheService.addOrder(request);
        if (response === null) {
          throw error;
        }
        return response;
      })
    );
  }
}

const isMethodGet = (request: HttpRequest<unknown>) => request.method === 'GET';

const isCachableRequest = (request: HttpRequest<unknown>) => {
  const cacheControl = request.headers.get('Cache-Control');
  if (cacheControl === 'no-store') {
    return false;
  }
  return true;
};
