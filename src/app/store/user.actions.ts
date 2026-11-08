import { createAction, props } from '@ngrx/store';
import { IUser, IUpdateUserDto } from '../models/user.model';
import { IUserPreferences } from './user.state';

// ─── Load Profile ─────────────────────────────────────────────────────────────

export const userLoadProfile = createAction(
  '[User MFE] Load Profile',
  props<{ userId: string }>(),
);

export const userLoadProfileSuccess = createAction(
  '[User MFE] Load Profile Success',
  props<{ profile: IUser }>(),
);

export const userLoadProfileFailure = createAction(
  '[User MFE] Load Profile Failure',
  props<{ error: string }>(),
);

// ─── Update Profile ───────────────────────────────────────────────────────────

export const userUpdateProfile = createAction(
  '[User MFE] Update Profile',
  props<{ changes: IUpdateUserDto }>(),
);

export const userUpdateProfileSuccess = createAction(
  '[User MFE] Update Profile Success',
  props<{ profile: IUser }>(),
);

export const userUpdateProfileFailure = createAction(
  '[User MFE] Update Profile Failure',
  props<{ error: string }>(),
);

// ─── Update Preferences ───────────────────────────────────────────────────────

export const userUpdatePreferences = createAction(
  '[User MFE] Update Preferences',
  props<{ preferences: Partial<IUserPreferences> }>(),
);

export const userUpdatePreferencesSuccess = createAction(
  '[User MFE] Update Preferences Success',
  props<{ preferences: Partial<IUserPreferences> }>(),
);

export const userUpdatePreferencesFailure = createAction(
  '[User MFE] Update Preferences Failure',
  props<{ error: string }>(),
);

// ─── Set Profile (from auth hydration / Shell sync) ──────────────────────────

export const userSetProfile = createAction(
  '[User MFE] Set Profile',
  props<{ profile: IUser }>(),
);

// ─── Clear ────────────────────────────────────────────────────────────────────

export const userClearProfile = createAction('[User MFE] Clear Profile');

export const userClearError = createAction('[User MFE] Clear Error');
