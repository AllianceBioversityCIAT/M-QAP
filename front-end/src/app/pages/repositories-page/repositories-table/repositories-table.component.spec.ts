import {ComponentFixture, TestBed} from '@angular/core/testing';

import {RepositoriesTableComponent} from './repositories-table.component';

xdescribe('RepositoriesTableComponent', () => {
  let component: RepositoriesTableComponent;
  let fixture: ComponentFixture<RepositoriesTableComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RepositoriesTableComponent]
    });
    fixture = TestBed.createComponent(RepositoriesTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
