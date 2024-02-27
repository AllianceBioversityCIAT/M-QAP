import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {RepositoriesPageComponent} from './repositories-page.component';

const routes: Routes = [
  {
    path: '',
    component: RepositoriesPageComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RepositoriesPageRoutingModule {
}
