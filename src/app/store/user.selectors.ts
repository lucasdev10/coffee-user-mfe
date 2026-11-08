import { createFeatureSelector, createSelector } from '@ngrx/store';
import { IUserState } from './user.state';

export const selectUserState = createFeatureSelector<IUserState>('user');

export const selectUserProfile = createSelector(selectUserState, (state) => state.profile);

export const selectUserPreferences = createSelector(
  selectUserState,
  (state) => state.preferences,
);

export const selectUserLoading = createSelector(selectUserState, (state) => state.loading);

export const selectUserIsLoading = createSelector(
  selectUserState,
  (state) => state.loading === 'pending',
);

export const selectUserError = createSelector(selectUserState, (state) => state.error);

export const selectUserTheme = createSelector(
  selectUserPreferences,
  (preferences) => preferences?.theme ?? 'light',
);

export const selectUserLanguage = createSelector(
  selectUserPreferences,
  (preferences) => preferences?.language ?? 'en',
);

export const selectUserNotifications = createSelector(
  selectUserPreferences,
  (preferences) => preferences?.notifications ?? true,
);
