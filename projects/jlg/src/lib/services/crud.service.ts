import { Router } from '@angular/router';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  catchError,
  map,
  Observable,
  of,
  switchMap,
  throwError,
  timeout,
  timer,
} from 'rxjs';
import { Idable } from '../interfaces/idable';

@Injectable({
  providedIn: 'root',
})
export abstract class CrudService<T extends Idable> {
  url: string;

  documents$ = new BehaviorSubject<T[]>([]);
  constructor(private http: HttpClient, private router: Router) {
    this.url = this.getEndpoint();
    this.documents$.subscribe((documents) => {
      localStorage.setItem(this.url, JSON.stringify(documents));
    });
  }

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

  add(document: T) {
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

  remove(selectedDocuments: Set<T>): Observable<void> {
    const ids = [...selectedDocuments].map((a) => a.id);
    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      body: ids,
    };
    return timer(300).pipe(
      switchMap(() =>
        this.http.delete<void>(this.url, options).pipe(timeout(5000))
      )
    );
  }

  retrieveAll(): Observable<void> {
    return timer(300).pipe(
      switchMap(() => this.http.get<T[]>(this.url).pipe(timeout(5000))),
      catchError((err) => {
        if (isOfflineError(err)) {
          return this.retrieveAllOffline();
        }
        return throwError(() => err);
      }),
      map((documents) => {
        this.documents$.next(documents);
        return undefined;
      })
    );
  }

  retrieveAllOffline(): Observable<T[]> {
    const str = localStorage.getItem(this.url);
    if (!str) {
      return of([]);
    }
    return of(JSON.parse(str) as T[]);
  }
}

const isOfflineError = (err: unknown) => {
  console.log('isOfflineError err: ', err);
  return true;
};
