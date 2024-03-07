import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApiKeysFormComponent } from './api-keys-form.component';

describe('ApiKeysFormComponent', () => {
  let component: ApiKeysFormComponent;
  let fixture: ComponentFixture<ApiKeysFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ApiKeysFormComponent]
    });
    fixture = TestBed.createComponent(ApiKeysFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
