import {ComponentFixture, TestBed} from '@angular/core/testing';

import {WosQuotaYearFormComponent} from './wos-quota-year-form.component';

describe('WosQuotaYearFormComponent', () => {
  let component: WosQuotaYearFormComponent;
  let fixture: ComponentFixture<WosQuotaYearFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WosQuotaYearFormComponent]
    });
    fixture = TestBed.createComponent(WosQuotaYearFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
