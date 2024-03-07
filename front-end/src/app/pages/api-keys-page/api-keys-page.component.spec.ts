import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ApiKeysPageComponent} from './api-keys-page.component';

describe('ApiKeysPageComponent', () => {
  let component: ApiKeysPageComponent;
  let fixture: ComponentFixture<ApiKeysPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ApiKeysPageComponent]
    });
    fixture = TestBed.createComponent(ApiKeysPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
