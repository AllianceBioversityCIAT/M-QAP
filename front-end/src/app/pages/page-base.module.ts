import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatSelectModule} from '@angular/material/select';
import {MatTableModule} from '@angular/material/table';
import {PageContainerComponent} from '../share/page-container/page-container.component';
import {H1Component} from '../share/h1/h1.component';
import {UploadFileMaterialComponent} from '../share/upload-file-material/upload-file-material.component';
import {DeleteIconComponent} from '../share/delete-icon/delete-icon.component';
import {DialogLayoutComponent} from '../share/dialog-layout/dialog-layout.component';
import {EditIconComponent} from '../share/edit-icon/edit-icon.component';
import {InputComponent} from '../share/input/input.component';
import {OrganizationInputComponent} from '../share/organization-input/organization-input.component';
import {UserInputComponent} from '../share/user-input/user-input.component';
import {SnackBarModule} from '../share/snack-bar/snack-bar.module';
import {ErrorsComponent} from '../share/errors/errors.component';
import {MatTooltipModule} from '@angular/material/tooltip';

@NgModule({
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSelectModule,
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    UploadFileMaterialComponent,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    H1Component,
    PageContainerComponent,
    EditIconComponent,
    DeleteIconComponent,
    InputComponent,
    OrganizationInputComponent,
    UserInputComponent,
    MatFormFieldModule,
    MatInputModule,
    DialogLayoutComponent,
    SnackBarModule,
    ErrorsComponent,
  ],
  exports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSelectModule,
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    UploadFileMaterialComponent,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    H1Component,
    PageContainerComponent,
    EditIconComponent,
    DeleteIconComponent,
    InputComponent,
    OrganizationInputComponent,
    UserInputComponent,
    MatFormFieldModule,
    MatInputModule,
    DialogLayoutComponent,
    SnackBarModule,
    ErrorsComponent,
    MatTooltipModule,
  ],
})
export class PageBaseModule {
}
