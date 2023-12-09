import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClarisaPageComponent } from './clarisa-page.component';

xdescribe('ClarisaPageComponent', () => {
  let component: ClarisaPageComponent;
  let fixture: ComponentFixture<ClarisaPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ClarisaPageComponent]
    });
    fixture = TestBed.createComponent(ClarisaPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
