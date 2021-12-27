import { BlackAndWhiteList } from './../interfaces/black-and-white-list';
export class ProgressiveRequestConfig {
  constructor(
    public progressiveUrl: BlackAndWhiteList = {
      whiteList: [{ type: 'regexp', path: '/api/.*' }],
      blackList: [{ type: 'regexp', path: '/api/auth/.*' }],
    }
  ) {}
}
