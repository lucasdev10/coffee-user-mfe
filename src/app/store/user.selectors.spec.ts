import { describe, it, expect } from 'vitest';
import {
  selectUserState,
  selectUserProfile,
  selectUserPreferences,
  selectUserLoading,
  selectUserIsLoading,
  selectUserError,
  selectUserTheme,
  selectUserLanguage,
  selectUserNotifications,
} from './user.selectors';
import { initialUserState, IUserState } from './user.state';
import { EUserRole } from '../models/user.model';

const MOCK_USER = {
  id: 'user-001',
  email: 'user@test.com',
  fullName: 'Test User',
  role: EUserRole.USER,
  createdAt: 1000,
  updatedAt: 1000,
};

/** Build an app state stub with user slice */
function buildState(overrides: Partial<IUserState> = {}): { user: IUserState } {
  return { user: { ...initialUserState, ...overrides } };
}

describe('UserSelectors', () => {
  it('selectUserState should return the full user state', () => {
    const state = buildState();
    expect(selectUserState(state as never)).toEqual(initialUserState);
  });

  it('selectUserProfile should return null by default', () => {
    expect(selectUserProfile(buildState() as never)).toBeNull();
  });

  it('selectUserProfile should return the profile when set', () => {
    const state = buildState({ profile: MOCK_USER });
    expect(selectUserProfile(state as never)).toEqual(MOCK_USER);
  });

  it('selectUserPreferences should return default preferences', () => {
    const state = buildState();
    expect(selectUserPreferences(state as never)).toEqual(initialUserState.preferences);
  });

  it('selectUserLoading should return idle by default', () => {
    expect(selectUserLoading(buildState() as never)).toBe('idle');
  });

  it('selectUserLoading should return pending when loading', () => {
    expect(selectUserLoading(buildState({ loading: 'pending' }) as never)).toBe('pending');
  });

  it('selectUserIsLoading should return false when idle', () => {
    expect(selectUserIsLoading(buildState() as never)).toBe(false);
  });

  it('selectUserIsLoading should return true when pending', () => {
    expect(selectUserIsLoading(buildState({ loading: 'pending' }) as never)).toBe(true);
  });

  it('selectUserError should return null by default', () => {
    expect(selectUserError(buildState() as never)).toBeNull();
  });

  it('selectUserError should return error string when set', () => {
    expect(selectUserError(buildState({ error: 'Something failed' }) as never)).toBe('Something failed');
  });

  it('selectUserTheme should return light by default', () => {
    expect(selectUserTheme(buildState() as never)).toBe('light');
  });

  it('selectUserTheme should return dark when set', () => {
    const state = buildState({ preferences: { ...initialUserState.preferences, theme: 'dark' } });
    expect(selectUserTheme(state as never)).toBe('dark');
  });

  it('selectUserLanguage should return en by default', () => {
    expect(selectUserLanguage(buildState() as never)).toBe('en');
  });

  it('selectUserLanguage should return custom language', () => {
    const state = buildState({ preferences: { ...initialUserState.preferences, language: 'pt' } });
    expect(selectUserLanguage(state as never)).toBe('pt');
  });

  it('selectUserNotifications should return true by default', () => {
    expect(selectUserNotifications(buildState() as never)).toBe(true);
  });

  it('selectUserNotifications should return false when disabled', () => {
    const state = buildState({
      preferences: { ...initialUserState.preferences, notifications: false },
    });
    expect(selectUserNotifications(state as never)).toBe(false);
  });
});
