import { TestBed } from '@angular/core/testing';

import { DuplicateAsyncValidator } from './duplicate.async-validator';

describe('DuplicateAsyncValidatorService', () => {
  let service: DuplicateAsyncValidator;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DuplicateAsyncValidator);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
