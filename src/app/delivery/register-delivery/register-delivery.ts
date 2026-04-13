import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { AccountService } from '../../components/account/account.service';
import { DeliveryAppService } from '../delivery.service';
import { ToastService } from '../../util/toast.service';

@Component({
  selector: 'app-register-delivery',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    SelectModule
  ],
  templateUrl: './register-delivery.html',
  styleUrl: './register-delivery.css'
})
export class RegisterDeliveryComponent implements OnInit {
  deliveryForm: FormGroup;
  loading: boolean = false;

  vehicleTypes = [
    { label: 'Bicycle', value: 'BICYCLE' },
    { label: 'Auto Rickshaw', value: 'AUTO' },
    { label: 'Taxi / Car', value: 'TAXI' },
    { label: 'Jeep / Pickup', value: 'JEEP' },
    { label: 'Small Van', value: 'VAN' },
    { label: 'Large Truck', value: 'TRUCK' },
    { label: 'Tractor', value: 'TRACTOR' }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private accountService: AccountService,
    private deliveryAppService: DeliveryAppService,
    private toastService: ToastService
  ) {
    this.deliveryForm = this.fb.group({
      vehicleType: [null, [Validators.required]],
      vehicleBrand: ['', [Validators.required]],
      numberPlate: ['', [Validators.required]],
      licenseNumber: ['', [
        Validators.required, 
        Validators.pattern('^\\d{2}-\\d{2}-\\d{10}$')
      ]],
      vehiclePhoto: [''],
      licensePhoto: ['']
    });
  }

  ngOnInit(): void { }

  onSubmit(): void {
    if (this.deliveryForm.invalid) {
      this.deliveryForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.deliveryAppService.registerDelivery(this.deliveryForm.value).subscribe({
      next: (res: any) => {
        this.toastService.successResponse(res);
        // Update roles in localStorage
        const roles = this.accountService.getRoles();
        if (!roles.includes('DELIVERY')) {
          roles.push('DELIVERY');
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
