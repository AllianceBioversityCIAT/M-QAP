import { ComponentFixture, TestBed } from '@angular/core/testing';

import { H1Component } from './h1.component';

xdescribe('H1Component', () => {
  let component: H1Component;
  let fixture: ComponentFixture<H1Component>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [H1Component]
    });
    fixture = TestBed.createComponent(H1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
