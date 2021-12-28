import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { AuthorizationGuard } from './authorization.guard';

describe('AuthorizationGuard', () => {
  let guard: AuthorizationGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    guard = TestBed.inject(AuthorizationGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
