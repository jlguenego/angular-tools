import { TestBed } from '@angular/core/testing';

import { TimeoutInterceptor } from './timeout.interceptor';

describe('TimeoutInterceptor', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      TimeoutInterceptor
      ]
  }));

  it('should be created', () => {
    const interceptor: TimeoutInterceptor = TestBed.inject(TimeoutInterceptor);
    expect(interceptor).toBeTruthy();
  });
});
