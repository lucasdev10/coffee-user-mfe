import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
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
import { FormErrorComponent } from 'coffee-shared-lib';
import { UserFacade } from '../../store/user.facade';

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
export class ProfilePageComponent implements OnInit {
  private readonly userFacade = inject(UserFacade);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly isSaving = signal<boolean>(false);
  protected readonly hidePassword = signal<boolean>(true);

  /** Profile form model — pre-populated from store when available. */
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

  /** Exposed observables for template consumption. */
  readonly isLoading$ = this.userFacade.isLoading$;
  readonly error$ = this.userFacade.error$;

  ngOnInit(): void {
    // Subscribe to profile changes and pre-populate the form
    this.userFacade.profile$.subscribe((profile) => {
      if (profile) {
        this.profileForm().value.set({
          fullName: profile.fullName,
          email: profile.email,
        });
      }
    });
  }

  protected onSubmit(): void {
    if (this.profileForm().invalid()) {
      this.profileForm().markAsTouched();
      return;
    }

    this.isSaving.set(true);

    const formValue = this.profileForm().controlValue();
    this.userFacade.updateProfile({
      fullName: formValue.fullName,
      email: formValue.email,
    });

    // Show success snackbar after a short delay to allow the effect to run.
    // isSaving resets when the store indicates loading has finished.
    setTimeout(() => {
      this.isSaving.set(false);
      this.snackBar.open('Profile saved successfully', 'Close', { duration: 3000 });
    }, 800);
  }

  protected togglePasswordVisibility(): void {
    this.hidePassword.update((v) => !v);
  }
}
