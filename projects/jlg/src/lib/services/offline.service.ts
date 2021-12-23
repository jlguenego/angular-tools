import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ConnectionStatus = 'online' | 'offline';

@Injectable({
  providedIn: 'root',
})
export class OfflineService {
  connectionStatus$ = new BehaviorSubject<ConnectionStatus>('online');

  constructor() {}

  set(connectionStatus: ConnectionStatus) {
    if (this.connectionStatus$.value !== connectionStatus) {
      this.connectionStatus$.next(connectionStatus);
    }
  }
}
