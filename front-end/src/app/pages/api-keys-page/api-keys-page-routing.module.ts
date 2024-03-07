import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ApiKeysPageComponent} from './api-keys-page.component';

const routes: Routes = [
  {
    path: '',
    component: ApiKeysPageComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ApiKeysPageRoutingModule {
}
