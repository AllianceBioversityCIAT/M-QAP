import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadFileMaterialComponent } from './upload-file-material.component';
import { MediaService } from 'src/app/services/media.service';
import { delay, of } from 'rxjs';

describe('UploadFileComponent', () => {
  let component: UploadFileMaterialComponent;
  let fixture: ComponentFixture<UploadFileMaterialComponent>;

  beforeEach(async () => {
    const mediaServiceKeys: (keyof MediaService)[] = ['upload'];
    const mediaServiceMock = jasmine.createSpyObj(mediaServiceKeys);
    mediaServiceMock.upload.and.returnValue(
      of({
        fileName: 'path-to-file-name.ext',
      })
    );
    await TestBed.configureTestingModule({
      imports: [UploadFileMaterialComponent],
      providers: [{ provide: MediaService, useValue: mediaServiceMock }],
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

  it('fileSelected should return object contain fileName property', async () => {
    component.uploaded.subscribe((result) => {
      expect(result?.fileName).toBe('path-to-file-name.ext');
    });
    component.fileSelected({ srcElement: { files: [new Blob()], value: '' } });
  });

  it('when fileSelected called uploaded Observable 1 time', async () => {
    spyOn(component.uploaded, 'emit');
    component.fileSelected({ srcElement: { files: [new Blob()], value: '' } });
    expect(component.uploaded.emit).toHaveBeenCalledTimes(1);
  });

  it('when fileSelected called uploaded Observable should be emit value', async () => {
    spyOn(component.uploaded, 'emit');
    component.fileSelected({ srcElement: { files: [new Blob()], value: '' } });

    expect(component.uploaded.emit).toHaveBeenCalled();
    expect(component.uploaded.emit).toHaveBeenCalledWith({
      fileName: 'path-to-file-name.ext',
    });
  });
});
