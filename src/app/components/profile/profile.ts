
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AccountService } from '../account/account.service';
import { IJwtResponse } from '../account/IAccount';
import { ToastService } from '../../util/toast.service';
import { TabsModule } from 'primeng/tabs';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    ReactiveFormsModule,
    TabsModule,
    DividerModule,
    TagModule
  ],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class ProfileComponent implements OnInit {
  passwordForm: FormGroup;
  loading: boolean = false;

  constructor(
    private router: Router,
    private accountService: AccountService,
    private fb: FormBuilder,
    private toastService: ToastService
  ) {
    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.accountService.getCurrentUser().subscribe({
        next: (res) => {
          const jwt = res.response as IJwtResponse;
          if (jwt.roles) localStorage.setItem('roles', JSON.stringify(jwt.roles));
          if (jwt.verifiedRoles) localStorage.setItem('verifiedRoles', JSON.stringify(jwt.verifiedRoles));
        },
        error: (err) => console.error('Failed to sync user roles:', err)
      });
    }
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null : { 'mismatch': true };
  }

  private platformId = inject(PLATFORM_ID);

  get user() {
    return {
      fullName: this.accountService.getFullName(),
      email: this.accountService.getUserEmail(),
      username: this.accountService.getUsername(),
      roles: this.accountService.getRoles(),
      phone: isPlatformBrowser(this.platformId) ? (localStorage.getItem('phone') || '') : ''
    };
  }

  get isAdmin() { return this.accountService.hasRole('ADMIN'); }
  get isFarmer() { return this.accountService.hasRole('FARMER'); }
  get isBuyer() { return this.accountService.hasRole('BUYER'); }
  get isDelivery() { return this.accountService.hasRole('DELIVERY'); }

  get isFarmerVerified() { return this.accountService.isRoleVerified('FARMER'); }
  get isBuyerVerified() { return this.accountService.isRoleVerified('BUYER'); }
  get isDeliveryVerified() { return this.accountService.isRoleVerified('DELIVERY'); }

  updatePassword() {
    if (this.passwordForm.invalid) {
      this.toastService.warningResponse('Please fix form errors.');
      return;
    }

    this.loading = true;
    // Placeholder for actual API call
    setTimeout(() => {
      this.toastService.successResponse({ message: 'Password updated successfully (Demo)' });
      this.passwordForm.reset();
      this.loading = false;
    }, 1500);
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      localStorage.removeItem('fullName');
      localStorage.removeItem('email');
      localStorage.removeItem('roles');
    }
    this.accountService.updateLoginStatus();
    this.router.navigate(['/account/login']);
  }

  navigateTo(path: string) {
    if (path.includes('/farmer/') && this.isFarmer && !this.isFarmerVerified) {
      this.toastService.warningResponse('Your Farmer account is currently under verification. Please wait for admin approval.');
      return;
    }
    if (path.includes('/buyer/') && this.isBuyer && !this.isBuyerVerified) {
      this.toastService.warningResponse('Your Buyer account is currently under verification. Please wait for admin approval.');
      return;
    }
    if (path.includes('/delivery/') && this.isDelivery && !this.isDeliveryVerified) {
      this.toastService.warningResponse('Your Delivery Partner account is currently under verification. Please wait for admin approval.');
      return;
    }
    this.router.navigate([path]);
  }
}
