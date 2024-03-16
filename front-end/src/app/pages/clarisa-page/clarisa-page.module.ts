import {NgModule} from '@angular/core';
import {ClarisaPageComponent} from './clarisa-page.component';
import {ClarisaTableComponent} from './clarisa-table/clarisa-table.component';
import {PageBaseModule} from '../page-base.module';
import {ClarisaPageRoutingModule} from './clarisa-page-routing.module';

@NgModule({
  declarations: [ClarisaPageComponent, ClarisaTableComponent],
  imports: [PageBaseModule, ClarisaPageRoutingModule],
})
export class ClarisaPageModule {
}
