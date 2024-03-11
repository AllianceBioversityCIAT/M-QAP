import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ApiUsageDetailsTableComponent} from './api-usage-details-table.component';

describe('ApiUsageDetailsTableComponent', () => {
  let component: ApiUsageDetailsTableComponent;
  let fixture: ComponentFixture<ApiUsageDetailsTableComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ApiUsageDetailsTableComponent]
    });
    fixture = TestBed.createComponent(ApiUsageDetailsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
