import {NgModule} from '@angular/core';
import {ApiKeysPageComponent} from './api-keys-page.component';
import {ApiKeysTableComponent} from './api-keys-table/api-keys-table.component';
import {ApiKeysFormComponent} from './api-keys-form/api-keys-form.component';
import {ApiKeysPageRoutingModule} from './api-keys-page-routing.module';
import {PagePaseModule} from '../page-pase.module';
import {NgSelectModule} from '@ng-select/ng-select';
import {MatTooltipModule} from '@angular/material/tooltip';


@NgModule({
  declarations: [ApiKeysPageComponent, ApiKeysTableComponent, ApiKeysFormComponent],
  imports: [PagePaseModule, ApiKeysPageRoutingModule, NgSelectModule, MatTooltipModule]
})
export class ApiKeysPageModule {
}
