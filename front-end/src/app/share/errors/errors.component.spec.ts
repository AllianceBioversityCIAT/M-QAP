import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrorsComponent } from './errors.component';

xdescribe('ErrorsComponent', () => {
  let component: ErrorsComponent;
  let fixture: ComponentFixture<ErrorsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ErrorsComponent]
    });
    fixture = TestBed.createComponent(ErrorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
