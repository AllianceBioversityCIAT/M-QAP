import {ComponentFixture, TestBed} from '@angular/core/testing';

import {WosQuotaYearTableComponent} from './wos-quota-year-table.component';

describe('WosQuotaYearTableComponent', () => {
  let component: WosQuotaYearTableComponent;
  let fixture: ComponentFixture<WosQuotaYearTableComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WosQuotaYearTableComponent]
    });
    fixture = TestBed.createComponent(WosQuotaYearTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
