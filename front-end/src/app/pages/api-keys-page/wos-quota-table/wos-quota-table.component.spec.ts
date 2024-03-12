import {ComponentFixture, TestBed} from '@angular/core/testing';

import {WosQuotaTableComponent} from './wos-quota-table.component';

describe('WosQuotaTableComponent', () => {
  let component: WosQuotaTableComponent;
  let fixture: ComponentFixture<WosQuotaTableComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WosQuotaTableComponent]
    });
    fixture = TestBed.createComponent(WosQuotaTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
