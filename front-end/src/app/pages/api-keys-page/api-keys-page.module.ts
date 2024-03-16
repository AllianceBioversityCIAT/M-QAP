import {NgModule} from '@angular/core';
import {ApiKeysPageComponent} from './api-keys-page.component';
import {ApiKeysTableComponent} from './api-keys-table/api-keys-table.component';
import {ApiKeysFormComponent} from './api-keys-form/api-keys-form.component';
import {ApiKeysPageRoutingModule} from './api-keys-page-routing.module';
import {PageBaseModule} from '../page-base.module';
import {NgSelectModule} from '@ng-select/ng-select';
import {WosQuotaTableComponent} from './wos-quota-table/wos-quota-table.component';
import {WosQuotaFormComponent} from './wos-quota-form/wos-quota-form.component';
import {WosQuotaYearFormComponent} from './wos-quota-year-form/wos-quota-year-form.component';
import {WosQuotaYearTableComponent} from './wos-quota-year-table/wos-quota-year-table.component';

@NgModule({
  declarations: [
    ApiKeysPageComponent,
    ApiKeysTableComponent,
    ApiKeysFormComponent,
    WosQuotaTableComponent,
    WosQuotaFormComponent,
    WosQuotaYearFormComponent,
    WosQuotaYearTableComponent,
  ],
  imports: [PageBaseModule, ApiKeysPageRoutingModule, NgSelectModule]
})
export class ApiKeysPageModule {
}
