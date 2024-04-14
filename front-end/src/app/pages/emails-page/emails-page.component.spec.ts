import {ComponentFixture, TestBed} from '@angular/core/testing';

import {EmailsPageComponent} from './emails-page.component';

describe('EmailsPageComponent', () => {
  let component: EmailsPageComponent;
  let fixture: ComponentFixture<EmailsPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EmailsPageComponent]
    });
    fixture = TestBed.createComponent(EmailsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
