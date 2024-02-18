import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TrainingCycleService } from './services/training-cycle.service';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { OrganizationsService } from './services/organizations.service';
import { PredictionsService } from './services/predictions.service';
import { NgSelectModule } from '@ng-select/ng-select';
import { CommoditiesService } from './services/commodities.service';
import { TrainingDataService } from './services/training-data.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { H1Component } from './share/h1/h1.component';
import { PageContainerComponent } from './share/page-container/page-container.component';
import { OrganizationInputComponent } from './share/organization-input/organization-input.component';
import { UploadFileMaterialComponent } from './share/upload-file-material/upload-file-material.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { DeleteIconComponent } from './share/delete-icon/delete-icon.component';
import { EditIconComponent } from './share/edit-icon/edit-icon.component';
import { AuthModule } from './pages/auth/auth.module';
import { DeleteConfirmDialogModule } from './share/delete-confirm-dialog/delete-confirm-dialog.module';
import { DialogLayoutComponent } from './share/dialog-layout/dialog-layout.component';
import { ContactUsDialogComponent } from './components/footer/contact-us-dialog/contact-us-dialog.component';
import { LoaderComponent } from './components/loader/loader.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HttpHeaderService } from './services/http-header.service';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    ContactUsDialogComponent,
    LoaderComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgSelectModule,
    OrganizationInputComponent,
    UploadFileMaterialComponent,
    MatFormFieldModule,
    H1Component,
    PageContainerComponent,
    DeleteConfirmDialogModule,
    MatIconModule,
    MatButtonModule,
    DeleteIconComponent,
    EditIconComponent,
    AuthModule,
    DialogLayoutComponent,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpHeaderService,
      multi: true,
    },
    TrainingCycleService,
    OrganizationsService,
    PredictionsService,
    TrainingDataService,
    CommoditiesService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
