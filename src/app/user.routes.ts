import { inject } from '@angular/core';
import { CanActivateFn, Router, Routes } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, take } from 'rxjs/operators';
import { ProfilePageComponent } from './pages/profile-page/profile-page';
import { SettingsPageComponent } from './pages/settings-page/settings-page';

/**
 * Functional auth guard for User MFE protected routes.
 *
 * Injects the global NgRx Store — shared as a singleton via Module Federation
 * from the Shell App — and verifies authentication via the 'authGlobal' slice.
 *
 * The 'authGlobal' feature key matches the Shell App's global auth reducer
 * registered in CoffeeWorkshop/src/app/core/store/auth/auth.reducer.ts.
 *
 * Requirements: 6.11
 */
export const userAuthGuard: CanActivateFn = (_route, _state) => {
  const store = inject(Store);
  const router = inject(Router);

  return store
    .select((appState: any) => {
      // Access the global auth state from the Shell's singleton store.
      // Falls back gracefully when running in standalone / test mode.
      const authGlobal = appState.authGlobal;
      return !!authGlobal?.isAuthenticated;
    })
    .pipe(
      take(1),
      map((isAuthenticated) => {
        if (isAuthenticated) {
          return true;
        }
        // Redirect to login when not authenticated (req 6.11)
        router.navigate(['/auth/login']);
        return false;
      }),
    );
};

/**
 * User MFE routes exposed via Module Federation.
 *
 * These routes are consumed by the Shell App at /user/*.
 * Both routes are protected by userAuthGuard which verifies authentication
 * via the shared NgRx Store singleton.
 *
 * Requirements: 6.5, 6.11
 */
export const USER_ROUTES: Routes = [
  {
    path: 'profile',
    component: ProfilePageComponent,
    canActivate: [userAuthGuard],
  },
  {
    path: 'settings',
    component: SettingsPageComponent,
    canActivate: [userAuthGuard],
  },
];
