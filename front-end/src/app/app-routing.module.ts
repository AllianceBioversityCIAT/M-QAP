import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AuthGuard} from './guards/auth.guard';
import {ComponentGuard} from './guards/component.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'license',
    loadChildren: () =>
      import('./pages/license-page/license-page.module').then(
        (m) => m.LicensePageModule
      ),
  },
  {
    canActivate: [AuthGuard],
    path: 'home',
    loadChildren: () =>
      import('./pages/home-page/home-page.module').then(
        (m) => m.HomePageModule
      ),
  },
  {
    canActivate: [ComponentGuard],
    path: 'training-data',
    data: {roles: ['admin']},
    loadChildren: () =>
      import('./pages/training-data-page/training-data-page.module').then(
        (m) => m.TrainingDataPageModule
      ),
  },
  {
    canActivate: [ComponentGuard],
    path: 'substitution-data',
    data: {roles: ['admin']},
    loadChildren: () =>
      import('./pages/substitutions-page/substitutions-page.module').then(
        (m) => m.SubstitutionsPageModule
      ),
  },
  {
    canActivate: [ComponentGuard],
    path: 'training-cycle',
    data: {roles: ['admin']},
    loadChildren: () =>
      import('./pages/training-cycle-page/training-cycle-page.module').then(
        (m) => m.TrainingCyclePageModule
      ),
  },
  {
    canActivate: [ComponentGuard],
    path: 'predictions',
    data: {roles: ['admin']},
    loadChildren: () =>
      import('./pages/predictions-page/predictions-page.module').then(
        (m) => m.PredictionsPageModule
      ),
  },
  {
    canActivate: [AuthGuard],
    path: 'clarisa',
    loadChildren: () =>
      import('./pages/clarisa-page/clarisa-page.module').then(
        (m) => m.ClarisaPageModule
      ),
  },
  {
    canActivate: [AuthGuard],
    path: 'commodities',
    loadChildren: () =>
      import('./pages/commodities-page/commodities-page.module').then(
        (m) => m.CommoditiesPageModule
      ),
  },
  {
    canActivate: [ComponentGuard],
    path: 'repositories',
    data: {roles: ['admin']},
    loadChildren: () =>
      import('./pages/repositories-page/repositories-page.module').then(
        (m) => m.RepositoriesPageModule
      ),
  },
  {
    canActivate: [ComponentGuard],
    path: 'users',
    data: {roles: ['admin']},
    loadChildren: () =>
      import('./pages/users-page/users-page.module').then(
        (m) => m.UsersPageModule
      ),
  },
  {
    canActivate: [ComponentGuard],
    path: 'emails',
    data: {roles: ['admin']},
    loadChildren: () =>
      import('./pages/emails-page/emails-page.module').then(
        (m) => m.EmailsPageModule
      ),
  },
  {
    canActivate: [AuthGuard],
    // canActivate: [ComponentGuard],
    path: 'api-keys',
    // data: {roles: ['admin'], responsibilities: ['quotaResponsible']},
    loadChildren: () =>
      import('./pages/api-keys-page/api-keys-page.module').then(
        (m) => m.ApiKeysPageModule
      ),
  },
  {
    canActivate: [AuthGuard],
    // canActivate: [ComponentGuard],
    path: 'api-usage',
    // data: {roles: ['admin'], responsibilities: ['quotaResponsible']},
    loadChildren: () =>
      import('./pages/api-usage/api-usage.module').then(
        (m) => m.ApiUsageModule
      ),
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./pages/auth/auth.module').then((m) => m.AuthModule),
  },
  {
    path: '**',
    loadChildren: () =>
      import('./pages/not-found-page/not-found-page-routing.module').then(
        (m) => m.NotFoundPageRoutingModule
      ),
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      scrollPositionRestoration: 'top',
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {
}
