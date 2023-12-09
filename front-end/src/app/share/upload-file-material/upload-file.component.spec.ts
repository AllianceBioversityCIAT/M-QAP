import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadFileMaterialComponent } from './upload-file-material.component';

xdescribe('UploadFileComponent', () => {
  let component: UploadFileMaterialComponent;
  let fixture: ComponentFixture<UploadFileMaterialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UploadFileMaterialComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UploadFileMaterialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
