import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {EmailsPageComponent} from './emails-page.component';

const routes: Routes = [
  {
    path: '',
    component: EmailsPageComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EmailsPageRoutingModule {
}
