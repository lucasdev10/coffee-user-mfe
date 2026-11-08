import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EUserRole, IUser } from '../models/user.model';
import { IUpdateUserDto } from '../models/user.model';
import { IUserPreferences } from '../store/user.state';

/**
 * In-memory mock user data for the User MFE.
 * In a real project this would call an actual HTTP API.
 */
let MOCK_USERS: IUser[] = [
  {
    id: 'user-001',
    email: 'user@user.com',
    fullName: 'Regular User',
    role: EUserRole.USER,
    createdAt: 1000,
    updatedAt: 1000,
  },
  {
    id: 'admin-001',
    email: 'admin@admin.com',
    fullName: 'Admin User',
    role: EUserRole.ADMIN,
    createdAt: 1000,
    updatedAt: 1000,
  },
];

/**
 * In-memory mock preferences store.
 * Keyed by userId — persists across repository calls within the same session.
 */
const MOCK_PREFERENCES: Record<string, IUserPreferences> = {};

/**
 * UserRepository — provides async CRUD operations for user profile and preferences.
 */
@Injectable({ providedIn: 'root' })
export class UserRepository {
  private readonly NETWORK_DELAY = 500;

  /**
   * Load a user's profile by ID.
   */
  getProfile(userId: string): Observable<IUser> {
    return new Observable<IUser>((observer) => {
      setTimeout(() => {
        // Try to hydrate from localStorage first (populated by Auth MFE)
        try {
          const stored = localStorage.getItem('auth_user');
          if (stored) {
            const storedUser = JSON.parse(stored) as IUser;
            if (storedUser.id === userId) {
              observer.next(storedUser);
              observer.complete();
              return;
            }
          }
        } catch {
          // fall through to mock data
        }

        const user = MOCK_USERS.find((u) => u.id === userId);
        if (!user) {
          observer.error({ message: `User not found: ${userId}` });
          return;
        }
        const { ...safeUser } = user;
        delete (safeUser as Partial<IUser>).password;
        observer.next(safeUser);
        observer.complete();
      }, this.NETWORK_DELAY);
    });
  }

  /**
   * Update a user's profile fields.
   */
  updateProfile(userId: string, changes: IUpdateUserDto): Observable<IUser> {
    return new Observable<IUser>((observer) => {
      setTimeout(() => {
        const index = MOCK_USERS.findIndex((u) => u.id === userId);
        if (index === -1) {
          observer.error({ message: `User not found: ${userId}` });
          return;
        }
        MOCK_USERS[index] = {
          ...MOCK_USERS[index],
          ...changes,
          updatedAt: Date.now(),
        };
        const updated = { ...MOCK_USERS[index] };
        delete (updated as Partial<IUser>).password;
        observer.next(updated);
        observer.complete();
      }, this.NETWORK_DELAY);
    });
  }

  /**
   * Update user preferences (stored per-user in memory).
   */
  updatePreferences(
    userId: string,
    preferences: Partial<IUserPreferences>,
  ): Observable<IUserPreferences> {
    return new Observable<IUserPreferences>((observer) => {
      setTimeout(() => {
        const existing = MOCK_PREFERENCES[userId] ?? {
          theme: 'light' as const,
          language: 'en',
          notifications: true,
          emailNotifications: false,
        };
        const updated: IUserPreferences = { ...existing, ...preferences };
        MOCK_PREFERENCES[userId] = updated;
        observer.next(updated);
        observer.complete();
      }, this.NETWORK_DELAY);
    });
  }
}
