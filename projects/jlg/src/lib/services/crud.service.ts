import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {
  BehaviorSubject,
  catchError,
  map,
  Observable,
  switchMap,
  throwError,
  timeout,
  timer,
} from 'rxjs';
import { Idable } from '../interfaces/idable';
import { NetworkService } from './network.service';

@Injectable({
  providedIn: 'root',
})
export abstract class CrudService<T extends Idable> {
  url = this.getEndpoint();

  documents$ = new BehaviorSubject<T[]>([]);

  constructor(
    private http: HttpClient,
    private router: Router,
    private offlineService: NetworkService
  ) {}

  abstract getEndpoint(): string;

  httpError(err: unknown) {
    console.log('err: ', err);
    if (err instanceof HttpErrorResponse) {
      if (err.status === 403) {
        this.router.navigateByUrl('/403');
        return;
      }
      if (err.status === 400) {
        alert('bad request...' + err.error);
        return;
      }
    }
  }

  add(document: T): Observable<void> {
    return timer(300).pipe(
      switchMap(() =>
        this.http.post<void>(this.url, document).pipe(
          timeout(5000),
          catchError((err: unknown) => {
            console.log('err: ', err);
            if (err instanceof HttpErrorResponse) {
              return throwError(() => new Error(err.error));
            }
            return throwError(() => err);
          })
        )
      )
    );
  }

  remove(ids: string[]): Observable<void> {
    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      body: ids,
    };
    return timer(300).pipe(
      switchMap(() =>
        this.http.delete<void>(this.url, options).pipe(timeout(5000))
      ),
      timeout(5000),
      catchError((err: unknown) => {
        console.log('err: ', err);
        if (err instanceof HttpErrorResponse) {
          return throwError(() => new Error(err.error));
        }
        return throwError(() => err);
      })
    );
  }

  retrieveAll(): Observable<void> {
    return timer(300).pipe(
      switchMap(() => this.http.get<T[]>(this.url).pipe(timeout(5000))),
      map((documents) => {
        this.documents$.next(documents);
        return undefined;
      })
    );
  }
}
