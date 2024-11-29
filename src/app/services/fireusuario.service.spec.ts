import { TestBed } from '@angular/core/testing';

import { FireusuarioService } from './fireusuario.service';

describe('FireusuarioService', () => {
  let service: FireusuarioService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FireusuarioService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
