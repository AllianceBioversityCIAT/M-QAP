import {NgModule} from '@angular/core';

import {HomePageRoutingModule} from './home-page-routing.module';
import {HomePageComponent} from './home-page.component';
import {ChartModule} from 'angular-highcharts';
import {CounterComponent} from 'src/app/share/counter/counter.component';
import {ApiUsageTableComponent} from './api-usage-table/api-usage-table.component';
import {PagePaseModule} from '../page-pase.module';
import {ApiUsageDetailsTableComponent} from './api-usage-details-table/api-usage-details-table.component';
import {NgSelectModule} from '@ng-select/ng-select';

@NgModule({
  declarations: [HomePageComponent, ApiUsageTableComponent, ApiUsageDetailsTableComponent],
  imports: [
    HomePageRoutingModule,
    ChartModule,
    CounterComponent,
    PagePaseModule,
    NgSelectModule,
  ],

})
export class HomePageModule {
}
