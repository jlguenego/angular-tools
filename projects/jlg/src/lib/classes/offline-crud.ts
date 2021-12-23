import { Idable } from './../interfaces/idable';
import * as localforage from 'localforage';
import { Observable, Subject } from 'rxjs';
import {
  AddOrder,
  OfflineOrder,
  RemoveOrder,
} from '../interfaces/offline-order';
import { getDefaultItem, OFFLINE_ORDERSTACK_NAME } from '../misc/offline-tools';

export class OfflineCrud<T extends Idable> {
  constructor(private url: string) {}

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

      // remove the documents from the localforage
      const documents = await getDefaultItem<T[]>(this.url, []);
      const remainingDocuments = documents.filter((d) => !ids.includes(d.id));
      localforage.setItem(this.url, remainingDocuments);

      // finishing.
      s.next(undefined);
      s.complete();
    })();
    return s;
  }

  retrieveAllOffline(): Observable<T[]> {
    const observable = new Subject<T[]>();
    (async () => {
      try {
        const doc = await getDefaultItem<T[]>(this.url, []);
        console.log('doc: ', doc);
        observable.next(doc);
        observable.complete();
      } catch (error) {
        console.error('error: ', error);
        observable.error(error);
      }
    })();
    return observable;
  }
}
