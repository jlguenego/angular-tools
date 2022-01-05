import { AngularToolsConfigService } from './../angular-tools/angular-tools.module';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, timeout } from 'rxjs';

@Injectable()
export class TimeoutInterceptor implements HttpInterceptor {
  constructor(private config: AngularToolsConfigService) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      timeout(this.config.timeoutDelay),
      catchError((err) => {
        if (err.name === 'TimeoutError') {
          alert('HTTP request timeout');
          throw new Error(this.config.timeoutMsg);
        }
        throw err;
      })
    );
  }
}
