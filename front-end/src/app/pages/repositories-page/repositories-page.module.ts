import {NgModule} from '@angular/core';
import {RepositoriesPageComponent} from './repositories-page.component';
import {RepositoriesTableComponent} from './repositories-table/repositories-table.component';
import {PageBaseModule} from '../page-base.module';
import {RepositoriesPageRoutingModule} from './repositories-page-routing.module';
import {RepositoriesFormComponent} from './repositories-form/repositories-form.component';
import {SchemaFormComponent} from './schema-form/schema-form.component';
import {NgSelectModule} from '@ng-select/ng-select';

@NgModule({
  declarations: [RepositoriesPageComponent, RepositoriesTableComponent, RepositoriesFormComponent, SchemaFormComponent],
  imports: [PageBaseModule, RepositoriesPageRoutingModule, NgSelectModule],
})
export class RepositoriesPageModule {
}
