import { TestBed } from '@angular/core/testing';

import { LoaderService } from './loader.service';
import { Observable } from 'rxjs';

describe('LoaderService', () => {
  let service: LoaderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoaderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('state$ should be a instance of Observable', () => {
    expect(service.state$).toBeInstanceOf(Observable);
  });

  it('state$ should be observable with true value', () => {
    service.open();
    service.state$.subscribe(value => expect(value).toBeTrue());
  });


  it('state$ should be observable with true value', () => {
    service.open();
    service.close();
    service.state$.subscribe(value => expect(value).toBeFalse());
  });
});
