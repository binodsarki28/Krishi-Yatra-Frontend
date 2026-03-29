import { Component, OnInit, Input, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { RouterModule, Router } from '@angular/router';
import { OrderService } from '../order.service';
import { IOrderResponse } from '../IOrder';

import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, TagModule, RouterModule, SelectModule, InputTextModule, FormsModule],
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

  // Filters
  selectedStatus: string | null = null;
  searchText: string = '';
  statusOptions = [
    { label: 'All Status', value: null },
    { label: 'Waiting for Rider', value: 'PENDING' },
    { label: 'Rider Accepted', value: 'ACCEPTED' },
    { label: 'Shipping', value: 'SHIPPING' },
    { label: 'Delivered', value: 'DELIVERED' },
    { label: 'Cancelled', value: 'CANCELLED' }
  ];

  constructor(
    private orderService: OrderService,
    private cdr: ChangeDetectorRef,
    private router: Router,
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
        apiCall = this.orderService.getFarmerOrders(this.page, this.size, this.selectedStatus, this.searchText);
        break;
      case 'DELIVERY':
        apiCall = this.orderService.getDeliveryOrders(this.page, this.size, this.selectedStatus, this.searchText);
        break;
      default:
        apiCall = this.orderService.getBuyerOrders(this.page, this.size, this.selectedStatus, this.searchText);
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

  onFilterChange() {
    this.page = 0;
    this.loadOrders();
  }

  getStatusSeverity(status: string): "success" | "info" | "warn" | "danger" | "secondary" | "contrast" | undefined {
    const map: any = {
      'PENDING': 'warn',
      'ACCEPTED': 'info',
      'SHIPPING': 'info',
      'DELIVERED': 'success',
      'REJECTED': 'danger',
      'CANCELLED': 'danger'
    };
    return map[status] || 'secondary';
  }

  getStatusLabel(status: string): string {
    const map: any = {
      'PENDING': 'Waiting for Rider',
      'ACCEPTED': 'Rider Accepted',
      'SHIPPING': 'Shipping',
      'DELIVERED': 'Delivered',
      'REJECTED': 'Cancelled',
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

  viewStockDetail(slug: string) {
    if (this.router) {
      this.router.navigate(['/stock-detail', slug]);
    }
  }
}
