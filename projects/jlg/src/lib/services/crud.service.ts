import { AddOrder, RemoveOrder } from './../interfaces/offline-order';
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
  filter,
  lastValueFrom,
  map,
  Observable,
  of,
  Subject,
  switchMap,
  throwError,
  timeout,
  timer,
} from 'rxjs';
import { Idable } from '../interfaces/idable';
import * as localforage from 'localforage';
import { OfflineOrder } from '../interfaces/offline-order';
import { OfflineService } from './offline.service';

const OFFLINE_ORDERSTACK_NAME = 'offline-orderstack';

@Injectable({
  providedIn: 'root',
})
export abstract class CrudService<T extends Idable> {
  url: string;

  documents$ = new BehaviorSubject<T[]>([]);
  constructor(
    private http: HttpClient,
    private router: Router,
    private offlineService: OfflineService
  ) {
    this.url = this.getEndpoint();
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
              return this.addOffline(document);
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

  addOffline(document: T): Observable<void> {
    const s = new Subject<void>();
    (async () => {
      // push the order to the stack
      const orderStack = await getDefaultItem<OfflineOrder<T>[]>(
        OFFLINE_ORDERSTACK_NAME,
        []
      );
      orderStack.push({
        type: 'add',
        document: document,
      } as AddOrder<T>);
      await localforage.setItem(OFFLINE_ORDERSTACK_NAME, orderStack);
      s.next(undefined);
      s.complete();
    })();
    return s;
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
          return this.removeOffline(ids);
        }
        if (err instanceof HttpErrorResponse) {
          return throwError(() => new Error(err.error));
        }
        return throwError(() => err);
      })
    );
  }

  removeOffline(ids: string[]): Observable<void> {
    const s = new Subject<void>();
    (async () => {
      // push the order to the stack
      const orderStack = await getDefaultItem<OfflineOrder<T>[]>(
        OFFLINE_ORDERSTACK_NAME,
        []
      );
      const order = {
        type: 'remove',
        ids: ids,
      } as RemoveOrder;
      console.log('order: ', order);
      orderStack.push(order);
      console.log('orderStack: ', orderStack);
      await localforage.setItem(OFFLINE_ORDERSTACK_NAME, orderStack);
      s.next(undefined);
      s.complete();
    })();
    return s;
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
        console.log('documents: ', documents);
        localforage.setItem(this.url, documents);
        this.documents$.next(documents);
        return undefined;
      })
    );
  }

  retrieveAllOffline(): Observable<T[]> {
    const observable = new Subject<T[]>();
    (async () => {
      try {
        const doc = await localforage.getItem<T[]>(this.url);
        console.log('doc: ', doc);
        if (!doc) {
          observable.next([]);
          observable.complete();
          return;
        }
        observable.next(doc);
        observable.complete();
      } catch (error) {
        console.error('error: ', error);
        observable.error(error);
      }
    })();
    return observable;
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
            const order = orders.shift() as OfflineOrder<T>;
            await localforage.setItem(OFFLINE_ORDERSTACK_NAME, orders);
            console.log('about to play order: ', order);
            alert('run an order');
            await this.runOrder(order);
          }
        })();
      });
  }

  async runOrder(order: OfflineOrder<T>): Promise<void> {
    if (order.type === 'remove') {
      await lastValueFrom(this.remove(order.ids));
      return;
    }
  }
}

const isOfflineError = (err: unknown) => {
  console.log('isOfflineError err: ', err);
  return true;
};

const getDefaultItem = async <T>(name: string, defaultValue: T): Promise<T> => {
  const result = await localforage.getItem<T>(name);
  if (result === null || result === undefined) {
    return defaultValue;
  }
  return result;
};
