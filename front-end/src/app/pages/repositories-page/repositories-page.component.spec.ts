import {ComponentFixture, TestBed} from '@angular/core/testing';

import {RepositoriesPageComponent} from './repositories-page.component';

xdescribe('RepositoriesPageComponent', () => {
  let component: RepositoriesPageComponent;
  let fixture: ComponentFixture<RepositoriesPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RepositoriesPageComponent]
    });
    fixture = TestBed.createComponent(RepositoriesPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
