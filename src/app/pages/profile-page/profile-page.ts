import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { email, form, FormField, minLength, required } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import { FormErrorComponent } from 'coffee-shared-lib';

@Component({
  selector: 'app-profile-page',
  imports: [
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    FormField,
    FormErrorComponent,
  ],
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class ProfilePageComponent {
  // Store injected — will be wired to user state in task 8.4
  private readonly store = inject(Store);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly isSaving = signal<boolean>(false);
  protected readonly hidePassword = signal<boolean>(true);

  /** Profile form model — pre-populated from auth state in task 8.4 */
  protected readonly profileModel = signal({
    fullName: '',
    email: '',
  });

  protected readonly profileForm = form(this.profileModel, (fieldPath) => {
    required(fieldPath.fullName, { message: 'Field required' });
    minLength(fieldPath.fullName, 3, { message: 'Minimum of 3 characters' });
    required(fieldPath.email, { message: 'Field required' });
    email(fieldPath.email, { message: 'Invalid email address' });
  });

  protected readonly canSubmit = computed(
    () => this.profileForm().valid() && !this.isSaving(),
  );

  protected onSubmit(): void {
    if (this.profileForm().invalid()) {
      this.profileForm().markAsTouched();
      return;
    }

    this.isSaving.set(true);

    // TODO (task 8.4): dispatch updateProfile action via UserFacade
    // const formValue = this.profileForm().controlValue();
    // this.store.dispatch(UserActions.updateProfile({ changes: formValue }));

    // Simulate save — remove after task 8.4 wires this up
    setTimeout(() => {
      this.isSaving.set(false);
      this.snackBar.open('Profile saved successfully', 'Close', { duration: 3000 });
    }, 800);
  }

  protected togglePasswordVisibility(): void {
    this.hidePassword.update((v) => !v);
  }
}
