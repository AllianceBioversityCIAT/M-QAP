import { TestBed } from '@angular/core/testing';

import { PredictionsService } from './predictions.service';

xdescribe('PredictionsService', () => {
  let service: PredictionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PredictionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
