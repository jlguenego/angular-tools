import { TestBed } from '@angular/core/testing';

import { AngularToolsConfigService } from './angular-tools-config.service';

describe('AngularToolsConfigService', () => {
  let service: AngularToolsConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AngularToolsConfigService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
