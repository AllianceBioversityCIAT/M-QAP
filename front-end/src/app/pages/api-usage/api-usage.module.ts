import {NgModule} from '@angular/core';
import {ApiUsageComponent} from './api-usage.component';
import {ApiKeysPageRoutingModule} from './api-usage-page-routing.module';
import {PageBaseModule} from '../page-base.module';
import {NgSelectModule} from '@ng-select/ng-select';
import {ApiUsageTableComponent} from './api-usage-table/api-usage-table.component'
import {ApiUsageDetailsTableComponent} from './api-usage-details-table/api-usage-details-table.component'
import {CounterComponent} from 'src/app/share/counter/counter.component';
import {ChartModule} from 'angular-highcharts';

@NgModule({
  declarations: [
    ApiUsageComponent,
    ApiUsageTableComponent,
    ApiUsageDetailsTableComponent,
  ],
  imports: [ApiKeysPageRoutingModule, PageBaseModule, NgSelectModule, CounterComponent, ChartModule]
})
export class ApiUsageModule {
}
