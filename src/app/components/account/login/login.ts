import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { CheckboxModule } from 'primeng/checkbox';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { RippleModule } from 'primeng/ripple';
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
    ReactiveFormsModule,
    RouterModule,
    RippleModule,
  ],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class LoginComponent {
  loginForm: FormGroup;
  loading: boolean = false;

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
          this.accountService.updateLoginStatus();
          this.toastService.successResponse(res);
          if (jwt.roles.includes(RoleType.ADMIN)) {
            // Log out and show error if an admin tries to login through normal login page
            localStorage.clear();
            this.accountService.updateLoginStatus();
            this.toastService.warningResponse('Invalid username or password');
            return;
          } else if (jwt.roles.includes(RoleType.FARMER) && jwt.verifiedRoles?.includes(RoleType.FARMER)) {
            this.router.navigate(['/farmer/dashboard']);
          } else if (jwt.roles.includes(RoleType.DELIVERY) && jwt.verifiedRoles?.includes(RoleType.DELIVERY)) {
            this.router.navigate(['/delivery/dashboard']);
          } else if (jwt.roles.includes(RoleType.BUYER) && jwt.verifiedRoles?.includes(RoleType.BUYER)) {
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
}
