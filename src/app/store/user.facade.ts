import { inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { IUser, IUpdateUserDto } from '../models/user.model';
import { IUserState, IUserPreferences } from './user.state';
import * as UserActions from './user.actions';
import {
  selectUserError,
  selectUserIsLoading,
  selectUserPreferences,
  selectUserProfile,
  selectUserTheme,
  selectUserLanguage,
  selectUserNotifications,
} from './user.selectors';

/**
 * UserFacade — public surface for pages to interact with the User NgRx store.
 *
 * Pages only reference the facade; they never import store internals directly.
 *
 * Requirements: 6.3, 6.4, 10.8
 */
@Injectable({ providedIn: 'root' })
export class UserFacade {
  private readonly store = inject(Store<{ user: IUserState }>);

  // ─── Selectors ─────────────────────────────────────────────────────────────

  readonly profile$: Observable<IUser | null> = this.store.select(selectUserProfile);
  readonly preferences$: Observable<IUserPreferences> = this.store.select(selectUserPreferences);
  readonly isLoading$: Observable<boolean> = this.store.select(selectUserIsLoading);
  readonly error$: Observable<string | null> = this.store.select(selectUserError);
  readonly theme$: Observable<'light' | 'dark'> = this.store.select(selectUserTheme);
  readonly language$: Observable<string> = this.store.select(selectUserLanguage);
  readonly notifications$: Observable<boolean> = this.store.select(selectUserNotifications);

  // ─── Commands ──────────────────────────────────────────────────────────────

  /** Load a user profile by ID from the repository. */
  loadProfile(userId: string): void {
    this.store.dispatch(UserActions.userLoadProfile({ userId }));
  }

  /**
   * Dispatch updateProfile action — UserEffects will call the repository and
   * synchronize with the global Shell store. (Requirement 10.8)
   */
  updateProfile(changes: IUpdateUserDto): void {
    this.store.dispatch(UserActions.userUpdateProfile({ changes }));
  }

  /**
   * Dispatch updatePreferences action — UserEffects will call the repository and
   * synchronize with the global Shell store. (Requirement 10.8)
   */
  updatePreferences(preferences: Partial<IUserPreferences>): void {
    this.store.dispatch(UserActions.userUpdatePreferences({ preferences }));
  }

  /** Set the profile directly (e.g. on auth hydration from the Shell). */
  setProfile(profile: IUser): void {
    this.store.dispatch(UserActions.userSetProfile({ profile }));
  }

  /** Clear profile and reset preferences to defaults. */
  clearProfile(): void {
    this.store.dispatch(UserActions.userClearProfile());
  }

  /** Clear any displayed error message. */
  clearError(): void {
    this.store.dispatch(UserActions.userClearError());
  }
}
