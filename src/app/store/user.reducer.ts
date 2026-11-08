import { createReducer, on } from '@ngrx/store';
import * as UserActions from './user.actions';
import { initialUserState } from './user.state';

export const userReducer = createReducer(
  initialUserState,

  // ─── Load Profile ──────────────────────────────────────────────────────────

  on(UserActions.userLoadProfile, (state) => ({
    ...state,
    loading: 'pending' as const,
    error: null,
  })),
  on(UserActions.userLoadProfileSuccess, (state, { profile }) => ({
    ...state,
    profile,
    loading: 'success' as const,
    error: null,
  })),
  on(UserActions.userLoadProfileFailure, (state, { error }) => ({
    ...state,
    profile: null,
    loading: 'error' as const,
    error,
  })),

  // ─── Update Profile ────────────────────────────────────────────────────────

  on(UserActions.userUpdateProfile, (state) => ({
    ...state,
    loading: 'pending' as const,
    error: null,
  })),
  on(UserActions.userUpdateProfileSuccess, (state, { profile }) => ({
    ...state,
    profile,
    loading: 'success' as const,
    error: null,
  })),
  on(UserActions.userUpdateProfileFailure, (state, { error }) => ({
    ...state,
    loading: 'error' as const,
    error,
  })),

  // ─── Update Preferences ────────────────────────────────────────────────────

  on(UserActions.userUpdatePreferences, (state) => ({
    ...state,
    loading: 'pending' as const,
    error: null,
  })),
  on(UserActions.userUpdatePreferencesSuccess, (state, { preferences }) => ({
    ...state,
    preferences: { ...state.preferences, ...preferences },
    loading: 'success' as const,
    error: null,
  })),
  on(UserActions.userUpdatePreferencesFailure, (state, { error }) => ({
    ...state,
    loading: 'error' as const,
    error,
  })),

  // ─── Set Profile ───────────────────────────────────────────────────────────

  on(UserActions.userSetProfile, (state, { profile }) => ({
    ...state,
    profile,
  })),

  // ─── Clear ─────────────────────────────────────────────────────────────────

  on(UserActions.userClearProfile, (state) => ({
    ...state,
    profile: null,
    preferences: initialUserState.preferences,
    loading: 'idle' as const,
    error: null,
  })),

  on(UserActions.userClearError, (state) => ({
    ...state,
    error: null,
  })),
);
