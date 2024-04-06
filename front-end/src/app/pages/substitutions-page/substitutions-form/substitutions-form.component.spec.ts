import {ComponentFixture, TestBed} from '@angular/core/testing';

import {SubstitutionsFormComponent} from './substitutions-form.component';

describe('SubstitutionsFormComponent', () => {
  let component: SubstitutionsFormComponent;
  let fixture: ComponentFixture<SubstitutionsFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SubstitutionsFormComponent]
    });
    fixture = TestBed.createComponent(SubstitutionsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
