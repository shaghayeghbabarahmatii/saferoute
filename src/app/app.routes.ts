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
    path: 'profile',
    loadComponent: () =>
      import('./features/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [authGuard]
  },

  { path: '**', redirectTo: 'login' }
];
