import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { UserFacade } from '../../store/user.facade';

export interface IUserSettings {
  theme: 'light' | 'dark' | 'system';
  notificationsEnabled: boolean;
  emailNotifications: boolean;
  language: string;
}

@Component({
  selector: 'app-settings-page',
  imports: [
    FormsModule,
    MatCardModule,
    MatListModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
  ],
  templateUrl: './settings-page.html',
  styleUrl: './settings-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class SettingsPageComponent implements OnInit {
  private readonly userFacade = inject(UserFacade);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly isSaving = signal<boolean>(false);

  protected readonly settings = signal<IUserSettings>({
    theme: 'system',
    notificationsEnabled: true,
    emailNotifications: false,
    language: 'en',
  });

  protected readonly themeOptions = [
    { value: 'light', label: 'Light', icon: 'light_mode' },
    { value: 'dark', label: 'Dark', icon: 'dark_mode' },
    { value: 'system', label: 'System Default', icon: 'brightness_auto' },
  ] as const;

  protected readonly languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'pt', label: 'Português' },
    { value: 'es', label: 'Español' },
  ] as const;

  /** Exposed observables for template consumption. */
  readonly isLoading$ = this.userFacade.isLoading$;
  readonly error$ = this.userFacade.error$;

  ngOnInit(): void {
    // Pre-populate settings from the store only when a user profile is present
    // (avoids overwriting component defaults with store initial state on fresh load)
    this.userFacade.profile$.subscribe((profile) => {
      if (!profile) return;
      this.userFacade.preferences$.subscribe((prefs) => {
        if (prefs) {
          const currentSettings = this.settings();
          this.settings.set({
            theme: (prefs.theme ?? currentSettings.theme) as IUserSettings['theme'],
            language: prefs.language ?? currentSettings.language,
            notificationsEnabled: prefs.notifications ?? currentSettings.notificationsEnabled,
            emailNotifications: (prefs.emailNotifications as boolean | undefined) ?? currentSettings.emailNotifications,
          });
        }
      });
    });
  }

  protected setTheme(theme: IUserSettings['theme']): void {
    this.settings.update((s) => ({ ...s, theme }));
  }

  protected setLanguage(language: string): void {
    this.settings.update((s) => ({ ...s, language }));
  }

  protected toggleNotifications(enabled: boolean): void {
    this.settings.update((s) => ({ ...s, notificationsEnabled: enabled }));
  }

  protected toggleEmailNotifications(enabled: boolean): void {
    this.settings.update((s) => ({ ...s, emailNotifications: enabled }));
  }

  protected onSave(): void {
    this.isSaving.set(true);

    const current = this.settings();
    // Map to UserPreferences shape — 'system' theme maps to 'light' for the store
    const storeTheme: 'light' | 'dark' = current.theme === 'dark' ? 'dark' : 'light';

    this.userFacade.updatePreferences({
      theme: storeTheme,
      language: current.language,
      notifications: current.notificationsEnabled,
      emailNotifications: current.emailNotifications,
    });

    // Show success after a short delay to allow the effect to run
    setTimeout(() => {
      this.isSaving.set(false);
      this.snackBar.open('Settings saved successfully', 'Close', { duration: 3000 });
    }, 600);
  }

  protected onReset(): void {
    this.settings.set({
      theme: 'system',
      notificationsEnabled: true,
      emailNotifications: false,
      language: 'en',
    });
    this.snackBar.open('Settings reset to defaults', 'Close', { duration: 2000 });
  }
}
