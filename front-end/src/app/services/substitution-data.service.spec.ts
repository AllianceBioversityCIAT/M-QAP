import {TestBed} from '@angular/core/testing';

import {SubstitutionDataService} from './substitution-data.service';

describe('SubstitutionDataService', () => {
  let service: SubstitutionDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SubstitutionDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
