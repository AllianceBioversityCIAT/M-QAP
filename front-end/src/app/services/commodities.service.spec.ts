import { TestBed } from '@angular/core/testing';

import { CommoditiesService } from './commodities.service';

xdescribe('CommoditiesService', () => {
  let service: CommoditiesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CommoditiesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
