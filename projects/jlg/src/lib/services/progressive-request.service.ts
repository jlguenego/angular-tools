import { BlackAndWhiteList } from './../interfaces/black-and-white-list';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ProgressiveRequestService {
  progressiveUrl: BlackAndWhiteList = {
    whiteList: [{ type: 'regexp', path: '/api/.*' }],
    blackList: [{ type: 'regexp', path: '/api/auth/.*' }],
  };
}
