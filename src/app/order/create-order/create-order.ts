import { Component, OnInit, AfterViewInit, OnDestroy, PLATFORM_ID, ChangeDetectorRef, ViewChild, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { StockService } from '../../stock/stock.service';
import { OrderService } from '../order.service';
import { AddressService } from '../../address/address.service';
import { ToastService } from '../../util/toast.service';
import { IAddress } from '../../address/IAddress';
import { MapComponent } from '../../common/map/map';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { TooltipModule } from 'primeng/tooltip';
import { SelectModule } from 'primeng/select';
import { AccountService } from '../../components/account/account.service';

@Component({
  selector: 'app-create-order',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule, RouterModule,
    ButtonModule, InputTextModule,
    InputNumberModule,
    TextareaModule,
    ProgressSpinnerModule,
    MapComponent,
    SelectModule,
    TagModule,
    AutoCompleteModule,
    TooltipModule
  ],
  templateUrl: './create-order.html',
  styleUrls: ['./create-order.css']
})
export class CreateOrder implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MapComponent) mapComp!: MapComponent;

  stock: any = null;
  orderForm!: FormGroup;
  loading = false;
  submitting = false;

  farmerAddress: IAddress | null = null;
  buyerAddress: IAddress | null = null;
  farmerAddressString = '';
  buyerAddressString = '';

  // Map Data
  pickupLoc: any = null;
  dropLoc: any = null;
  suggestions: any[] = [];
  deliveryDistance: number = 0;
  deliveryFee: number = 0;
  calculatedCheckpoints: string = '';

  // Checkpoint tags parsed from the input
  checkpointTags: string[] = [];
  mapVisible = true; // For nuclear reset

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private stockService: StockService,
    private orderService: OrderService,
    private addressService: AddressService,
    private toastService: ToastService,
    private accountService: AccountService,
    @Inject(PLATFORM_ID) private platformId: any,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // SECURITY CHECK: Ensure user is a verified buyer
    if (!this.accountService.isRoleVerified('BUYER')) {
        this.toastService.warningResponse('Please register and verify as a Buyer before placing an order.');
        this.router.navigate(['/buyer/register']);
        return;
    }

    this.orderForm = this.fb.group({
      orderQuantity: [1, [Validators.required, Validators.min(1)]],
      pickupAddress: [{ value: '', disabled: true }, Validators.required],
      dropAddress: [{ value: '', disabled: true }, Validators.required],
      notes: ['', [Validators.required, Validators.minLength(5)]],
      checkpoints: [[]]
    });

    // Watch quantity changes to immediately update delivery fee
    this.orderForm.get('orderQuantity')?.valueChanges.subscribe(() => {
        this.calculateDeliveryFee();
    });

    // Watch checkpoint input: limit to 3
    this.orderForm.get('checkpoints')?.valueChanges.subscribe((val: any[]) => {
       if (val && val.length > 3) {
           this.orderForm.get('checkpoints')?.setValue(val.slice(0, 3), { emitEvent: false });
           this.toastService.warningResponse('Maximum 3 checkpoints allowed.');
       }
       this.checkpointTags = this.orderForm.get('checkpoints')?.value || [];
    });

    const slug = this.route.snapshot.paramMap.get('slug');
    if (slug) {
      this.loadStockDetails(slug);
      this.loadFarmerAddress(slug);
      this.loadBuyerAddress();
    }
  }

  ngAfterViewInit() {}

  ngOnDestroy() {}

  private parseCheckpointTags(input: string) {
    if (!input) {
      this.checkpointTags = [];
      return;
    }
    this.checkpointTags = input.split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);
  }

  private loadStockDetails(slug: string) {
    this.loading = true;
    this.stockService.getStockDetails(slug).subscribe({
      next: (res: any) => {
        this.stock = res.response;
        this.loading = false;
        if (this.stock?.minQuantity) {
          this.orderForm.get('orderQuantity')?.setValidators([
            Validators.required,
            Validators.min(this.stock.minQuantity),
            Validators.max(this.stock.quantity)
          ]);
          this.orderForm.get('orderQuantity')?.updateValueAndValidity();
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.toastService.errorResponse({ message: 'Failed to load stock.' });
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private loadFarmerAddress(slug: string) {
    this.orderService.getFarmerAddress(slug).subscribe({
      next: (res: any) => {
        this.farmerAddress = res.response;
        this.farmerAddressString = this.farmerAddress?.fullAddress || '';
        this.orderForm.patchValue({ pickupAddress: this.farmerAddressString });
        
        // Nuclear Reset Map to ensure fresh state on every visit/update
        this.mapVisible = false;
        this.cdr.detectChanges();
        
        setTimeout(() => {
            // Set temp location to stop "Loading map..." spinner
            this.pickupLoc = { lat: 27.7, lng: 85.3, label: 'Farmer Address' };
            this.mapVisible = true;
            this.geocodeAndSetLoc(this.farmerAddressString, 'pickup');
            this.cdr.detectChanges();
        }, 10);
      },
      error: () => {
        this.farmerAddressString = '';
        this.toastService.warningResponse('Farmer has not set an address.');
        this.cdr.detectChanges();
      }
    });
  }

  private loadBuyerAddress() {
    this.addressService.getMyAddress().subscribe({
      next: (res: any) => {
        this.buyerAddress = res.response;
        if (!this.buyerAddress) {
          this.handleMissingAddress();
          return;
        }
        this.buyerAddressString = this.buyerAddress?.fullAddress || '';
        this.orderForm.patchValue({ dropAddress: this.buyerAddressString });
        // Set temp location to stop "Loading map..." spinner
        this.dropLoc = { lat: 27.7172, lng: 85.3240, label: 'Your Address' };
        this.geocodeAndSetLoc(this.buyerAddressString, 'drop');
        this.cdr.detectChanges();
      },
      error: () => {
        this.handleMissingAddress();
      }
    });
  }

  private handleMissingAddress() {
    this.toastService.warningResponse('Please set your address in Profile before ordering.');
    this.router.navigate(['/profile']);
  }

  private initMap() {
    // Handled by MapComponent
  }

  onMapLocationSelected(latlng: any) {
    this.dropLoc = { lat: latlng.lat, lng: latlng.lng, label: 'Selected Drop Location' };
    this.reverseGeocode(latlng);
  }

  private geocodeAndSetLoc(address: string, type: 'pickup' | 'drop') {
    if (!address || !isPlatformBrowser(this.platformId)) return;
    
    const addrObj = type === 'pickup' ? this.farmerAddress : this.buyerAddress;
    const queries = [address + ', Nepal'];
    
    if (addrObj) {
      if (addrObj.municipality) queries.push(`${addrObj.municipality}, ${addrObj.district}, Nepal`);
      if (addrObj.district) queries.push(`${addrObj.district}, Nepal`);
    }

    this.runGeocodeSequentially(queries, type);
  }

  private runGeocodeSequentially(queries: string[], type: 'pickup' | 'drop') {
    if (queries.length === 0) return;
    const query = queries.shift()!;
    
    // Fast fallback: Use photon.komoot.io for quicker geocoding
    const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=1`;
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`;
    
    fetch(photonUrl)
      .then(res => res.json())
      .then(data => {
        if (data.features?.length) {
            const feat = data.features[0];
            const coord = { lat: feat.geometry.coordinates[1], lng: feat.geometry.coordinates[0], label: feat.properties.name || query };
            if (type === 'pickup') this.pickupLoc = coord;
            else this.dropLoc = coord;
            this.cdr.detectChanges();
        } else {
            this.tryNominatim(nominatimUrl, queries, type);
        }
      })
      .catch(() => this.tryNominatim(nominatimUrl, queries, type));
  }

  private tryNominatim(url: string, queries: string[], type: 'pickup' | 'drop') {
    fetch(url)
      .then(res => res.ok ? res.json() : Promise.reject('CORS'))
      .then(data => this.handleGeocodeResult(data, queries, type))
      .catch(() => {
          const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
          fetch(proxyUrl)
            .then(res => res.json())
            .then(pData => this.handleGeocodeResult(JSON.parse(pData.contents), queries, type))
            .catch(() => this.runGeocodeSequentially(queries, type));
      });
  }

  private handleGeocodeResult(data: any, queries: string[], type: 'pickup' | 'drop') {
    if (data && data.length > 0) {
      const loc = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), label: data[0].display_name };
      if (type === 'pickup') this.pickupLoc = { ...loc };
      else this.dropLoc = { ...loc };
      this.cdr.detectChanges();
    } else {
      this.runGeocodeSequentially(queries, type);
    }
  }

  searchSuggestions(event: any) {
    // Disabled search suggestions as per user request
    this.suggestions = [];
  }

  onCheckpointsKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      const input = event.target as HTMLInputElement;
      const value = input.value?.trim();
      if (value) {
        let current = this.orderForm.get('checkpoints')?.value || [];
        if (current.length < 3) {
          if (!current.includes(value)) {
             current = [...current, value];
             this.orderForm.get('checkpoints')?.setValue(current);
             input.value = ''; // Clear input box after Enter
             this.cdr.detectChanges();
          }
        } else {
          this.toastService.warningResponse('Maximum 3 checkpoints allowed.');
        }
      }
      event.preventDefault();
    }
  }

  onSelectSuggestion(event: any) {
    const selected = event.value; // Selection from autocomplete
    this.dropLoc = { lat: selected.lat, lng: selected.lng, label: selected.label };
    this.orderForm.patchValue({ dropAddress: selected.label });
    this.buyerAddressString = selected.label;
    this.cdr.detectChanges();
  }

  private reverseGeocode(latlng: any) {
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.display_name) {
          this.orderForm.patchValue({ dropAddress: data.display_name });
          this.buyerAddressString = data.display_name;
          this.cdr.detectChanges();
        }
      })
      .catch(() => {});
  }

  onDistanceCalculated(distance: number) {
    this.deliveryDistance = distance;
    this.calculateDeliveryFee();
    this.cdr.detectChanges();
  }

  onAutoCheckpointsCalculated(checkpoints: string) {
    this.calculatedCheckpoints = checkpoints;
  }

  calculateDeliveryFee() {
    const qty = this.orderForm.get('orderQuantity')?.value || 0;
    if (this.deliveryDistance > 0 && qty > 0) {
      // Pricing logic: Rs 2 per KG + Rs 5 per KM
      this.deliveryFee = (qty * 2) + (this.deliveryDistance * 5);
    } else {
      this.deliveryFee = 0;
    }
  }

  get totalPrice(): number {
    const qty = this.orderForm.get('orderQuantity')?.value || 0;
    const itemTotal = qty * (this.stock?.pricePerUnit || 0);
    return itemTotal + this.deliveryFee;
  }

  submitOrder() {
    if (this.orderForm.invalid || !this.buyerAddress) {
      if (!this.buyerAddress) {
        this.handleMissingAddress();
      } else {
        this.toastService.warningResponse('Please fill all required fields.');
      }
      return;
    }

    const slug = this.route.snapshot.paramMap.get('slug');
    if (!slug) return;

    this.submitting = true;

    // Build checkpoints: prioritize user-defined checkpoints
    const userTags = this.orderForm.get('checkpoints')?.value || [];
    
    // If user provided custom checkpoints, use ONLY those. Otherwise fallback to auto-generated milestones.
    const finalCheckpointTags = userTags.length > 0 
      ? userTags 
      : (this.calculatedCheckpoints ? this.calculatedCheckpoints.split('|').map((s: string) => s.trim()) : []);
      
    const allCheckpoints = finalCheckpointTags.join(' | ');

    const request = {
      stockSlug: slug,
      orderQuantity: this.orderForm.get('orderQuantity')?.value,
      pickupAddress: this.orderForm.get('pickupAddress')?.value,
      dropAddress: this.orderForm.get('dropAddress')?.value,
      deliveryFee: this.deliveryFee,
      notes: this.orderForm.get('notes')?.value,
      checkpoints: allCheckpoints
    };

    this.orderService.createOrder(request).subscribe({
      next: (res: any) => {
        this.toastService.successResponse(res);
        this.submitting = false;
        // The backend now returns the orderId in the response object
        const orderId = res.response || res.data;
        if (orderId) {
            this.router.navigate(['/buyer/orders/track', orderId]);
        } else {
            this.router.navigate(['/buyer/dashboard']);
        }
      },
      error: (err: any) => {
        this.toastService.errorResponse(err);
        this.submitting = false;
      }
    });
  }
}
