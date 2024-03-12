import {ComponentFixture, TestBed} from '@angular/core/testing';

import {WosQuotaFormComponent} from './wos-quota-form.component';

describe('WosQuotaFormComponent', () => {
  let component: WosQuotaFormComponent;
  let fixture: ComponentFixture<WosQuotaFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WosQuotaFormComponent]
    });
    fixture = TestBed.createComponent(WosQuotaFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
