import {NgModule} from '@angular/core';

import {HomePageRoutingModule} from './home-page-routing.module';
import {HomePageComponent} from './home-page.component';
import {ChartModule} from 'angular-highcharts';
import {CounterComponent} from 'src/app/share/counter/counter.component';
import {PageBaseModule} from '../page-base.module';
import {NgSelectModule} from '@ng-select/ng-select';

@NgModule({
  declarations: [HomePageComponent],
  imports: [
    HomePageRoutingModule,
    ChartModule,
    CounterComponent,
    PageBaseModule,
    NgSelectModule,
  ],

})
export class HomePageModule {
}
