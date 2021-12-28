import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthorizationConfig } from '../../interfaces/authorization-config';
import {
  blackAndWhiteFilter,
  doNotAllowAnythingConfig,
} from '../../misc/black-and-white-filter';
import { AuthenticationService } from './authentication.service';

const doNotAllowAnythingAuthConfig: AuthorizationConfig = {
  path: doNotAllowAnythingConfig,
  privilege: doNotAllowAnythingConfig,
};

@Injectable({
  providedIn: 'root',
})
export class AuthorizationService {
  private authConfig$ = new ReplaySubject<AuthorizationConfig>();

  constructor(
    private http: HttpClient,
    private authenticationService: AuthenticationService
  ) {
    this.authenticationService.user$.subscribe({
      next: (user) => {
        if (!user) {
          return;
        }
        this.http
          .get<AuthorizationConfig>(
            `/api/authz/config/${user.identityProvider}/${user.id}`
          )
          .subscribe({
            next: (authConfig) => {
              this.authConfig$.next(authConfig);
            },
            error: (err) => {
              this.authConfig$.next(doNotAllowAnythingAuthConfig);
            },
          });
      },
    });
  }

  can(privilege: string): Observable<boolean> {
    return this.getAuthConfig().pipe(
      map((authzConfig) => {
        return blackAndWhiteFilter(privilege, authzConfig.privilege);
      })
    );
  }

  canGoToPath(path: string): Observable<boolean> {
    return this.getAuthConfig().pipe(
      map((authzConfig) => {
        console.log('authzConfig: ', authzConfig);
        return blackAndWhiteFilter(path, authzConfig.path);
      })
    );
  }

  getAuthConfig(): Observable<AuthorizationConfig> {
    return this.authConfig$;
  }
}
