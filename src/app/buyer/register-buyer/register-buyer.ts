import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { AccountService } from '../../components/account/account.service';
import { BuyerAppService } from '../buyer.service';
import { ToastService } from '../../util/toast.service';

@Component({
  selector: 'app-register-buyer',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    SelectModule
  ],
  templateUrl: './register-buyer.html',
  styleUrl: './register-buyer.css'
})
export class RegisterBuyerComponent implements OnInit {
  buyerForm: FormGroup;
  loading: boolean = false;

  consumerTypes = [
    { label: 'Hotel', value: 'HOTEL' },
    { label: 'Wholesaler', value: 'WHOLESALER' },
    { label: 'Restaurant', value: 'RESTAURANT' },
    { label: 'Retailer', value: 'RETAILER' },
    { label: 'Individual / Normal', value: 'NORMAL' }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private accountService: AccountService,
    private buyerAppService: BuyerAppService,
    private toastService: ToastService
  ) {
    this.buyerForm = this.fb.group({
      consumerType: [null, [Validators.required]],
      businessName: ['', [Validators.required, Validators.minLength(3)]],
      businessLocation: ['', [Validators.required]]
    });
  }

  ngOnInit(): void { }

  onSubmit(): void {
    if (this.buyerForm.invalid) {
      this.buyerForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.buyerAppService.registerBuyer(this.buyerForm.value).subscribe({
      next: (res: any) => {
        this.toastService.successResponse(res);
        // Update roles in localStorage
        const roles = this.accountService.getRoles();
        if (!roles.includes('BUYER')) {
          roles.push('BUYER');
          localStorage.setItem('roles', JSON.stringify(roles));
          this.accountService.updateLoginStatus();
        }
        this.router.navigate(['/profile']);
      },
      error: (err: any) => {
        this.toastService.errorResponse(err);
        this.loading = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/profile']);
  }
}
