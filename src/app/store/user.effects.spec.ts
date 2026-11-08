import { TestBed } from '@angular/core/testing';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { provideMockActions } from '@ngrx/effects/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { Observable, of, throwError } from 'rxjs';
import { UserRepository } from '../repositories/user.repository';
import { UserEffects } from './user.effects';
import * as UserActions from './user.actions';
import { initialUserState } from './user.state';
import { EUserRole } from '../models/user.model';

// ─── Mock data ──────────────────────────────────────────────────────────────

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
  emailNotifications: true,
};

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('UserEffects', () => {
  let actions$: Observable<unknown>;
  let effects: UserEffects;
  let repository: { getProfile: ReturnType<typeof vi.fn>; updateProfile: ReturnType<typeof vi.fn>; updatePreferences: ReturnType<typeof vi.fn> };
  let store: MockStore;

  beforeEach(async () => {
    repository = {
      getProfile: vi.fn(),
      updateProfile: vi.fn(),
      updatePreferences: vi.fn(),
    };

    await TestBed.configureTestingModule({
      providers: [
        UserEffects,
        provideMockActions(() => actions$),
        provideMockStore({ initialState: { user: initialUserState } }),
        { provide: UserRepository, useValue: repository },
      ],
    }).compileComponents();

    effects = TestBed.inject(UserEffects);
    store = TestBed.inject(MockStore);
  });

  // ─── loadProfile$ ──────────────────────────────────────────────────────────

  it('should dispatch userLoadProfileSuccess on successful getProfile', () => {
    repository.getProfile.mockReturnValue(of(MOCK_USER));
    actions$ = of(UserActions.userLoadProfile({ userId: 'user-001' }));

    return new Promise<void>((resolve) => {
      effects.loadProfile$.subscribe((action) => {
        expect(action).toEqual(UserActions.userLoadProfileSuccess({ profile: MOCK_USER }));
        resolve();
      });
    });
  });

  it('should dispatch userLoadProfileFailure when getProfile errors', () => {
    repository.getProfile.mockReturnValue(throwError(() => ({ message: 'User not found' })));
    actions$ = of(UserActions.userLoadProfile({ userId: 'unknown' }));

    return new Promise<void>((resolve) => {
      effects.loadProfile$.subscribe((action) => {
        expect(action).toEqual(
          UserActions.userLoadProfileFailure({ error: 'User not found' }),
        );
        resolve();
      });
    });
  });

  // ─── updateProfile$ ────────────────────────────────────────────────────────

  it('should dispatch userUpdateProfileSuccess on successful updateProfile', () => {
    repository.updateProfile.mockReturnValue(of(MOCK_USER));
    const dispatch = vi.spyOn(store, 'dispatch');
    actions$ = of(UserActions.userUpdateProfile({ changes: { fullName: 'New Name' } }));

    return new Promise<void>((resolve) => {
      effects.updateProfile$.subscribe((action) => {
        expect(action).toEqual(UserActions.userUpdateProfileSuccess({ profile: MOCK_USER }));
        resolve();
      });
    });
  });

  it('should dispatch global updateProfile action on success (req 10.8)', () => {
    repository.updateProfile.mockReturnValue(of(MOCK_USER));
    const dispatch = vi.spyOn(store, 'dispatch');
    actions$ = of(UserActions.userUpdateProfile({ changes: { fullName: 'New Name' } }));

    return new Promise<void>((resolve) => {
      effects.updateProfile$.subscribe(() => {
        expect(dispatch).toHaveBeenCalledWith(
          expect.objectContaining({ type: '[User] Update Profile Success' }),
        );
        resolve();
      });
    });
  });

  it('should dispatch userUpdateProfileFailure when updateProfile errors', () => {
    repository.updateProfile.mockReturnValue(throwError(() => ({ message: 'Update failed' })));
    actions$ = of(UserActions.userUpdateProfile({ changes: { fullName: 'New Name' } }));

    return new Promise<void>((resolve) => {
      effects.updateProfile$.subscribe((action) => {
        expect(action).toEqual(
          UserActions.userUpdateProfileFailure({ error: 'Update failed' }),
        );
        resolve();
      });
    });
  });

  // ─── updatePreferences$ ────────────────────────────────────────────────────

  it('should dispatch userUpdatePreferencesSuccess on successful updatePreferences', () => {
    repository.updatePreferences.mockReturnValue(of(MOCK_PREFERENCES));
    actions$ = of(UserActions.userUpdatePreferences({ preferences: MOCK_PREFERENCES }));

    return new Promise<void>((resolve) => {
      effects.updatePreferences$.subscribe((action) => {
        expect(action).toEqual(
          UserActions.userUpdatePreferencesSuccess({ preferences: MOCK_PREFERENCES }),
        );
        resolve();
      });
    });
  });

  it('should dispatch global updatePreferences action on success (req 10.8)', () => {
    repository.updatePreferences.mockReturnValue(of(MOCK_PREFERENCES));
    const dispatch = vi.spyOn(store, 'dispatch');
    actions$ = of(UserActions.userUpdatePreferences({ preferences: MOCK_PREFERENCES }));

    return new Promise<void>((resolve) => {
      effects.updatePreferences$.subscribe(() => {
        expect(dispatch).toHaveBeenCalledWith(
          expect.objectContaining({ type: '[User] Update Preferences Success' }),
        );
        resolve();
      });
    });
  });

  it('should dispatch userUpdatePreferencesFailure when updatePreferences errors', () => {
    repository.updatePreferences.mockReturnValue(
      throwError(() => ({ message: 'Preferences failed' })),
    );
    actions$ = of(UserActions.userUpdatePreferences({ preferences: MOCK_PREFERENCES }));

    return new Promise<void>((resolve) => {
      effects.updatePreferences$.subscribe((action) => {
        expect(action).toEqual(
          UserActions.userUpdatePreferencesFailure({ error: 'Preferences failed' }),
        );
        resolve();
      });
    });
  });
});
