import {NgModule} from '@angular/core';
import {EmailsPageComponent} from './emails-page.component';
import {PageBaseModule} from '../page-base.module';
import {EmailsPageRoutingModule} from './emails-page-routing.module';
import {NgSelectModule} from '@ng-select/ng-select';
import {EmailBodyComponent} from './email-body/email-body.component';
import {EmailTableComponent} from './email-table/email-table.component';


@NgModule({
  declarations: [EmailsPageComponent, EmailBodyComponent, EmailTableComponent],
  imports: [PageBaseModule, EmailsPageRoutingModule, NgSelectModule]
})
export class EmailsPageModule {
}
