import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { UserRepository } from './user.repository';
import { EUserRole } from '../models/user.model';

/**
 * UserRepository spec — validates async getProfile, updateProfile, and
 * updatePreferences against the in-memory mock data store.
 *
 * Requirements: 6.9, 15.4
 */
describe('UserRepository', () => {
  let repository: UserRepository;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    repository = TestBed.inject(UserRepository);
  });

  it('should be created', () => {
    expect(repository).toBeTruthy();
  });

  // ─── getProfile ───────────────────────────────────────────────────────────

  it('should return the user profile for a known userId', async () => {
    const profile = await new Promise((resolve, reject) => {
      repository.getProfile('user-001').subscribe({ next: resolve, error: reject });
    });

    expect(profile).toBeTruthy();
    expect((profile as any).id).toBe('user-001');
    expect((profile as any).email).toBe('user@user.com');
    expect((profile as any).role).toBe(EUserRole.USER);
  }, 10000);

  it('should return admin profile for admin-001', async () => {
    const profile = await new Promise((resolve, reject) => {
      repository.getProfile('admin-001').subscribe({ next: resolve, error: reject });
    });

    expect((profile as any).id).toBe('admin-001');
    expect((profile as any).role).toBe(EUserRole.ADMIN);
  }, 10000);

  it('should emit an error for an unknown userId', async () => {
    const error = await new Promise((resolve, reject) => {
      repository.getProfile('nonexistent-999').subscribe({
        next: () => reject(new Error('Expected error, but got success')),
        error: resolve,
      });
    });

    expect((error as any).message).toContain('nonexistent-999');
  }, 10000);

  it('should not include the password field in the returned profile', async () => {
    const profile = await new Promise<any>((resolve, reject) => {
      repository.getProfile('user-001').subscribe({ next: resolve, error: reject });
    });

    // password should be stripped from returned profile
    expect(profile.password).toBeUndefined();
  }, 10000);

  // ─── updateProfile ────────────────────────────────────────────────────────

  it('should update fullName for an existing user', async () => {
    const updated = await new Promise<any>((resolve, reject) => {
      repository
        .updateProfile('user-001', { fullName: 'Updated Name' })
        .subscribe({ next: resolve, error: reject });
    });

    expect(updated.fullName).toBe('Updated Name');
    expect(updated.id).toBe('user-001');
  }, 10000);

  it('should update email for an existing user', async () => {
    const updated = await new Promise<any>((resolve, reject) => {
      repository
        .updateProfile('user-001', { email: 'newemail@example.com' })
        .subscribe({ next: resolve, error: reject });
    });

    expect(updated.email).toBe('newemail@example.com');
  }, 10000);

  it('should set updatedAt to a recent timestamp after update', async () => {
    const before = Date.now();
    const updated = await new Promise<any>((resolve, reject) => {
      repository
        .updateProfile('admin-001', { fullName: 'Admin Updated' })
        .subscribe({ next: resolve, error: reject });
    });

    expect(updated.updatedAt).toBeGreaterThanOrEqual(before);
  }, 10000);

  it('should emit an error when updating a nonexistent user', async () => {
    const error = await new Promise((resolve, reject) => {
      repository.updateProfile('unknown-xyz', { fullName: 'Ghost' }).subscribe({
        next: () => reject(new Error('Expected error, but got success')),
        error: resolve,
      });
    });

    expect((error as any).message).toContain('unknown-xyz');
  }, 10000);

  // ─── updatePreferences ────────────────────────────────────────────────────

  it('should save and return updated preferences', async () => {
    const prefs = await new Promise<any>((resolve, reject) => {
      repository
        .updatePreferences('user-001', { theme: 'dark', language: 'pt' })
        .subscribe({ next: resolve, error: reject });
    });

    expect(prefs.theme).toBe('dark');
    expect(prefs.language).toBe('pt');
  }, 10000);

  it('should preserve existing preference fields when partially updating', async () => {
    // First set all fields
    await new Promise<any>((resolve, reject) => {
      repository
        .updatePreferences('user-001', { theme: 'dark', language: 'pt', notifications: true })
        .subscribe({ next: resolve, error: reject });
    });

    // Then only update notifications
    const prefs = await new Promise<any>((resolve, reject) => {
      repository
        .updatePreferences('user-001', { notifications: false })
        .subscribe({ next: resolve, error: reject });
    });

    // Both the previous partial update and the new one should be merged
    expect(prefs.notifications).toBe(false);
    expect(prefs.theme).toBe('dark');
    expect(prefs.language).toBe('pt');
  }, 10000);

  it('should default to light theme for a user with no prior preferences', async () => {
    const prefs = await new Promise<any>((resolve, reject) => {
      repository
        .updatePreferences('brand-new-user', { notifications: false })
        .subscribe({ next: resolve, error: reject });
    });

    // Defaults merged in: theme should be 'light', language 'en'
    expect(prefs.theme).toBe('light');
    expect(prefs.language).toBe('en');
    expect(prefs.notifications).toBe(false);
  }, 10000);
});
