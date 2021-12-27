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
        await this.cacheService.setCache(request, response);
        return response;
      }),
      catchError(async (error) => {
        if (error instanceof HttpErrorResponse) {
          if ([0, 504].includes(error.status)) {
            this.networkService.set('offline');
            // get back the cache...
            const body = await this.cacheService.getCache(request);
            if (body === null) {
              throw error;
            }
            return new HttpResponse({
              body,
              status: 200,
            });
          }
          this.networkService.set('online');
        }
        throw error;
      })
    );
  }
}
