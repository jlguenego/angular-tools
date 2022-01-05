import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { lastValueFrom, Observable, switchMap } from 'rxjs';
import { AuthenticationService } from '../services/authentication.service';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationGuard implements CanActivate {
  constructor(
    private authenticationService: AuthenticationService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    console.log('xx guard start for state.url', state.url);
    if (this.authenticationService.user$.value) {
      return true;
    }

    return this.authenticationService.isConnected().pipe(
      switchMap(async (user) => {
        console.log('test passed: is connected: ', user);
        if (!user) {
          console.log('not connected');
          await lastValueFrom(
            this.authenticationService.setAfterLoginRoute(state.url)
          );
          await this.router.navigateByUrl('/user/login');
          return false;
        }
        return true;
      })
    );
  }
}
