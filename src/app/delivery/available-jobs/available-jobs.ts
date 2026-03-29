import { Component, OnInit, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { OrderService } from '../../order/order.service';
import { ToastService } from '../../util/toast.service';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-available-jobs',
  standalone: true,
  imports: [CommonModule, ButtonModule, TagModule, ProgressSpinnerModule, RouterModule],
  templateUrl: './available-jobs.html',
  styleUrls: ['./available-jobs.css']
})
export class AvailableJobsComponent implements OnInit {
  pendingOrders: any[] = [];
  selectedOrder: any = null;
  loading = false;
  accepting = false;

  constructor(
    private orderService: OrderService,
    private toastService: ToastService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: any
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadPendingOrders();
    }
  }

  loadPendingOrders() {
    this.loading = true;
    this.orderService.getPendingOrders().subscribe({
      next: (res: any) => {
        this.pendingOrders = res.data || res.response || [];
        this.loading = false;
        if (this.pendingOrders.length > 0 && !this.selectedOrder) {
          this.selectedOrder = this.pendingOrders[0];
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

  selectOrder(order: any) {
    this.selectedOrder = order;
    this.cdr.detectChanges();
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
