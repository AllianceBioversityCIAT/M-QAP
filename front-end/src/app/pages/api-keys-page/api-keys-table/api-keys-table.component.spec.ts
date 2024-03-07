import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApiKeysTableComponent } from './api-keys-table.component';

describe('ApiKeysTableComponent', () => {
  let component: ApiKeysTableComponent;
  let fixture: ComponentFixture<ApiKeysTableComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ApiKeysTableComponent]
    });
    fixture = TestBed.createComponent(ApiKeysTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
