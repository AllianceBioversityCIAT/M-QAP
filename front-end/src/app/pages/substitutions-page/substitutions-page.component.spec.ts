import {ComponentFixture, TestBed} from '@angular/core/testing';

import {SubstitutionsPageComponent} from './substitutions-page.component';

describe('SubstitutionsPageComponent', () => {
  let component: SubstitutionsPageComponent;
  let fixture: ComponentFixture<SubstitutionsPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SubstitutionsPageComponent]
    });
    fixture = TestBed.createComponent(SubstitutionsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
