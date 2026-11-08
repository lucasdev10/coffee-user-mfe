import { describe, it, expect } from 'vitest';
import { userReducer } from './user.reducer';
import { initialUserState } from './user.state';
import * as UserActions from './user.actions';
import { EUserRole } from '../models/user.model';

const MOCK_USER = {
  id: 'user-001',
  email: 'user@test.com',
  fullName: 'Test User',
  role: EUserRole.USER,
  createdAt: 1000,
  updatedAt: 1000,
};

const MOCK_PREFERENCES = {
  theme: 'dark' as const,
  language: 'pt',
  notifications: false,
};

describe('userReducer', () => {
  it('should return the initial state', () => {
    const state = userReducer(undefined, { type: '@@INIT' } as never);
    expect(state).toEqual(initialUserState);
  });

  // ─── Load Profile ──────────────────────────────────────────────────────────

  it('should set loading to pending on userLoadProfile', () => {
    const state = userReducer(initialUserState, UserActions.userLoadProfile({ userId: 'user-001' }));
    expect(state.loading).toBe('pending');
    expect(state.error).toBeNull();
  });

  it('should set profile and loading to success on userLoadProfileSuccess', () => {
    const state = userReducer(initialUserState, UserActions.userLoadProfileSuccess({ profile: MOCK_USER }));
    expect(state.profile).toEqual(MOCK_USER);
    expect(state.loading).toBe('success');
    expect(state.error).toBeNull();
  });

  it('should clear profile and set error on userLoadProfileFailure', () => {
    const state = userReducer(initialUserState, UserActions.userLoadProfileFailure({ error: 'Not found' }));
    expect(state.profile).toBeNull();
    expect(state.loading).toBe('error');
    expect(state.error).toBe('Not found');
  });

  // ─── Update Profile ────────────────────────────────────────────────────────

  it('should set loading to pending on userUpdateProfile', () => {
    const state = userReducer(initialUserState, UserActions.userUpdateProfile({ changes: { fullName: 'New Name' } }));
    expect(state.loading).toBe('pending');
    expect(state.error).toBeNull();
  });

  it('should update profile on userUpdateProfileSuccess', () => {
    const updated = { ...MOCK_USER, fullName: 'Updated Name' };
    const state = userReducer(initialUserState, UserActions.userUpdateProfileSuccess({ profile: updated }));
    expect(state.profile).toEqual(updated);
    expect(state.loading).toBe('success');
    expect(state.error).toBeNull();
  });

  it('should set error on userUpdateProfileFailure', () => {
    const state = userReducer(initialUserState, UserActions.userUpdateProfileFailure({ error: 'Update failed' }));
    expect(state.loading).toBe('error');
    expect(state.error).toBe('Update failed');
  });

  // ─── Update Preferences ────────────────────────────────────────────────────

  it('should set loading to pending on userUpdatePreferences', () => {
    const state = userReducer(initialUserState, UserActions.userUpdatePreferences({ preferences: MOCK_PREFERENCES }));
    expect(state.loading).toBe('pending');
    expect(state.error).toBeNull();
  });

  it('should merge preferences on userUpdatePreferencesSuccess', () => {
    const state = userReducer(
      initialUserState,
      UserActions.userUpdatePreferencesSuccess({ preferences: MOCK_PREFERENCES }),
    );
    expect(state.preferences.theme).toBe('dark');
    expect(state.preferences.language).toBe('pt');
    expect(state.preferences.notifications).toBe(false);
    // existing defaults should still be present
    expect(state.loading).toBe('success');
  });

  it('should set error on userUpdatePreferencesFailure', () => {
    const state = userReducer(
      initialUserState,
      UserActions.userUpdatePreferencesFailure({ error: 'Preferences failed' }),
    );
    expect(state.loading).toBe('error');
    expect(state.error).toBe('Preferences failed');
  });

  // ─── Set / Clear ───────────────────────────────────────────────────────────

  it('should set profile on userSetProfile', () => {
    const state = userReducer(initialUserState, UserActions.userSetProfile({ profile: MOCK_USER }));
    expect(state.profile).toEqual(MOCK_USER);
    // loading/error unchanged
    expect(state.loading).toBe('idle');
    expect(state.error).toBeNull();
  });

  it('should clear profile and reset preferences on userClearProfile', () => {
    const loaded = userReducer(initialUserState, UserActions.userLoadProfileSuccess({ profile: MOCK_USER }));
    const cleared = userReducer(loaded, UserActions.userClearProfile());
    expect(cleared.profile).toBeNull();
    expect(cleared.preferences).toEqual(initialUserState.preferences);
    expect(cleared.loading).toBe('idle');
    expect(cleared.error).toBeNull();
  });

  it('should clear error on userClearError', () => {
    const withError = userReducer(initialUserState, UserActions.userLoadProfileFailure({ error: 'err' }));
    const cleared = userReducer(withError, UserActions.userClearError());
    expect(cleared.error).toBeNull();
    expect(cleared.loading).toBe('error'); // loading state unchanged
  });
});
