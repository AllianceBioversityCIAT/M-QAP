import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ApiUsageComponent} from './api-usage.component';

const routes: Routes = [
  {
    path: '',
    component: ApiUsageComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ApiKeysPageRoutingModule {
}
