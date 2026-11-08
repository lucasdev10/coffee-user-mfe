import { TestBed } from '@angular/core/testing';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { UserFacade } from './user.facade';
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

describe('UserFacade', () => {
  let facade: UserFacade;
  let store: MockStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        UserFacade,
        provideMockStore({ initialState: { user: initialUserState } }),
      ],
    }).compileComponents();

    facade = TestBed.inject(UserFacade);
    store = TestBed.inject(MockStore);
  });

  it('should be created', () => {
    expect(facade).toBeTruthy();
  });

  // ─── Dispatch tests ────────────────────────────────────────────────────────

  it('should dispatch userLoadProfile on loadProfile()', () => {
    const dispatch = vi.spyOn(store, 'dispatch');
    facade.loadProfile('user-001');
    expect(dispatch).toHaveBeenCalledWith(UserActions.userLoadProfile({ userId: 'user-001' }));
  });

  it('should dispatch userUpdateProfile on updateProfile()', () => {
    const dispatch = vi.spyOn(store, 'dispatch');
    facade.updateProfile({ fullName: 'Updated Name' });
    expect(dispatch).toHaveBeenCalledWith(
      UserActions.userUpdateProfile({ changes: { fullName: 'Updated Name' } }),
    );
  });

  it('should dispatch userUpdatePreferences on updatePreferences()', () => {
    const dispatch = vi.spyOn(store, 'dispatch');
    facade.updatePreferences({ theme: 'dark', language: 'pt' });
    expect(dispatch).toHaveBeenCalledWith(
      UserActions.userUpdatePreferences({ preferences: { theme: 'dark', language: 'pt' } }),
    );
  });

  it('should dispatch userSetProfile on setProfile()', () => {
    const dispatch = vi.spyOn(store, 'dispatch');
    facade.setProfile(MOCK_USER);
    expect(dispatch).toHaveBeenCalledWith(UserActions.userSetProfile({ profile: MOCK_USER }));
  });

  it('should dispatch userClearProfile on clearProfile()', () => {
    const dispatch = vi.spyOn(store, 'dispatch');
    facade.clearProfile();
    expect(dispatch).toHaveBeenCalledWith(UserActions.userClearProfile());
  });

  it('should dispatch userClearError on clearError()', () => {
    const dispatch = vi.spyOn(store, 'dispatch');
    facade.clearError();
    expect(dispatch).toHaveBeenCalledWith(UserActions.userClearError());
  });

  // ─── Selector tests ────────────────────────────────────────────────────────

  it('isLoading$ should emit false from initial state', async () => {
    const loading = await new Promise<boolean>((resolve) => {
      facade.isLoading$.subscribe((v) => resolve(v));
    });
    expect(loading).toBe(false);
  });

  it('error$ should emit null from initial state', async () => {
    const error = await new Promise<string | null>((resolve) => {
      facade.error$.subscribe((v) => resolve(v));
    });
    expect(error).toBeNull();
  });

  it('profile$ should emit null from initial state', async () => {
    const profile = await new Promise((resolve) => {
      facade.profile$.subscribe((v) => resolve(v));
    });
    expect(profile).toBeNull();
  });

  it('should reflect profile after store update', async () => {
    store.setState({ user: { ...initialUserState, profile: MOCK_USER } });
    const profile = await new Promise((resolve) => {
      facade.profile$.subscribe((v) => resolve(v));
    });
    expect(profile).toEqual(MOCK_USER);
  });

  it('theme$ should emit light from initial state', async () => {
    const theme = await new Promise<string>((resolve) => {
      facade.theme$.subscribe((v) => resolve(v));
    });
    expect(theme).toBe('light');
  });

  it('language$ should emit en from initial state', async () => {
    const language = await new Promise<string>((resolve) => {
      facade.language$.subscribe((v) => resolve(v));
    });
    expect(language).toBe('en');
  });

  it('notifications$ should emit true from initial state', async () => {
    const notifications = await new Promise<boolean>((resolve) => {
      facade.notifications$.subscribe((v) => resolve(v));
    });
    expect(notifications).toBe(true);
  });
});
