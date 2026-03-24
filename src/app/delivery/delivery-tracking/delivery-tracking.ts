import { Component, OnInit, ChangeDetectorRef, inject, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DeliveryAppService } from '../delivery.service';
import { MapComponent } from '../../common/map/map';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { CheckboxModule } from 'primeng/checkbox';
import { CardModule } from 'primeng/card';
import { ToastService } from '../../util/toast.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-delivery-tracking',
  standalone: true,
  imports: [
    CommonModule, 
    MapComponent, 
    ButtonModule, 
    TagModule, 
    CheckboxModule, 
    CardModule, 
    FormsModule,
    RouterModule
  ],
  templateUrl: './delivery-tracking.html',
  styleUrls: ['./delivery-tracking.css']
})
export class DeliveryTracking implements OnInit {
  orderId: string | null = null;
  order: any = null;
  pickupLoc: any = null;
  dropLoc: any = null;
  loading: boolean = true;
  checkpointList: any[] = [];
  completing = false;
  progress: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private deliveryService: DeliveryAppService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: any
  ) {}

  ngOnInit() {
    this.orderId = this.route.snapshot.paramMap.get('orderId');
    if (this.orderId) {
      this.loadOrderDetails();
    }
  }

  loadOrderDetails() {
    if (!this.orderId) return;
    this.loading = true;
    this.deliveryService.getOrderDetails(this.orderId).subscribe({
      next: (res: any) => {
        this.order = res.response || res.data;
        if (!this.order) {
          this.toastService.errorResponse({ message: 'Order not found' });
          this.loading = false;
          return;
        }
        
        // Instant load temp coords
        this.pickupLoc = { lat: 27.7, lng: 85.3, label: 'Farmer Location' };
        this.dropLoc = { lat: 27.71, lng: 85.32, label: 'Customer Location' };
        
        this.parseCheckpoints(this.order.checkpoints);
        this.geocodeLocations();
        this.updateProgress();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.toastService.errorResponse(err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private geocodeLocations() {
    if (this.order.pickupAddress) {
      this.geocode(this.order.pickupAddress, 'pickup');
    }
    if (this.order.dropAddress) {
      this.geocode(this.order.dropAddress, 'drop');
    }
  }

  private geocode(address: string, type: 'pickup' | 'drop') {
    if (!address || !isPlatformBrowser(this.platformId)) return;
    
    const parts = address.split(',').map(p => p.trim());
    const queries = [address + ', Nepal'];
    
    if (parts.length > 2) {
        queries.push(parts.slice(1).join(', ') + ', Nepal');
        queries.push(parts.slice(-4).join(', ') + ', Nepal');
    }

    this.runGeocodeSequentially(queries, type);
  }

  private runGeocodeSequentially(queries: string[], type: 'pickup' | 'drop') {
    if (queries.length === 0) return;
    const query = queries.shift()!;
    
    // Use photon for everything now, it's reliable and fast
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

  private parseCheckpoints(checkpointStr: string) {
    if (!checkpointStr) {
      this.checkpointList = [];
      return;
    }
    this.checkpointList = checkpointStr.split('|').map(item => ({
      label: item.replace('(Reached)', '').replace('[X]', '').trim(),
      checked: item.includes('(Reached)') || item.includes('[X]')
    })).filter(cp => cp.label.length > 0);
  }

  private updateProgress() {
    if (this.checkpointList.length === 0) {
        this.progress = 0;
        return;
    }
    const reachedCount = this.checkpointList.filter(c => c.checked).length;
    this.progress = reachedCount / this.checkpointList.length;
  }

  get canCompleteDelivery(): boolean {
    if (this.checkpointList.length === 0) return true;
    return this.checkpointList.every(c => c.checked);
  }

  onCheckpointToggle(index: number) {
    const cp = this.checkpointList[index];
    const newStr = this.checkpointList.map(c => 
      c.checked ? `${c.label} (Reached)` : c.label
    ).join(' | ');

    this.updateProgress();

    if (this.orderId) {
      this.deliveryService.updateCheckpoints(this.orderId, newStr).subscribe({
        next: () => {
          this.toastService.successResponse({ message: `Status updated for: ${cp.label}` });
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.toastService.errorResponse(err);
        }
      });
    }
  }

  markAsDelivered() {
    if (!this.orderId) return;
    if (!this.canCompleteDelivery) {
        this.toastService.warningResponse('Please reach all checkpoints first!');
        return;
    }

    this.completing = true;
    this.deliveryService.markAsDelivered(this.orderId).subscribe({
      next: () => {
        this.toastService.successResponse({ message: 'Order delivered successfully!' });
        this.completing = false;
        setTimeout(() => this.router.navigate(['/delivery/dashboard']), 1500);
      },
      error: (err) => {
        this.toastService.errorResponse(err);
        this.completing = false;
      }
    });
  }

  markAsPickedUp() {
    if (!this.orderId) return;
    this.completing = true;
    this.deliveryService.markAsPickedUp(this.orderId).subscribe({
        next: (res: any) => {
            this.toastService.successResponse(res);
            this.order.orderStatus = 'SHIPPING';
            this.completing = false;
            this.cdr.detectChanges();
        },
        error: (err: any) => {
            this.toastService.errorResponse(err);
            this.completing = false;
            this.cdr.detectChanges();
        }
    });
  }
}
