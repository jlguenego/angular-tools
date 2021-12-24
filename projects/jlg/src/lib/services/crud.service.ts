import { isOfflineError } from '../misc/offline-tools';
import { OfflineCrud } from './../classes/offline-crud';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import * as localforage from 'localforage';
import {
  BehaviorSubject,
  catchError,
  filter,
  lastValueFrom,
  map,
  Observable,
  Subject,
  switchMap,
  throwError,
  timeout,
  timer,
} from 'rxjs';
import { Idable } from '../interfaces/idable';
import { OfflineOrder } from '../interfaces/offline-order';
import { AddOrder, RemoveOrder } from './../interfaces/offline-order';
import { OfflineService } from './offline.service';
import { getDefaultItem, OFFLINE_ORDERSTACK_NAME } from '../misc/offline-tools';

@Injectable({
  providedIn: 'root',
})
export abstract class CrudService<T extends Idable> {
  url = this.getEndpoint();

  documents$ = new BehaviorSubject<T[]>([]);

  offlineCrud = new OfflineCrud<T>(this.url);

  constructor(
    private http: HttpClient,
    private router: Router,
    private offlineService: OfflineService
  ) {
    this.sync();
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

  add(document: T): Observable<void> {
    return timer(300).pipe(
      switchMap(() =>
        this.http.post<void>(this.url, document).pipe(
          timeout(5000),
          catchError((err: unknown) => {
            console.log('err: ', err);
            if (isOfflineError(err)) {
              return this.offlineCrud.addOffline(document);
            }
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
        if (isOfflineError(err)) {
          return this.offlineCrud.removeOffline(ids);
        }
        if (err instanceof HttpErrorResponse) {
          return throwError(() => new Error(err.error));
        }
        return throwError(() => err);
      })
    );
  }

  retrieveAll(): Observable<void> {
    const wasOffline =
      this.offlineService.connectionStatus$.value === 'offline';
    return timer(300).pipe(
      switchMap(() => this.http.get<T[]>(this.url).pipe(timeout(5000))),
      catchError((err) => {
        if (isOfflineError(err)) {
          return this.offlineCrud.retrieveAllOffline();
        }
        return throwError(() => err);
      }),
      map((documents) => {
        if (
          wasOffline &&
          this.offlineService.connectionStatus$.value === 'online'
        ) {
          // a sync should run and redo a retrieve all after all the delayed order.
          return undefined;
        }
        console.log('documents: ', documents);
        localforage.setItem(this.url, documents);
        this.documents$.next(documents);
        return undefined;
      })
    );
  }

  sync() {
    // when online, play all the offline orders.
    this.offlineService.connectionStatus$
      .pipe(filter((status) => status === 'online'))
      .subscribe(() => {
        (async () => {
          console.log('status is back online');
          const orders = await getDefaultItem<OfflineOrder<T>[]>(
            OFFLINE_ORDERSTACK_NAME,
            []
          );
          console.log('orders: ', orders);
          while (orders.length > 0) {
            const order = orders[0];
            console.log('about to play order: ', order);
            await this.runOrder(order);
            orders.shift();
            await localforage.setItem(OFFLINE_ORDERSTACK_NAME, orders);
          }
          await lastValueFrom(this.retrieveAll());
        })();
      });
  }

  async runOrder(order: OfflineOrder<T>): Promise<void> {
    if (order.type === 'remove') {
      await lastValueFrom(this.remove(order.ids));
      return;
    }
    if (order.type === 'add') {
      await lastValueFrom(this.add(order.document));
      return;
    }
  }
}
