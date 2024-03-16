import {TestBed} from '@angular/core/testing';
import {CanActivateFn} from '@angular/router';

import {ComponentGuard} from './component.guard';

describe('ComponentGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => ComponentGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
