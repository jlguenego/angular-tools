import { TestBed } from '@angular/core/testing';

import { JlgService } from './jlg.service';

describe('JlgService', () => {
  let service: JlgService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JlgService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
