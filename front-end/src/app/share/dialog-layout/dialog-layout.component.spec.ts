import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogLayoutComponent } from './dialog-layout.component';

xdescribe('DialogLayoutComponent', () => {
  let component: DialogLayoutComponent;
  let fixture: ComponentFixture<DialogLayoutComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DialogLayoutComponent]
    });
    fixture = TestBed.createComponent(DialogLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
