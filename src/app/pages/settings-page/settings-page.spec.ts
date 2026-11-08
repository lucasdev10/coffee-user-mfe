import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideMockStore } from '@ngrx/store/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { SettingsPageComponent } from './settings-page';
import { initialUserState } from '../../store/user.state';

describe('SettingsPageComponent', () => {
  let component: SettingsPageComponent;
  let fixture: ComponentFixture<SettingsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingsPageComponent, MatSnackBarModule],
      providers: [
        provideNoopAnimations(),
        provideMockStore({ initialState: { user: initialUserState } }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SettingsPageComponent);
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

  // ─── Default settings ─────────────────────────────────────────────────────

  it('should initialize settings with default values', () => {
    const settings = component['settings']();
    expect(settings.theme).toBe('system');
    expect(settings.notificationsEnabled).toBe(true);
    expect(settings.emailNotifications).toBe(false);
    expect(settings.language).toBe('en');
  });

  // ─── Theme options ────────────────────────────────────────────────────────

  it('should expose three theme options', () => {
    expect(component['themeOptions'].length).toBe(3);
  });

  it('should update theme when setTheme is called', () => {
    component['setTheme']('dark');
    expect(component['settings']().theme).toBe('dark');
  });

  it('should update theme back to light', () => {
    component['setTheme']('light');
    expect(component['settings']().theme).toBe('light');
  });

  // ─── Language options ─────────────────────────────────────────────────────

  it('should expose three language options', () => {
    expect(component['languageOptions'].length).toBe(3);
  });

  it('should update language when setLanguage is called', () => {
    component['setLanguage']('pt');
    expect(component['settings']().language).toBe('pt');
  });

  // ─── Notification toggles ─────────────────────────────────────────────────

  it('should toggle push notifications off', () => {
    component['toggleNotifications'](false);
    expect(component['settings']().notificationsEnabled).toBe(false);
  });

  it('should toggle email notifications on', () => {
    component['toggleEmailNotifications'](true);
    expect(component['settings']().emailNotifications).toBe(true);
  });

  // ─── Reset behavior ───────────────────────────────────────────────────────

  it('should reset settings to defaults when onReset is called', () => {
    component['setTheme']('dark');
    component['setLanguage']('es');
    component['toggleNotifications'](false);

    component['onReset']();

    const settings = component['settings']();
    expect(settings.theme).toBe('system');
    expect(settings.language).toBe('en');
    expect(settings.notificationsEnabled).toBe(true);
  });

  // ─── Save behavior ────────────────────────────────────────────────────────

  it('should set isSaving to true while saving', () => {
    component['onSave']();
    expect(component['isSaving']()).toBe(true);
  });
});
