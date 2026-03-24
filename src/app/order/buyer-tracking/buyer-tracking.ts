import { Component, OnInit, ChangeDetectorRef, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { DeliveryAppService } from '../../delivery/delivery.service';
import { MapComponent } from '../../common/map/map';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { TimelineModule } from 'primeng/timeline';
import { ToastService } from '../../util/toast.service';

@Component({
  selector: 'app-buyer-tracking',
  standalone: true,
  imports: [
    CommonModule, 
    MapComponent, 
    TagModule, 
    CardModule, 
    TimelineModule,
    RouterModule
  ],
  templateUrl: './buyer-tracking.html',
  styleUrls: ['./buyer-tracking.css']
})
export class BuyerTracking implements OnInit {
  orderId: string | null = null;
  order: any = null;
  pickupLoc: any = null;
  dropLoc: any = null;
  loading: boolean = true;
  checkpointList: any[] = [];

  statusTimeline: any[] = [
    { status: 'Order Created', icon: 'pi pi-shopping-cart', color: '#607D8B', value: 'PENDING' },
    { status: 'Rider Accepted', icon: 'pi pi-user', color: '#9C27B0', value: 'ACCEPTED' },
    { status: 'Picked Up', icon: 'pi pi-box', color: '#FF9800', value: 'SHIPPING' },
    { status: 'Delivered', icon: 'pi pi-check-circle', color: '#4CAF50', value: 'DELIVERED' }
  ];

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
      // Auto-refresh every 30 seconds for real-time vibe
      if (isPlatformBrowser(this.platformId)) {
          setInterval(() => {
              this.loadOrderDetails(true);
          }, 30000);
      }
    }
  }

  loadOrderDetails(silent = false) {
    if (!this.orderId) return;
    if (!silent) this.loading = true;
    
    this.deliveryService.getOrderDetails(this.orderId).subscribe({
      next: (res: any) => {
        this.order = res.response || res.data;
        if (!this.order) {
          if (!silent) this.toastService.errorResponse({ message: 'Order not found' });
          this.loading = false;
          return;
        }
        
        // Initial temp load
        if (!this.pickupLoc) {
            this.pickupLoc = { lat: 27.7, lng: 85.3, label: 'Farmer Location' };
            this.dropLoc = { lat: 27.71, lng: 85.32, label: 'Your Location' };
            this.geocodeLocations();
        }
        
        this.parseCheckpoints(this.order.checkpoints);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        if (!silent) this.toastService.errorResponse(err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private geocodeLocations() {
    if (this.order?.pickupAddress) this.geocode(this.order.pickupAddress, 'pickup');
    if (this.order?.dropAddress) this.geocode(this.order.dropAddress, 'drop');
  }

  private geocode(address: string, type: 'pickup' | 'drop') {
    if (!address || !isPlatformBrowser(this.platformId)) return;
    const queries = [address + ', Nepal'];
    this.runGeocodeSequentially(queries, type);
  }

  private runGeocodeSequentially(queries: string[], type: 'pickup' | 'drop') {
    if (queries.length === 0) return;
    const query = queries.shift()!;
    const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=1`;
    
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
            this.runGeocodeSequentially(queries, type);
        }
      })
      .catch(() => this.runGeocodeSequentially(queries, type));
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

  getStatusSeverity(status: string): 'info' | 'warn' | 'success' | 'danger' | 'secondary' {
    switch (status) {
      case 'PENDING': return 'warn';
      case 'ACCEPTED': return 'info';
      case 'SHIPPING': return 'info';
      case 'DELIVERED': return 'success';
      default: return 'secondary';
    }
  }

  isStatusReached(status: string): boolean {
      const orderStatus = this.order?.orderStatus || 'PENDING';
      const orderIndex = this.statusTimeline.findIndex(s => s.value === orderStatus);
      const targetIndex = this.statusTimeline.findIndex(s => s.value === status);
      return targetIndex <= orderIndex;
  }
}
