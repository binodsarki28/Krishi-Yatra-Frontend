import { Component, OnInit, ChangeDetectorRef, inject, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { OrderService } from '../../order/order.service';
import { ToastService } from '../../util/toast.service';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MapComponent } from '../../common/map/map';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-delivery-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    ButtonModule, 
    CardModule, 
    TagModule, 
    ProgressSpinnerModule, 
    MapComponent,
    RouterModule
  ],
  templateUrl: './delivery-dashboard.html',
  styleUrls: ['./delivery-dashboard.css']
})
export class DeliveryDashboard implements OnInit {
  pendingOrders: any[] = [];
  acceptedOrders: any[] = [];
  selectedOrder: any = null;
  loading = false;
  accepting = false;
  mapVisible = true; // For force-reloading map
  currentTab: 'available' | 'active' = 'available';

  // Map Data for selected order
  pickupLoc: any = null;
  dropLoc: any = null;

  constructor(
    private orderService: OrderService,
    private toastService: ToastService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: any
  ) {}

  ngOnInit() {
    this.loadPendingOrders();
    this.loadAcceptedOrders();
  }

  loadPendingOrders() {
    this.loading = true;
    this.orderService.getPendingOrders().subscribe({
      next: (res: any) => {
        this.pendingOrders = res.data || res.response || [];
        this.loading = false;
        
        if (this.currentTab === 'available' && this.pendingOrders.length > 0 && !this.selectedOrder) {
            this.selectOrder(this.pendingOrders[0]);
        }
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.toastService.errorResponse(err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadAcceptedOrders() {
    this.orderService.getAcceptedOrders().subscribe({
      next: (res: any) => {
        this.acceptedOrders = res.data || res.response || [];
        this.cdr.detectChanges();
        
        if (this.currentTab === 'active' && this.acceptedOrders.length > 0 && !this.selectedOrder) {
            this.selectOrder(this.acceptedOrders[0]);
        }
      }
    });
  }

  switchTab(tab: 'available' | 'active') {
    this.currentTab = tab;
    this.selectedOrder = null;
    this.mapVisible = false;
    this.cdr.detectChanges();
    
    setTimeout(() => {
        this.mapVisible = true;
        const list = tab === 'available' ? this.pendingOrders : this.acceptedOrders;
        if (list.length > 0) {
            this.selectOrder(list[0]);
        }
        this.cdr.detectChanges();
    }, 100);
  }

  selectOrder(order: any) {
    this.selectedOrder = null;
    this.mapVisible = false;
    this.cdr.detectChanges();
    
    setTimeout(() => {
        this.selectedOrder = order;
        // Instant temp coords for immediate map view
        this.pickupLoc = { lat: 27.7, lng: 85.3, label: 'Farmer Location' };
        this.dropLoc = { lat: 27.72, lng: 85.32, label: 'Buyer Location' };
        this.mapVisible = true;
        this.cdr.detectChanges();
        
        // Resolve Geocoding for map
        this.geocode(order.pickupAddress, 'pickup');
        this.geocode(order.dropAddress, 'drop');
    }, 10);
  }

  private geocode(address: string, type: 'pickup' | 'drop') {
    if (!address || !isPlatformBrowser(this.platformId)) return;
    
    // Fallback logic: try full address, then municipality/district
    const parts = address.split(',').map(p => p.trim());
    const queries = [address + ', Nepal'];
    
    if (parts.length > 2) {
        // Try without the first specific part (e.g. shop name)
        queries.push(parts.slice(1).join(', ') + ', Nepal');
        // Try just the municipality and district
        queries.push(parts.slice(-4).join(', ') + ', Nepal');
    }

    this.runGeocodeSequentially(queries, type);
  }

  private runGeocodeSequentially(queries: string[], type: 'pickup' | 'drop') {
    if (queries.length === 0) return;
    const query = queries.shift()!;
    
    // Use photon for high-speed resolving
    const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=1`;
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`;
    
    fetch(photonUrl)
      .then(res => res.json())
      .then(data => {
        if (data.features?.length) {
            const feat = data.features[0];
            const coord = { lat: feat.geometry.coordinates[1], lng: feat.geometry.coordinates[0], label: feat.properties.name || query };
            if (type === 'pickup') this.pickupLoc = { ...coord };
            else this.dropLoc = { ...coord };
            this.cdr.detectChanges();
        } else {
            this.tryNominatimInDashboard(nominatimUrl, queries, type);
        }
      })
      .catch(() => this.tryNominatimInDashboard(nominatimUrl, queries, type));
  }

  private tryNominatimInDashboard(url: string, queries: string[], type: 'pickup' | 'drop') {
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

  acceptOrder() {
    if (!this.selectedOrder) return;
    
    const id = this.selectedOrder.orderId;
    this.accepting = true;
    this.orderService.acceptOrder(id).subscribe({
      next: (res: any) => {
        this.toastService.successResponse(res);
        this.accepting = false;
        this.router.navigate(['/delivery/track', id]);
      },
      error: (err: any) => {
        this.toastService.errorResponse(err);
        this.accepting = false;
        this.cdr.detectChanges();
      }
    });
  }

  getVehicleIcon(type: string): string {
    const icons: any = {
      'BICYCLE': 'pi pi-directions-bike',
      'MOTORCYCLE': 'pi pi-directions-bike',
      'AUTO': 'pi pi-truck',
      'TAXI': 'pi pi-car',
      'JEEP': 'pi pi-car',
      'VAN': 'pi pi-truck',
      'PICKUP': 'pi pi-truck',
      'TRACTOR': 'pi pi-truck',
      'TRUCK': 'pi pi-truck'
    };
    return icons[type] || 'pi pi-box';
  }
}
