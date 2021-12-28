import {
  ModuleWithProviders,
  NgModule,
  Optional,
  SkipSelf,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlackAndWhiteList } from '../interfaces/black-and-white-list';
import { CacheService } from './services/cache.service';
import { NetworkService } from './services/network.service';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NetworkInterceptor } from './interceptors/network.interceptor';

export class OfflineStorageConfigService {
  progressiveUrl: BlackAndWhiteList = {
    whiteList: [{ type: 'regexp', path: '/api/.*' }],
    blackList: [{ type: 'regexp', path: '/api/auth/.*' }],
  };
}

@NgModule({
  declarations: [],
  imports: [CommonModule],
  providers: [
    CacheService,
    NetworkService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: NetworkInterceptor,
      multi: true,
    },
  ],
})
export class OfflineStorageModule {
  constructor(@Optional() @SkipSelf() parentModule?: OfflineStorageModule) {
    if (parentModule) {
      console.log('parentModule: ', parentModule);
      throw new Error(
        'OfflineStorageModule is already loaded. Import it in the AppModule only.'
      );
    }
  }
  static forRoot(
    config: Partial<OfflineStorageConfigService> = {}
  ): ModuleWithProviders<OfflineStorageModule> {
    const cfg = new OfflineStorageConfigService();
    Object.assign(cfg, config);
    return {
      ngModule: OfflineStorageModule,
      providers: [{ provide: OfflineStorageConfigService, useValue: cfg }],
    };
  }
}
