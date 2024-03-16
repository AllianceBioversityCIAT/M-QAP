import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ApiUsageTableComponent} from './api-usage-table.component';

describe('ApiUsageTableComponent', () => {
  let component: ApiUsageTableComponent;
  let fixture: ComponentFixture<ApiUsageTableComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ApiUsageTableComponent]
    });
    fixture = TestBed.createComponent(ApiUsageTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
