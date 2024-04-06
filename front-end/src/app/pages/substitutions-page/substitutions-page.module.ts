import {NgModule} from '@angular/core';
import {SubstitutionsPageComponent} from './substitutions-page.component';
import {SubstitutionsTableComponent} from './substitutions-table/substitutions-table.component';
import {SubstitutionsFormComponent} from './substitutions-form/substitutions-form.component';
import {PageBaseModule} from '../page-base.module';
import {SubstitutionsPageRoutingModule} from './substitutions-page-routing.module';
import {DeleteConfirmDialogModule} from '../../share/delete-confirm-dialog/delete-confirm-dialog.module';

@NgModule({
  declarations: [
    SubstitutionsPageComponent,
    SubstitutionsTableComponent,
    SubstitutionsFormComponent
  ],
  imports: [
    PageBaseModule,
    SubstitutionsPageRoutingModule,
    DeleteConfirmDialogModule,
  ]
})
export class SubstitutionsPageModule {
}
