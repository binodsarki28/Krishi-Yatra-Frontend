import { Component, OnInit, Input, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { RouterModule } from '@angular/router';
import { OrderService } from '../order.service';
import { IOrderResponse } from '../IOrder';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, TagModule, RouterModule],
  templateUrl: './order-list.html',
  styleUrls: ['./order-list.css']
})
export class OrderListComponent implements OnInit {
  @Input() role: 'FARMER' | 'BUYER' | 'DELIVERY' = 'BUYER';

  orders: IOrderResponse[] = [];
  loading = true;
  page = 0;
  size = 15;
  hasMore = false;
  totalOrders = 0;

  constructor(
    private orderService: OrderService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadOrders();
    }
  }

  loadOrders() {
    this.loading = true;
    this.cdr.markForCheck();

    let apiCall;
    switch (this.role) {
      case 'FARMER':
        apiCall = this.orderService.getFarmerOrders(this.page, this.size);
        break;
      case 'DELIVERY':
        apiCall = this.orderService.getDeliveryOrders(this.page, this.size);
        break;
      default:
        apiCall = this.orderService.getBuyerOrders(this.page, this.size);
    }

    apiCall.subscribe({
      next: (res: any) => {
        this.orders = res.response?.content || res.response || res.data || [];
        this.totalOrders = res.response?.totalElements || this.orders.length;
        this.hasMore = res.response?.totalPages > (this.page + 1);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.orders = [];
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  nextPage() {
    if (this.hasMore) {
      this.page++;
      this.loadOrders();
    }
  }

  prevPage() {
    if (this.page > 0) {
      this.page--;
      this.loadOrders();
    }
  }

  getStatusSeverity(status: string): "success" | "info" | "warn" | "danger" | "secondary" | "contrast" | undefined {
    const map: any = {
      'PENDING': 'warn',
      'ACCEPTED': 'info',
      'IN_TRANSIT': 'info',
      'DELIVERED': 'success',
      'CANCELLED': 'danger'
    };
    return map[status] || 'secondary';
  }

  getStatusLabel(status: string): string {
    const map: any = {
      'PENDING': 'Pending',
      'ACCEPTED': 'Accepted',
      'IN_TRANSIT': 'In Transit',
      'DELIVERED': 'Delivered',
      'CANCELLED': 'Cancelled'
    };
    return map[status] || status;
  }

  getRoleLabel(): string {
    switch (this.role) {
      case 'FARMER': return 'Farmer';
      case 'BUYER': return 'Buyer';
      case 'DELIVERY': return 'Linker';
      default: return '';
    }
  }

  getGradient(): string {
    switch (this.role) {
      case 'FARMER': return 'linear-gradient(135deg, #22c55e, #16a34a)';
      case 'BUYER': return 'linear-gradient(135deg, #3b82f6, #2563eb)';
      case 'DELIVERY': return 'linear-gradient(135deg, #f59e0b, #d97706)';
      default: return 'linear-gradient(135deg, #6366f1, #4f46e5)';
    }
  }
}
