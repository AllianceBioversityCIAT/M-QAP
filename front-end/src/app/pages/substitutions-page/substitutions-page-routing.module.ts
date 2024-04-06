import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {SubstitutionsPageComponent} from './substitutions-page.component';

const routes: Routes = [
  {
    path: '',
    component: SubstitutionsPageComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SubstitutionsPageRoutingModule {
}
