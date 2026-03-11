import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputNumberModule } from 'primeng/inputnumber';
import { finalize } from 'rxjs';
import { AccountService } from '../../components/account/account.service';
import { FarmerAppService } from '../farmer.service';
import { ToastService } from '../../util/toast.service';

@Component({
    selector: 'app-register-farmer',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        CardModule,
        ButtonModule,
        InputTextModule,
        MultiSelectModule,
        InputNumberModule
    ],
    templateUrl: './register-farmer.html',
    styleUrls: ['./register-farmer.css']
})
export class RegisterFarmerComponent {
    farmerForm: FormGroup;
    loading: boolean = false;
    farmTypes = [
        { label: 'Crop', value: 'CROP' },
        { label: 'Vegetable', value: 'VEGETABLE' },
        { label: 'Fruit', value: 'FRUIT' },
        { label: 'Dairy', value: 'DAIRY' },
        { label: 'Poultry', value: 'POULTRY' },
        { label: 'Fishery', value: 'FISHERY' }
    ];

    constructor(
        private fb: FormBuilder,
        private accountService: AccountService,
        private farmerAppService: FarmerAppService,
        private toastService: ToastService,
        private router: Router,
        private cdr: ChangeDetectorRef
    ) {
        this.farmerForm = this.fb.group({
            farmName: ['', [Validators.required, Validators.minLength(3)]],
            farmLocation: ['', [Validators.required]],
            farmArea: [null, [Validators.required, Validators.min(0.01)]],
            types: [[], [Validators.required]]
        });
    }

    onSubmit() {
        if (this.farmerForm.invalid || this.loading) {
            this.farmerForm.markAllAsTouched();
            return;
        }

        this.loading = true;
        this.cdr.detectChanges();

        this.farmerAppService.registerFarmer(this.farmerForm.value)
            .pipe(finalize(() => {
                this.loading = false;
                this.cdr.markForCheck();
                this.cdr.detectChanges();
            }))
            .subscribe({
                next: (res: any) => {
                    this.toastService.successResponse(res);
                    // Update roles in localStorage
                    const roles = this.accountService.getRoles();
                    if (!roles.includes('FARMER')) {
                        roles.push('FARMER');
                        localStorage.setItem('roles', JSON.stringify(roles));
                        this.accountService.updateLoginStatus();
                    }
                    this.router.navigate(['/profile']);
                },
                error: (err: any) => {
                    this.toastService.errorResponse(err);
                }
            });
    }

    cancel() {
        this.router.navigate(['/profile']);
    }
}
