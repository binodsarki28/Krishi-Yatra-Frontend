import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { CheckboxModule } from 'primeng/checkbox';
import { FloatLabelModule } from 'primeng/floatlabel';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { RippleModule } from 'primeng/ripple';
import { DialogModule } from 'primeng/dialog';
import { finalize } from 'rxjs';

import { AccountService } from '../account.service';
import { ToastService } from '../../../util/toast.service';
import { IJwtResponse, RoleType } from '../IAccount';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    CheckboxModule,
    FloatLabelModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    RippleModule,
    DialogModule
  ],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class LoginComponent {
  loginForm: FormGroup;
  loading: boolean = false;
  
  // Forgot Password
  showForgotModal = false;
  forgotStep = 1; // 1: Email, 2: OTP, 3: New Password
  forgotLoading = false;
  forgotEmail = '';
  forgotOtp = '';
  newPassword = '';
  confirmPassword = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private accountService: AccountService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      rememberMe: [false],
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid || this.loading) {
      if (this.loginForm.invalid) this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.cdr.detectChanges();

    const { username, password } = this.loginForm.value;
    console.log('Attempting login for:', username);

    this.accountService.login({ username, password })
      .pipe(finalize(() => {
        console.log('Login request finalized (Always runs)');
        this.loading = false;
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (res) => {
          console.log('Login success handler');
          this.loading = false;
          const jwt = res.response as IJwtResponse;
          localStorage.setItem('token', jwt.token);
          localStorage.setItem('username', jwt.username);
          localStorage.setItem('fullName', jwt.fullName);
          localStorage.setItem('email', jwt.email);
          localStorage.setItem('roles', JSON.stringify(jwt.roles));
          localStorage.setItem('verifiedRoles', JSON.stringify(jwt.verifiedRoles));
          localStorage.setItem('statusMessages', JSON.stringify(jwt.statusMessages || {}));
          this.accountService.updateLoginStatus();
          this.toastService.successResponse(res);
          
          if (jwt.roles.includes(RoleType.ADMIN)) {
            localStorage.clear();
            this.accountService.updateLoginStatus();
            this.toastService.warningResponse('Invalid username or password');
            return;
          } else if (jwt.verifiedRoles?.includes(RoleType.FARMER)) {
            this.router.navigate(['/farmer/dashboard']);
          } else if (jwt.verifiedRoles?.includes(RoleType.DELIVERY)) {
            this.router.navigate(['/delivery/dashboard']);
          } else if (jwt.verifiedRoles?.includes(RoleType.BUYER)) {
            this.router.navigate(['/']);
          } else {
            this.router.navigate(['/profile']);
          }
        },
        error: (err) => {
          console.error('Login error handler:', err);
          this.loading = false;
          this.cdr.detectChanges();
          this.toastService.errorResponse(err);
        }
      });
  }

  // --- Forgot Password Methods ---

  openForgotModal() {
    this.showForgotModal = true;
    this.forgotStep = 1;
    this.forgotEmail = '';
    this.forgotOtp = '';
    this.newPassword = '';
    this.confirmPassword = '';
  }

  requestForgotOtp() {
    if (!this.forgotEmail || !this.forgotEmail.includes('@')) {
      this.toastService.warningResponse('Please enter a valid email.');
      return;
    }
    this.forgotLoading = true;
    this.accountService.forgotPassword({ email: this.forgotEmail })
      .pipe(finalize(() => this.forgotLoading = false))
      .subscribe({
        next: (res) => {
          this.toastService.successResponse(res);
          this.forgotStep = 2;
        },
        error: (err) => this.toastService.errorResponse(err)
      });
  }

  verifyForgotOtp() {
    if (this.forgotOtp.length !== 6) {
      this.toastService.warningResponse('Please enter the 6-digit code.');
      return;
    }
    // We don't have a separate "verify only" endpoint that returns a token, 
    // so we just move to step 3. The resetPassword endpoint will re-verify it.
    this.forgotStep = 3;
  }

  submitResetPassword() {
    const passwordPattern = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!])(?=\S+$).{8,}$/;
    
    if (!passwordPattern.test(this.newPassword)) {
      this.toastService.warningResponse('Password must be 8+ chars with uppercase, lowercase, digit & special char.');
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.toastService.warningResponse('Passwords do not match.');
      return;
    }

    this.forgotLoading = true;
    this.accountService.resetPassword({
      email: this.forgotEmail,
      otpCode: this.forgotOtp,
      newPassword: this.newPassword
    })
    .pipe(finalize(() => this.forgotLoading = false))
    .subscribe({
      next: (res) => {
        this.toastService.successResponse(res);
        this.showForgotModal = false;
      },
      error: (err) => this.toastService.errorResponse(err)
    });
  }
}
