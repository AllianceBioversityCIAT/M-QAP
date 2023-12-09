import { TestBed } from '@angular/core/testing';

import { TrainingCycleService } from './training-cycle.service';

xdescribe('TrainingCycleService', () => {
  let service: TrainingCycleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TrainingCycleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
