import {
  ModuleWithProviders,
  NgModule,
  Optional,
  SkipSelf,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CacheService } from './services/cache.service';
import { NetworkService } from './services/network.service';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NetworkInterceptor } from './interceptors/network.interceptor';
import { OfflineStorageConfig } from './config/offline-storage.config';

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
    config: Partial<OfflineStorageConfig> = {}
  ): ModuleWithProviders<OfflineStorageModule> {
    const cfg = new OfflineStorageConfig();
    Object.assign(cfg, config);
    return {
      ngModule: OfflineStorageModule,
      providers: [{ provide: OfflineStorageConfig, useValue: cfg }],
    };
  }
}
