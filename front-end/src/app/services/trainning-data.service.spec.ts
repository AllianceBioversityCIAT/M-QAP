import { TestBed } from '@angular/core/testing';

import { TrainingDataService } from './training-data.service';

xdescribe('TrainingDataService', () => {
  let service: TrainingDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TrainingDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
