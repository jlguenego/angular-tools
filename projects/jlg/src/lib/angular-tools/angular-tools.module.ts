import {
  ModuleWithProviders,
  NgModule,
  Optional,
  SkipSelf,
} from '@angular/core';
import { CommonModule } from '@angular/common';

export class AngularToolsConfigService {
  timeoutDelay = 5000;
  timeoutMsg = `Sorry, timeout. The server did not respond before ${this.timeoutDelay}ms.`;
}

@NgModule({
  declarations: [],
  imports: [CommonModule],
})
export class AngularToolsModule {
  constructor(@Optional() @SkipSelf() parentModule?: AngularToolsModule) {
    if (parentModule) {
      console.log('parentModule: ', parentModule);
      throw new Error(
        'OfflineStorageModule is already loaded. Import it in the AppModule only.'
      );
    }
  }

  static forRoot(
    config: Partial<AngularToolsConfigService> = {}
  ): ModuleWithProviders<AngularToolsModule> {
    const cfg = new AngularToolsConfigService();
    Object.assign(cfg, config);
    return {
      ngModule: AngularToolsModule,
      providers: [{ provide: AngularToolsConfigService, useValue: cfg }],
    };
  }
}
