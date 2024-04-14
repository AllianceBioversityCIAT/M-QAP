import {ComponentFixture, TestBed} from '@angular/core/testing';

import {EmailTableComponent} from './email-table.component';

describe('EmailTableComponent', () => {
  let component: EmailTableComponent;
  let fixture: ComponentFixture<EmailTableComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EmailTableComponent]
    });
    fixture = TestBed.createComponent(EmailTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
