import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, timeout } from 'rxjs';
import { AngularToolsConfigService } from './../services/angular-tools-config.service';

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
        throw new Error(this.config.timeoutMsg);
      })
    );
  }
}
