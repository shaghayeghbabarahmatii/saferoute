import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  {
    path: 'login',
    loadComponent: () =>
      import('./auth/auth.component').then(m => m.AuthComponent)
  },

  {
    path: 'map',
    loadComponent: () =>
      import('./map/map.component').then(m => m.MapComponent),
    canActivate: [authGuard]
  },

  {
    path: 'report',
    loadComponent: () =>
      import('./report/report.component').then(m => m.ReportComponent),
    canActivate: [authGuard]
  },

  {
    path: 'profile',
    loadComponent: () =>
      import('./profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [authGuard]
  },

  { path: '**', redirectTo: 'login' }
];
