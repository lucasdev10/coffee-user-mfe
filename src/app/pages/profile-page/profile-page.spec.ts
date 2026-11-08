import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideStore } from '@ngrx/store';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ProfilePageComponent } from './profile-page';

describe('ProfilePageComponent', () => {
  let component: ProfilePageComponent;
  let fixture: ComponentFixture<ProfilePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfilePageComponent, MatSnackBarModule],
      providers: [
        provideNoopAnimations(),
        provideStore({}),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfilePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ─── Component creation ───────────────────────────────────────────────────

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize isSaving as false', () => {
    expect(component['isSaving']()).toBe(false);
  });

  it('should initialize profileModel with empty strings', () => {
    const model = component['profileModel']();
    expect(model.fullName).toBe('');
    expect(model.email).toBe('');
  });

  // ─── Form structure ───────────────────────────────────────────────────────

  it('should have a fullName field in the profile form', () => {
    expect(component['profileForm'].fullName).toBeDefined();
  });

  it('should have an email field in the profile form', () => {
    expect(component['profileForm'].email).toBeDefined();
  });

  it('should start with invalid form (empty fields)', () => {
    expect(component['profileForm']().invalid()).toBe(true);
  });

  // ─── Form validation ──────────────────────────────────────────────────────

  it('should be invalid with empty fullName', () => {
    component['profileForm']().value.set({ fullName: '', email: 'test@test.com' });
    expect(component['profileForm']().invalid()).toBe(true);
  });

  it('should be invalid with fullName shorter than 3 characters', () => {
    component['profileForm']().value.set({ fullName: 'AB', email: 'test@test.com' });
    expect(component['profileForm']().invalid()).toBe(true);
  });

  it('should be invalid with invalid email format', () => {
    component['profileForm']().value.set({ fullName: 'John Doe', email: 'not-an-email' });
    expect(component['profileForm']().invalid()).toBe(true);
  });

  it('should be valid with correct fullName and email', () => {
    component['profileForm']().value.set({ fullName: 'John Doe', email: 'john@example.com' });
    expect(component['profileForm']().valid()).toBe(true);
  });

  // ─── canSubmit ────────────────────────────────────────────────────────────

  it('should have canSubmit false when form is invalid', () => {
    expect(component['canSubmit']()).toBe(false);
  });

  it('should have canSubmit true when form is valid and not saving', () => {
    component['profileForm']().value.set({ fullName: 'John Doe', email: 'john@example.com' });
    expect(component['canSubmit']()).toBe(true);
  });

  // ─── Submit behavior ──────────────────────────────────────────────────────

  it('should mark form as touched when submitting invalid form', () => {
    const markSpy = vi.spyOn(component['profileForm'](), 'markAsTouched');
    component['onSubmit']();
    expect(markSpy).toHaveBeenCalled();
  });

  it('should set isSaving to true while saving with valid form', () => {
    component['profileForm']().value.set({ fullName: 'John Doe', email: 'john@example.com' });
    component['onSubmit']();
    expect(component['isSaving']()).toBe(true);
  });
});
