import {NgModule} from '@angular/core';
import {UsersPageComponent} from './users-page.component';
import {UsersTableComponent} from './users-table/users-table.component';
import {UsersFormComponent} from './users-form/users-form.component';
import {PageBaseModule} from '../page-base.module';
import {UsersPageRoutingModule} from './users-page-routing.module';
import {NgSelectModule} from '@ng-select/ng-select';

@NgModule({
  declarations: [UsersPageComponent, UsersTableComponent, UsersFormComponent],
  imports: [PageBaseModule, UsersPageRoutingModule, NgSelectModule]
})
export class UsersPageModule {
}
