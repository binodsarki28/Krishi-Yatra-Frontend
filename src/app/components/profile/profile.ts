import { Component, OnInit, inject, PLATFORM_ID, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { finalize } from 'rxjs';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { SelectModule } from 'primeng/select';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastService } from '../../util/toast.service';
import { AccountService } from '../account/account.service';
import { IJwtResponse } from '../account/IAccount';
import { AddressService } from '../../address/address.service';
import { IAddress, IAddressRequest } from '../../address/IAddress';
import { MapComponent } from '../../common/map/map';
import { NEPAL_DATA, NepalProvince, NepalDistrict } from '../../address/nepal-data';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule, 
    InputTextModule, ButtonModule, PasswordModule, 
    ProgressSpinnerModule, SelectModule, MapComponent
  ],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class ProfileComponent implements OnInit {
  @ViewChild(MapComponent) mapComp!: MapComponent;
  
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

  // Map Data
  userLocation: any = null;
  
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);
  private alreadyLoadingAddress = false;
  selectedFile: File | null = null;
  loading: boolean = false;
  
  constructor(
    private fb: FormBuilder,
    public accountService: AccountService,
    private toastService: ToastService,
    private router: Router,
    private addressService: AddressService
  ) {}

  ngOnInit() {
    this.initForms();
    this.loadUserData();
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
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });

    this.addressForm = this.fb.group({
      province: ['', Validators.required],
      district: ['', Validators.required],
      municipality: ['', Validators.required],
      city: [''],
      wardNo: [''],
      streetName: [''],
      other: ['', Validators.required]
    });
  }

  onProvinceChange() {
    const provinceName = this.addressForm.get('province')?.value;
    const province = this.provinces.find(p => p.name === provinceName);
    this.districts = province ? province.districts : [];
    this.addressForm.patchValue({ district: '', municipality: '' });
    this.municipalities = [];
    this.updateMapFromForm();
  }

  onDistrictChange() {
    const districtName = this.addressForm.get('district')?.value;
    const district = this.districts.find(d => d.name === districtName);
    this.municipalities = district ? district.municipalities : [];
    this.addressForm.patchValue({ municipality: '' });
    this.updateMapFromForm();
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
  
  get isBuyer() { return this.accountService.hasRole('BUYER'); }
  get isBuyerVerified() { return this.accountService.isRoleVerified('BUYER'); }
  
  get isDelivery() { return this.accountService.hasRole('DELIVERY'); }
  get isDeliveryVerified() { return this.accountService.isRoleVerified('DELIVERY'); }

  switchTab(tab: string) {
    if (tab === 'farmer-dashboard') {
      if (!this.isFarmer) { this.router.navigate(['/farmer/register']); return; }
      else if (!this.isFarmerVerified) { 
        this.toastService.warningResponse(this.accountService.getStatusMessage('FARMER') || 'Your Farmer account is under verification.'); 
        return; 
      }
      else { this.router.navigate(['/farmer/dashboard']); return; }
    }
    if (tab === 'buyer-dashboard') {
      if (!this.isBuyer) { this.router.navigate(['/buyer/register']); return; }
      else if (!this.isBuyerVerified) { 
        this.toastService.warningResponse(this.accountService.getStatusMessage('BUYER') || 'Your Buyer account is under verification.'); 
        return; 
      }
      else { this.router.navigate(['/buyer/dashboard']); return; }
    }
    if (tab === 'delivery-dashboard') {
      if (!this.isDelivery) { this.router.navigate(['/delivery/register']); return; }
      else if (!this.isDeliveryVerified) { 
        this.toastService.warningResponse(this.accountService.getStatusMessage('DELIVERY') || 'Your Linker account is under verification.'); 
        return; 
      }
      else { this.router.navigate(['/delivery/dashboard']); return; }
    }
    this.activeTab = tab;
    if (tab === 'address') {
      this.loadAddress();
      setTimeout(() => this.initAddressMap(), 300);
    }
  }

  loadAddress() {
    if (this.alreadyLoadingAddress) return;
    this.alreadyLoadingAddress = true;
    this.addressLoading = true;
    this.addressService.getMyAddress().pipe(
      finalize(() => {
        this.addressLoading = false;
        this.alreadyLoadingAddress = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (res: any) => {
        if (res.response) {
          const addr = res.response as IAddress;
          
          // Cascading setup
          const province = this.provinces.find(p => p.name === addr.province);
          this.districts = province ? province.districts : [];
          const district = this.districts.find(d => d.name === addr.district);
          this.municipalities = district ? district.municipalities : [];

          this.addressForm.patchValue({
            province: addr.province,
            district: addr.district,
            municipality: addr.municipality,
            city: addr.city,
            wardNo: addr.wardNo,
            streetName: addr.streetName,
            other: addr.other
          });
          this.updateMapFromForm();
        }
      },
      error: () => {
        // Safe to ignore 404 as it means no address exists yet
      }
    });
  }

  updateAddress() {
    if (this.addressForm.invalid) {
      this.toastService.warningResponse('Please fill the required fields.');
      return;
    }
    this.addressSubmitting = true;
    this.addressService.saveAddress(this.addressForm.value as IAddressRequest).subscribe({
      next: (res: any) => {
        this.toastService.successResponse(res);
        this.addressSubmitting = false;
        this.addressForm.markAsPristine();
      },
      error: (err: any) => {
        this.toastService.errorResponse(err);
        this.addressSubmitting = false;
      }
    });
  }

  private initAddressMap() {
    // Handled by standalone MapComponent
  }

  updateMapFromForm() {
    const val = this.addressForm.value;
    const addressStr = `${val.municipality || ''}, ${val.district || ''}, ${val.province || ''}, Nepal`;
    if (!val.municipality && !val.district) return;
    if (this.mapComp) {
        this.mapComp.searchLocation(addressStr);
    }
  }

  onMapLocationSelected(latlng: any) {
    this.userLocation = { lat: latlng.lat, lng: latlng.lng, label: 'Selected Location' };
    // Reverse geocode if needed, but here we probably just keep it
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
    this.router.navigate(['/account/login']);
  }

  updatePassword() {
      if (this.passwordForm.invalid) {
          this.toastService.warningResponse('Please fix the errors in password form.');
          return;
      }
      this.loading = true;
      this.accountService.updatePassword(this.passwordForm.value).subscribe({
          next: () => {
              this.loading = false;
              this.toastService.successResponse({ message: 'Password updated successfully' });
              this.passwordForm.reset();
          },
           error: (err: any) => {
               this.loading = false;
               let msg = err.error?.message || 'Failed to update password.';
               if (msg === 'Validation Failed' && err.error?.data) {
                   msg = Object.values(err.error.data)[0] as string;
               }
               this.toastService.errorResponse({ message: msg });
           }
      });
  }
}
