import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminGuard } from './guards/admin.guard';
import { AuthGuard } from './guards/auth.guard';

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
    canActivate: [AdminGuard],
    path: 'training-data',
    loadChildren: () =>
      import('./pages/training-data-page/training-data-page.module').then(
        (m) => m.TrainingDataPageModule
      ),
  },
  {
    canActivate: [AdminGuard],
    path: 'training-cycle',
    loadChildren: () =>
      import('./pages/training-cycle-page/training-cycle-page.module').then(
        (m) => m.TrainingCyclePageModule
      ),
  },
  {
    canActivate: [AdminGuard],
    path: 'predictions',
    loadChildren: () =>
      import('./pages/predictions-page/predictions-page.module').then(
        (m) => m.PredictionsPageModule
      ),
  },
  {
    canActivate: [AdminGuard],
    path: 'clarisa',
    loadChildren: () =>
      import('./pages/clarisa-page/clarisa-page.module').then(
        (m) => m.ClarisaPageModule
      ),
  },
  {
    canActivate: [AdminGuard],
    path: 'commodities',
    loadChildren: () =>
      import('./pages/commodities-page/commodities-page.module').then(
        (m) => m.CommoditiesPageModule
      ),
  },
  {
    canActivate: [AdminGuard],
    path: 'repositories',
    loadChildren: () =>
      import('./pages/repositories-page/repositories-page.module').then(
        (m) => m.RepositoriesPageModule
      ),
  },
  {
    canActivate: [AdminGuard],
    path: 'users',
    loadChildren: () =>
      import('./pages/users-page/users-page.module').then(
        (m) => m.UsersPageModule
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
export class AppRoutingModule {}
