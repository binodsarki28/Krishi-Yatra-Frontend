import { Component, OnInit, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { OrderService } from '../../order/order.service';
import { ToastService } from '../../util/toast.service';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-active-jobs',
  standalone: true,
  imports: [CommonModule, ButtonModule, TagModule, ProgressSpinnerModule, RouterModule],
  templateUrl: './active-jobs.html',
  styleUrls: ['./active-jobs.css']
})
export class ActiveJobsComponent implements OnInit {
  acceptedOrders: any[] = [];
  loading = false;

  constructor(
    private orderService: OrderService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: any
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadAcceptedOrders();
    }
  }

  loadAcceptedOrders() {
    this.loading = true;
    this.orderService.getAcceptedOrders().subscribe({
      next: (res: any) => {
        this.acceptedOrders = res.data || res.response || [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.toastService.errorResponse(err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  getVehicleIcon(type: string): string {
    const icons: any = {
      'BICYCLE': 'pi pi-directions-bike',
      'MOTORCYCLE': 'pi pi-car',
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
