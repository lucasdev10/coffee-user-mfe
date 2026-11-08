import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchError, map, of, switchMap } from 'rxjs';
import { UserRepository } from '../repositories/user.repository';
import * as UserActions from './user.actions';

/**
 * User MFE NgRx Effects.
 *
 * Responsibilities:
 * 1. Handle async loadProfile / updateProfile / updatePreferences via UserRepository.
 * 2. After successful mutations, dispatch the corresponding global Shell user actions
 *    so the singleton NgRx store (shared via Module Federation) stays in sync.
 *
 * NOTE: The Shell App provides the NgRx Store as a singleton shared dependency via
 * Module Federation. When the User MFE injects `Store`, it receives the SAME store
 * instance as the Shell, so dispatching plain-object actions reaches global reducers.
 *
 * Global action type strings verified from:
 *   CoffeeWorkshop/src/app/core/store/user/user.actions.ts
 *
 * Requirements: 6.3, 6.4, 10.8
 */
@Injectable()
export class UserEffects {
  private readonly actions$ = inject(Actions);
  private readonly repository = inject(UserRepository);
  private readonly store = inject(Store);

  // ─── Load Profile ───────────────────────────────────────────────────────────

  loadProfile$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.userLoadProfile),
      switchMap(({ userId }) =>
        this.repository.getProfile(userId).pipe(
          map((profile) => UserActions.userLoadProfileSuccess({ profile })),
          catchError((error) =>
            of(UserActions.userLoadProfileFailure({ error: error.message ?? 'Failed to load profile' })),
          ),
        ),
      ),
    ),
  );

  // ─── Update Profile ─────────────────────────────────────────────────────────

  updateProfile$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.userUpdateProfile),
      switchMap(({ changes }) => {
        // Resolve userId from stored auth token / profile (best-effort)
        const userId = this.resolveCurrentUserId();
        return this.repository.updateProfile(userId, changes).pipe(
          map((profile) => {
            // Sync to global Shell store (req 10.8)
            this.dispatchGlobalUpdateProfile(profile);
            return UserActions.userUpdateProfileSuccess({ profile });
          }),
          catchError((error) =>
            of(UserActions.userUpdateProfileFailure({ error: error.message ?? 'Failed to update profile' })),
          ),
        );
      }),
    ),
  );

  // ─── Update Preferences ─────────────────────────────────────────────────────

  updatePreferences$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.userUpdatePreferences),
      switchMap(({ preferences }) => {
        const userId = this.resolveCurrentUserId();
        return this.repository.updatePreferences(userId, preferences).pipe(
          map((updatedPreferences) => {
            // Sync to global Shell store (req 10.8)
            this.dispatchGlobalUpdatePreferences(updatedPreferences);
            return UserActions.userUpdatePreferencesSuccess({ preferences: updatedPreferences });
          }),
          catchError((error) =>
            of(UserActions.userUpdatePreferencesFailure({ error: error.message ?? 'Failed to update preferences' })),
          ),
        );
      }),
    ),
  );

  // ─── Private helpers ────────────────────────────────────────────────────────

  /**
   * Resolve the currently authenticated user ID from localStorage.
   * Falls back to a placeholder when no auth session is available
   * (e.g. standalone dev or test environments).
   */
  private resolveCurrentUserId(): string {
    try {
      const stored = localStorage.getItem('auth_user');
      if (stored) {
        const user = JSON.parse(stored) as { id?: string };
        if (user?.id) return user.id;
      }
    } catch {
      // noop — fall through to default
    }
    return 'user-001';
  }

  /**
   * Dispatch to the global Shell user slice.
   *
   * The Shell App shares the NgRx Store as a singleton via Module Federation.
   * We use plain `{ type }` action objects to avoid a hard compile-time dependency
   * on the Shell's codebase.  The reducer registered under 'userGlobal' will handle them.
   *
   * Action type strings match those defined in:
   *   CoffeeWorkshop/src/app/core/store/user/user.actions.ts
   */
  private dispatchGlobalUpdateProfile(profile: object): void {
    this.store.dispatch({
      type: '[User] Update Profile Success',
      profile,
    });
  }

  private dispatchGlobalUpdatePreferences(preferences: object): void {
    this.store.dispatch({
      type: '[User] Update Preferences Success',
      preferences,
    });
  }
}
