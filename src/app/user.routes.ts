import { Routes } from '@angular/router';

export const USER_ROUTES: Routes = [
  {
    path: 'profile',
    loadComponent: () =>
      import('./pages/profile-page/profile-page').then((c) => c.ProfilePageComponent),
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./pages/settings-page/settings-page').then((c) => c.SettingsPageComponent),
  },
];
