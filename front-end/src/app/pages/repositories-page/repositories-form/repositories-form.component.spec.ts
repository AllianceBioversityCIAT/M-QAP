import {ComponentFixture, TestBed} from '@angular/core/testing';

import {RepositoriesFormComponent} from './repositories-form.component';

xdescribe('RepositoriesFormComponent', () => {
  let component: RepositoriesFormComponent;
  let fixture: ComponentFixture<RepositoriesFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RepositoriesFormComponent]
    });
    fixture = TestBed.createComponent(RepositoriesFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
