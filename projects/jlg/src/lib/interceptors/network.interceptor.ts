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
        if (request.method === 'GET') {
          await this.cacheService.setCache(request, response);
        }

        await this.cacheService.sync();
        if (request.method === 'GET') {
          const resp = await this.cacheService.getCache(request);
          if (resp !== null) {
            return resp;
          }
        }
        return response;
      }),
      catchError(async (error) => {
        if (error instanceof HttpErrorResponse) {
          if ([0, 504].includes(error.status)) {
            this.networkService.set('offline');
            // get back the cache...
            if (request.method === 'GET') {
              return await this.cacheService.getCache(request);
            }
            const response = await this.cacheService.addOrder(request);
            if (response === null) {
              throw error;
            }
            return response;
          }
          this.networkService.set('online');
        }
        throw error;
      })
    );
  }
}
