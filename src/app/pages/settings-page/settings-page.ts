import {
  ChangeDetectionStrategy,
  Component,
  inject,
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
import { Store } from '@ngrx/store';

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
export class SettingsPageComponent {
  // Store injected — will be wired to user state in task 8.4
  private readonly store = inject(Store);
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

    // TODO (task 8.4): dispatch saveSettings action via UserFacade
    // this.store.dispatch(UserActions.saveSettings({ settings: this.settings() }));

    // Simulate save — remove after task 8.4 wires this up
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
