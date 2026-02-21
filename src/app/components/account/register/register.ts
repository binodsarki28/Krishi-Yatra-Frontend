import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { PasswordModule } from 'primeng/password';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { Router, RouterModule } from '@angular/router';
import { RippleModule } from 'primeng/ripple';
import { finalize } from 'rxjs';

import { AccountService } from '../account.service';
import { ToastService } from '../../../util/toast.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PasswordModule,
    InputTextModule,
    ButtonModule,
    CardModule,
    RouterModule,
    RippleModule,
  ],
  templateUrl: './register.html',
  styleUrls: ['./register.css'],
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private accountService: AccountService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {
    this.registerForm = this.fb.group(
      {
        fullName: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(20),
        Validators.pattern('^[A-Z][a-z]+(\\s[A-Z][a-z]+)+$')]],
        username: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required,
        Validators.pattern('^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!])(?=\\S+$).{8,}$')]],
        confirmPassword: ['', Validators.required],
        phoneNumber: ['', [Validators.required,
        Validators.pattern('^(98|97|96|95|94)\\d{8}$')]],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null
      : { mismatch: true };
  }

  onSubmit(): void {
    if (this.registerForm.invalid || this.loading) {
      if (this.registerForm.invalid) this.registerForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.cdr.detectChanges();

    const { fullName, username, email, password, phoneNumber } = this.registerForm.value;

    this.accountService.register({ fullName, username, email, password, phoneNumber })
      .pipe(finalize(() => {
        this.loading = false;
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (res) => {
          this.toastService.successResponse(res);
          this.router.navigate(['/account/verify-otp'], {
            state: { email },
          });
        },
        error: (err) => {
          this.toastService.errorResponse(err);
        },
      });
  }
}
