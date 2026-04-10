import { Component, OnInit, inject, PLATFORM_ID, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonModule, isPlatformBrowser, NgOptimizedImage } from '@angular/common';
import { finalize } from 'rxjs';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { SelectModule } from 'primeng/select';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { ToastService } from '../../util/toast.service';
import { AccountService } from '../account/account.service';
import { IJwtResponse } from '../account/IAccount';
import { AddressService } from '../../address/address.service';
import { IAddress, IAddressRequest } from '../../address/IAddress';
import { NEPAL_DATA, NepalProvince, NepalDistrict } from '../../address/nepal-data';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    InputTextModule, ButtonModule, PasswordModule,
    ProgressSpinnerModule, SelectModule,
    ConfirmDialogModule, NgOptimizedImage
  ],
  providers: [ConfirmationService],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class ProfileComponent implements OnInit {

  activeTab: string = 'profile';

  profileForm!: FormGroup;
  passwordForm!: FormGroup;

  userData: any = {};

  profilePreview: string | null = null;

  addressForm!: FormGroup;
  addressLoading: boolean = false;
  addressSubmitting: boolean = false;

  // Nepal Data
  provinces: NepalProvince[] = NEPAL_DATA;
  districts: NepalDistrict[] = [];
  municipalities: string[] = [];
  wards: number[] = Array.from({ length: 35 }, (_, i) => i + 1);


  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);
  private alreadyLoadingAddress = false;
  private addressLoaded = false;
  selectedFile: File | null = null;
  loading: boolean = false;

  constructor(
    private fb: FormBuilder,
    public accountService: AccountService,
    private toastService: ToastService,
    private router: Router,
    private addressService: AddressService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.initForms();
    this.loadUserData();
    if (isPlatformBrowser(this.platformId)) {
      this.loadAddress(); // Background pre-fetch
    }
  }

  initForms() {
    this.profileForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      username: ['', Validators.required],
      phone: [''],
      description: ['']
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!])(?=\S+$).{8,}$/)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });

    this.addressForm = this.fb.group({
      province: ['', Validators.required],
      district: ['', Validators.required],
      municipality: ['', Validators.required],
      city: [''],
      wardNo: ['', [Validators.required, Validators.min(1)]],
      streetName: ['', Validators.required]
    });
  }

  onProvinceChange() {
    const provinceName = this.addressForm.get('province')?.value;
    const province = this.provinces.find(p => p.name === provinceName);
    this.districts = province ? province.districts : [];
    this.addressForm.patchValue({ district: '', municipality: '' });
    this.municipalities = [];
  }

  onDistrictChange() {
    const districtName = this.addressForm.get('district')?.value;
    const district = this.districts.find(d => d.name === districtName);
    this.municipalities = district ? district.municipalities : [];
    this.addressForm.patchValue({ municipality: '' });
  }

  loadUserData() {
    if (isPlatformBrowser(this.platformId)) {
      // Load from local storage immediately for instant UI response
      this.userData = {
        fullName: localStorage.getItem('fullName') || 'User Name',
        username: localStorage.getItem('username') || 'username',
        email: localStorage.getItem('email') || 'N/A',
        phoneNumber: localStorage.getItem('phoneNumber') || 'N/A',
        description: localStorage.getItem('description') || '',
        roles: this.accountService.getRoles(),
        profileUrl: localStorage.getItem('profileUrl') || null,
        statusMessages: JSON.parse(localStorage.getItem('statusMessages') || '{}'),
        verifiedRoles: this.accountService.getVerifiedRoles()
      };
      this.profilePreview = this.userData.profileUrl;

      // Update form immediately with cached data
      const parts = this.userData.fullName.split(' ');
      this.profileForm.patchValue({
        firstName: parts[0] || '',
        lastName: parts.slice(1).join(' ') || '',
        username: this.userData.username,
        phone: this.userData.phoneNumber === 'N/A' ? '' : this.userData.phoneNumber,
        description: this.userData.description
      });

      // Then sync with backend for fresh data
      this.accountService.getCurrentUser().subscribe({
        next: (res: any) => {
          const jwt = res.response as IJwtResponse;
          if (jwt.roles) localStorage.setItem('roles', JSON.stringify(jwt.roles));
          if (jwt.verifiedRoles) localStorage.setItem('verifiedRoles', JSON.stringify(jwt.verifiedRoles));
          if (jwt.statusMessages) localStorage.setItem('statusMessages', JSON.stringify(jwt.statusMessages));
          if (jwt.profileUrl) localStorage.setItem('profileUrl', jwt.profileUrl);
          if (jwt.description) localStorage.setItem('description', jwt.description);
          if (jwt.phoneNumber) localStorage.setItem('phoneNumber', jwt.phoneNumber);
          if (jwt.fullName) localStorage.setItem('fullName', jwt.fullName);
          if (jwt.username) localStorage.setItem('username', jwt.username);
          if (jwt.email) localStorage.setItem('email', jwt.email);

          this.profilePreview = jwt.profileUrl || null;
          this.userData = jwt;

          const fullName = jwt.fullName || '';
          const partsSync = fullName.split(' ');
          this.profileForm.patchValue({
            firstName: partsSync[0],
            lastName: partsSync.slice(1).join(' '),
            username: jwt.username,
            phone: jwt.phoneNumber,
            description: jwt.description
          });
        },
        error: (err: any) => console.error('Failed to sync user data', err)
      });
    }
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value ? null : { 'mismatch': true };
  }

  get isFarmer() { return this.accountService.hasRole('FARMER'); }
  get isFarmerVerified() { return this.accountService.isRoleVerified('FARMER'); }
  get hasFarmerApplied() { return !!this.accountService.getStatusMessage('FARMER'); }

  get isBuyer() { return this.accountService.hasRole('BUYER'); }
  get isBuyerVerified() { return this.accountService.isRoleVerified('BUYER'); }
  get hasBuyerApplied() { return !!this.accountService.getStatusMessage('BUYER'); }

  get isDelivery() { return this.accountService.hasRole('DELIVERY'); }
  get isDeliveryVerified() { return this.accountService.isRoleVerified('DELIVERY'); }
  get hasDeliveryApplied() { return !!this.accountService.getStatusMessage('DELIVERY'); }

  switchTab(tab: string) {
    const statusF = this.accountService.getStatusMessage('FARMER');
    const statusB = this.accountService.getStatusMessage('BUYER');
    const statusD = this.accountService.getStatusMessage('DELIVERY');

    if (tab === 'farmer-dashboard') {
      if (!this.isFarmer || (!this.isFarmerVerified && !statusF)) {
        this.router.navigate(['/farmer/register']);
        return;
      }
      else if (!this.isFarmerVerified) {
        this.toastService.warningResponse(statusF || 'Your Farmer account is under verification.');
        return;
      }
      else { this.router.navigate(['/farmer/dashboard']); return; }
    }
    if (tab === 'buyer-dashboard') {
      if (!this.isBuyer || (!this.isBuyerVerified && !statusB)) {
        this.router.navigate(['/buyer/register']);
        return;
      }
      else if (!this.isBuyerVerified) {
        this.toastService.warningResponse(statusB || 'Your Buyer account is under verification.');
        return;
      }
      else { this.router.navigate(['/buyer/dashboard']); return; }
    }
    if (tab === 'delivery-dashboard') {
      if (!this.isDelivery || (!this.isDeliveryVerified && !statusD)) {
        this.router.navigate(['/delivery/register']);
        return;
      }
      else if (!this.isDeliveryVerified) {
        this.toastService.warningResponse(statusD || 'Your Linker account is under verification.');
        return;
      }
      else { this.router.navigate(['/delivery/dashboard']); return; }
    }
    this.activeTab = tab;
    if (tab === 'address') {
      this.loadAddress();
    }
  }

  loadAddress() {
    if (this.alreadyLoadingAddress || this.addressLoaded) return;
    this.alreadyLoadingAddress = true;
    this.addressLoading = true;
    console.time('fetchAddress');

    this.addressService.getMyAddress().pipe(
      finalize(() => {
        this.addressLoading = false;
        this.alreadyLoadingAddress = false;
        console.timeEnd('fetchAddress');
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (res: any) => {
        this.addressLoading = false; // Set early to dismiss spinner fast
        if (res.response) {
          const addr = res.response as IAddress;
          this.addressLoaded = true;

          // Pre-populate lists BEFORE patching to avoid missing labels
          const province = this.provinces.find(p => p.name === addr.province);
          this.districts = province ? province.districts : [];
          const district = this.districts.find(d => d.name === addr.district);
          this.municipalities = district ? district.municipalities : [];

          // Patch silently to prevent cascading 'onChange' loops
          this.addressForm.patchValue({
            province: addr.province,
            district: addr.district,
            municipality: addr.municipality,
            city: addr.city,
            wardNo: addr.wardNo,
            streetName: addr.streetName,
          }, { emitEvent: false });

          this.cdr.detectChanges();
          console.log('[SpeedCheck] Address data ready and patched.');
        }
      },
      error: () => {
        // Safe to ignore 404 as it means no address exists yet
        this.addressForm.reset();
        this.districts = [];
        this.municipalities = [];
        this.cdr.detectChanges();
      }
    });
  }

  updateAddress() {
    if (this.addressForm.invalid) {
        this.addressForm.markAllAsTouched();
        this.toastService.warningResponse('Please fill in all required address fields.');
        return;
    }
    this.addressSubmitting = true;
    const formValue = this.addressForm.value;

    // Explicitly build payload with correct types
    const payload = {
        province: formValue.province,
        district: formValue.district,
        municipality: formValue.municipality,
        wardNo: formValue.wardNo ? Number(formValue.wardNo) : undefined,
        streetName: formValue.streetName
    };

    this.addressService.saveAddress(payload).subscribe({
      next: (res: any) => {
        this.toastService.successResponse(res);
        this.addressSubmitting = false;
        this.addressForm.markAsPristine();
        this.addressLoaded = false;
      },
      error: (err: any) => {
        // Pass original error to toastService so it can extract the message correctly
        this.toastService.errorResponse(err);
        this.addressSubmitting = false;
      }
    });
  }

  deleteAddress() {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete your address? This action cannot be undone.',
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger p-button-text',
      rejectButtonStyleClass: 'p-button-text p-button-secondary',
      acceptLabel: 'Delete',
      rejectLabel: 'Cancel',
      accept: () => {
        this.addressSubmitting = true;
        this.addressService.deleteAddress().subscribe({
          next: (res: any) => {
            this.toastService.successResponse(res);
            this.addressSubmitting = false;
            this.addressForm.reset();
            this.addressLoaded = false;
            this.districts = [];
            this.municipalities = [];
            this.cdr.detectChanges();
          },
          error: (err: any) => {
            this.toastService.errorResponse(err);
            this.addressSubmitting = false;
          }
        });
      }
    });
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        this.toastService.warningResponse('File size should not exceed 10MB.');
        return;
      }
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.profilePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
      this.toastService.successResponse({ message: 'Profile picture selected! Click "Save Changes" to apply.' });
    }
  }

  updateProfile() {
    if (this.profileForm.invalid) {
      this.toastService.warningResponse('Please fill the required fields.');
      return;
    }

    this.loading = true;
    const formData = new FormData();
    formData.append('firstName', this.profileForm.get('firstName')?.value || '');
    formData.append('lastName', this.profileForm.get('lastName')?.value || '');
    formData.append('phoneNumber', this.profileForm.get('phone')?.value || '');
    formData.append('description', this.profileForm.get('description')?.value || '');
    formData.append('currentUsername', this.profileForm.get('username')?.value || '');

    if (this.selectedFile) {
      formData.append('profileImage', this.selectedFile);
    }

    this.accountService.updateProfile(formData).subscribe({
      next: (res: any) => {
        const successMsg = this.selectedFile ? 'Profile picture and info updated!' : 'Profile updated successfully!';
        this.toastService.successResponse({ message: successMsg });
        this.loading = false;
        this.selectedFile = null; // reset file selection
        this.loadUserData(); // re-sync context
      },
      error: (err: any) => {
        let msg = err.error?.message || 'Failed to update profile.';
        if (msg === 'Validation Failed' && err.error?.data) {
          msg = Object.values(err.error.data)[0] as string;
        }
        this.toastService.errorResponse({ message: msg });
        this.loading = false;
      }
    });
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.clear();
    }
    this.accountService.updateLoginStatus();
    this.router.navigate(['/account/login']).then(r => console.log('Navigated to login after logout:', r));
  }

  updatePassword() {
      if (this.passwordForm.invalid) {
          this.passwordForm.markAllAsTouched();
          this.toastService.warningResponse('Please fix the errors in password form.');
          return;
      }
      this.loading = true;
      const payload = {
        currentPassword: this.passwordForm.get('currentPassword')?.value,
        newPassword: this.passwordForm.get('newPassword')?.value
      };
      this.accountService.updatePassword(payload).subscribe({
          next: () => {
              this.loading = false;
              this.toastService.successResponse({ message: 'Password updated successfully' });
              this.passwordForm.reset();
          },
           error: (err: any) => {
               this.loading = false;
               this.toastService.errorResponse(err);
           }
      });
  }

  isFieldInvalid(fieldName: string) {
    const control = this.addressForm.get(fieldName);
    return control ? control.invalid && (control.dirty || control.touched) : false;
  }
}
