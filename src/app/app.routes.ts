import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  {
    path: 'home',
    loadComponent: () =>
      import('./features/home/home.component').then(m => m.HomeComponent)
  },

  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/auth.component').then(m => m.AuthComponent)
  },

  {
    path: 'map',
    loadComponent: () =>
      import('./features/map/map.component').then(m => m.MapComponent),
    canActivate: [authGuard]
  },

  {
    path: 'report',
    loadComponent: () =>
      import('./features/report/report.component').then(m => m.ReportComponent),
    canActivate: [authGuard]
  },

  {
    path: 'report-detail/:id',
    loadComponent: () =>
      import('./features/report-detail/report-detail.component').then(m => m.ReportDetailComponent),
    canActivate: [authGuard]
  },

  {
    path: 'safe-route',
    loadComponent: () =>
      import('./features/safe-route/safe-route.component').then(m => m.SafeRouteComponent),
    canActivate: [authGuard]
  },

  {
    path: 'profile',
    loadComponent: () =>
      import('./features/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [authGuard]
  },

  { path: '**', redirectTo: 'home' }
];
