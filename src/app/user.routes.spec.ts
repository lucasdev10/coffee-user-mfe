import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { firstValueFrom } from 'rxjs';
import { describe, beforeEach, it, expect, vi } from 'vitest';
import { userAuthGuard, USER_ROUTES } from './user.routes';
import { ProfilePageComponent } from './pages/profile-page/profile-page';
import { SettingsPageComponent } from './pages/settings-page/settings-page';

describe('User Routes', () => {
  describe('USER_ROUTES Configuration', () => {
    it('should define exactly two routes', () => {
      expect(USER_ROUTES.length).toBe(2);
    });

    it('should map "profile" path to ProfilePageComponent with auth guard', () => {
      const profileRoute = USER_ROUTES.find((r) => r.path === 'profile');
      expect(profileRoute).toBeDefined();
      expect(profileRoute?.component).toBe(ProfilePageComponent);
      expect(profileRoute?.canActivate).toBeDefined();
      expect(profileRoute?.canActivate).toContain(userAuthGuard);
    });

    it('should map "settings" path to SettingsPageComponent with auth guard', () => {
      const settingsRoute = USER_ROUTES.find((r) => r.path === 'settings');
      expect(settingsRoute).toBeDefined();
      expect(settingsRoute?.component).toBe(SettingsPageComponent);
      expect(settingsRoute?.canActivate).toBeDefined();
      expect(settingsRoute?.canActivate).toContain(userAuthGuard);
    });

    it('should export userAuthGuard as a function', () => {
      expect(typeof userAuthGuard).toBe('function');
    });

    it('should protect all routes with the auth guard', () => {
      const guardedRoutes = USER_ROUTES.filter((r) => r.canActivate);
      expect(guardedRoutes.length).toBe(USER_ROUTES.length);
      guardedRoutes.forEach((route) => {
        expect(route.canActivate).toContain(userAuthGuard);
      });
    });
  });

  describe('userAuthGuard - Authentication Logic', () => {
    let store: MockStore;
    let router: Router;

    const authenticatedState = {
      authGlobal: {
        user: { id: '1', name: 'Test User', email: 'user@test.com', role: 'USER' },
        isAuthenticated: true,
        token: 'mock-token',
        refreshToken: null,
        loading: false,
        error: null,
      },
    };

    const unauthenticatedState = {
      authGlobal: {
        user: null,
        isAuthenticated: false,
        token: null,
        refreshToken: null,
        loading: false,
        error: null,
      },
    };

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          provideMockStore({ initialState: unauthenticatedState }),
        ],
      });

      store = TestBed.inject(MockStore);
      router = TestBed.inject(Router);
    });

    it('should allow access when user is authenticated', async () => {
      store.setState(authenticatedState);

      const result = await firstValueFrom(
        TestBed.runInInjectionContext(() =>
          userAuthGuard({} as any, {} as any),
        ) as any,
      );

      expect(result).toBe(true);
    });

    it('should deny access when user is not authenticated', async () => {
      store.setState(unauthenticatedState);

      const navigateSpy = vi.spyOn(router, 'navigate');

      const result = await firstValueFrom(
        TestBed.runInInjectionContext(() =>
          userAuthGuard({} as any, {} as any),
        ) as any,
      );

      expect(result).toBe(false);
      expect(navigateSpy).toHaveBeenCalledWith(['/auth/login']);
    });

    it('should redirect to /auth/login when not authenticated', async () => {
      store.setState(unauthenticatedState);

      const navigateSpy = vi.spyOn(router, 'navigate');

      await firstValueFrom(
        TestBed.runInInjectionContext(() =>
          userAuthGuard({} as any, {} as any),
        ) as any,
      );

      expect(navigateSpy).toHaveBeenCalledWith(['/auth/login']);
      expect(navigateSpy).toHaveBeenCalledTimes(1);
    });

    it('should deny access when authGlobal state is missing', async () => {
      store.setState({} as any);

      const navigateSpy = vi.spyOn(router, 'navigate');

      const result = await firstValueFrom(
        TestBed.runInInjectionContext(() =>
          userAuthGuard({} as any, {} as any),
        ) as any,
      );

      expect(result).toBe(false);
      expect(navigateSpy).toHaveBeenCalledWith(['/auth/login']);
    });

    it('should work with global store shared from Shell App via Module Federation', async () => {
      store.setState(authenticatedState);

      const result = await firstValueFrom(
        TestBed.runInInjectionContext(() =>
          userAuthGuard({} as any, {} as any),
        ) as any,
      );

      expect(result).toBe(true);
    });

    it('should deny access when isAuthenticated is false even with user object present', async () => {
      store.setState({
        authGlobal: {
          user: { id: '1', name: 'Test', email: 'test@test.com', role: 'USER' },
          isAuthenticated: false,
          token: null,
          refreshToken: null,
          loading: false,
          error: null,
        },
      });

      const navigateSpy = vi.spyOn(router, 'navigate');

      const result = await firstValueFrom(
        TestBed.runInInjectionContext(() =>
          userAuthGuard({} as any, {} as any),
        ) as any,
      );

      expect(result).toBe(false);
      expect(navigateSpy).toHaveBeenCalledWith(['/auth/login']);
    });
  });
});
