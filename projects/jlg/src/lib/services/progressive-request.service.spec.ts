import { TestBed } from '@angular/core/testing';

import { ProgressiveRequestService } from './progressive-request.service';

describe('ProgressiveRequestService', () => {
  let service: ProgressiveRequestService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProgressiveRequestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
