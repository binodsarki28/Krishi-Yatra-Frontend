import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputOtpModule } from 'primeng/inputotp';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { RippleModule } from 'primeng/ripple';

import { AccountService } from '../account.service';
import { ToastService } from '../../../util/toast.service';

@Component({
  selector: 'app-verify-otp',
  standalone: true,
  imports: [CommonModule, ButtonModule, InputOtpModule, ReactiveFormsModule, RippleModule],
  templateUrl: './verify-otp.html',
  styleUrls: ['./verify-otp.css'],
})
export class VerifyOtpComponent implements OnInit {
  otpForm: FormGroup;
  loading: boolean = false;
  resendLoading: boolean = false;
  email: string = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private accountService: AccountService,
    private toastService: ToastService
  ) {
    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
    });

    // Retrieve email passed from the register page via router state
    // Must be called in constructer
    const nav = this.router.getCurrentNavigation();
    const state = nav?.extras?.state as { email: string } | undefined;
    this.email = state?.email ?? '';
  }

  ngOnInit(): void { }

  onVerify(): void {
    if (this.otpForm.invalid || !this.email) {
      if (this.otpForm.invalid) this.otpForm.markAllAsTouched();
      if (!this.email) this.toastService.warningResponse('Session expired. Please register again.');
      return;
    }

    this.loading = true;

    this.accountService
      .verifyOtp({ email: this.email, otpCode: this.otpForm.value.otp })
      .subscribe({
        next: (res) => {
          this.loading = false;
          this.toastService.successResponse(res);
          this.router.navigate(['/account/login']);
        },
        error: (err) => {
          this.loading = false;
          this.toastService.errorResponse(err);
        },
      });
  }

  resendOtp(): void {
    if (!this.email) {
      this.toastService.warningResponse('No email address found. Please register again.');
      return;
    }

    this.resendLoading = true;

    this.accountService.resendOtp({ email: this.email }).subscribe({
      next: (res) => {
        this.resendLoading = false;
        this.toastService.successResponse(res);
      },
      error: (err) => {
        this.resendLoading = false;
        this.toastService.errorResponse(err);
      },
    });
  }
}
