import { Injectable } from '@angular/core';
import { BlackAndWhiteList } from '../interfaces/black-and-white-list';

@Injectable({
  providedIn: 'root',
})
export class AngularToolsConfigService {
  timeoutDelay = 5000;
  timeoutMsg = `Sorry, timeout. The server did not respond before ${this.timeoutDelay}ms.`;

  constructor() {}
}
