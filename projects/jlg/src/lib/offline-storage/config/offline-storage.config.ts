import { BlackAndWhiteList } from '../../interfaces/black-and-white-list';

export class OfflineStorageConfig {
  progressiveUrl: BlackAndWhiteList = {
    whiteList: [{ type: 'regexp', path: '/api/.*' }],
    blackList: [{ type: 'regexp', path: '/api/auth/.*' }],
  };
}
