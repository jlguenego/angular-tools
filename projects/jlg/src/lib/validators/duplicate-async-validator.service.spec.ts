import { TestBed } from '@angular/core/testing';

import { DuplicateAsyncValidatorService } from './duplicate-async-validator.service';

describe('DuplicateAsyncValidatorService', () => {
  let service: DuplicateAsyncValidatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DuplicateAsyncValidatorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
