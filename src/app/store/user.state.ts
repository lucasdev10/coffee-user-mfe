import { IUser } from '../models/user.model';

/**
 * User MFE local NgRx state.
 *
 * Mirrors the fields used by the global Shell user slice (IUserGlobalState) so
 * they can be kept in sync via dispatchToGlobalStore() calls in UserEffects.
 */
export interface IUserState {
  profile: IUser | null;
  preferences: IUserPreferences;
  loading: 'idle' | 'pending' | 'success' | 'error';
  error: string | null;
}

export interface IUserPreferences {
  theme: 'light' | 'dark';
  language: string;
  notifications: boolean;
  emailNotifications?: boolean;
  [key: string]: unknown;
}

export const initialUserState: IUserState = {
  profile: null,
  preferences: {
    theme: 'light',
    language: 'en',
    notifications: true,
    emailNotifications: false,
  },
  loading: 'idle',
  error: null,
};
