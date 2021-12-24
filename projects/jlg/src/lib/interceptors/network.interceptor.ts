import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpEventType,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { NetworkService } from '../services/network.service';

@Injectable()
export class NetworkInterceptor implements HttpInterceptor {
  constructor(private networkService: NetworkService) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      tap({
        next: (response) => {
          if (
            [HttpEventType.Sent, HttpEventType.User].includes(response.type)
          ) {
            return;
          }
          this.networkService.set('online');
        },
        error: (error) => {
          if (error instanceof HttpErrorResponse) {
            if ([0, 504].includes(error.status)) {
              console.log('response.status: ', error.status);
              this.networkService.set('offline');
              return;
            }
            this.networkService.set('online');
          }
        },
      })
    );
  }
}
