import { TestBed } from '@angular/core/testing';

import { MediaService } from './media.service';

xdescribe('MediaService', () => {
  let service: MediaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MediaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });


  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
