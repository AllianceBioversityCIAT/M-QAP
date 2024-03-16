import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  MediaService,
  UploadFileResponse,
} from 'src/app/services/media.service';
import {LoaderService} from 'src/app/services/loader.service';

export const FileExtension = {
  word: '.doc, .docx',
  xcel: '.xlsx,.xls',
  powerpoint: '.ppt, .pptx',
  pdf: '.pdf',
};

@Component({
  selector: 'app-upload-file-material',
  templateUrl: './upload-file-material.component.html',
  styleUrls: ['./upload-file-material.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatTooltipModule,
  ],
})
export class UploadFileMaterialComponent {
  @Output() uploaded = new EventEmitter<UploadFileResponse>();
  @Output() accept = [FileExtension.xcel].join(', ');
  constructor(
    private mediaService: MediaService,
    private loaderService: LoaderService,
  ) {}

  fileSelected(input: any) {
    this.loaderService.open();
    const { files } = input.srcElement;

    const formData = new FormData();

    for (let i = 0; i < files.length; i++) {
      formData.append(`file-${i}`, files[i], files[i].name);
    }

    this.mediaService.upload(formData).subscribe((file) => {
      this.uploaded.emit(file);
      input.srcElement.value = ''; // to reset the input and emit the event when select the same file more than ones.;
      this.loaderService.close();
    });
  }
}
