import { TestBed } from '@angular/core/testing';

import { FireviajesService } from './fireviajes.service';

describe('FireviajesService', () => {
  let service: FireviajesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FireviajesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
