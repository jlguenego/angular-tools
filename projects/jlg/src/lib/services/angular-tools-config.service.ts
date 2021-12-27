import { Injectable } from '@angular/core';
import { BlackAndWhiteList } from '../interfaces/black-and-white-list';

@Injectable({
  providedIn: 'root',
})
export class AngularToolsConfigService {
  progressiveUrl: BlackAndWhiteList = {
    whiteList: [{ type: 'regexp', path: '/api/.*' }],
    blackList: [{ type: 'regexp', path: '/api/auth/.*' }],
  };

  constructor() {}
}
