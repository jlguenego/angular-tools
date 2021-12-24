import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type NetworkStatus = 'online' | 'offline';

@Injectable({
  providedIn: 'root',
})
export class NetworkService {
  status$ = new BehaviorSubject<NetworkStatus>('online');

  constructor() {}

  set(connectionStatus: NetworkStatus) {
    if (this.status$.value !== connectionStatus) {
      this.status$.next(connectionStatus);
    }
  }
}
