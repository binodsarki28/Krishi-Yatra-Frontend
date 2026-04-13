import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
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
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { DialogModule } from 'primeng/dialog';
import { TextareaModule } from 'primeng/textarea';

@Component({
  selector: 'app-buyer-orders',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, TagModule, RouterModule, SelectModule, InputTextModule, FormsModule, IconFieldModule, InputIconModule, ToastModule, DialogModule, TextareaModule],
  providers: [MessageService],
  templateUrl: './buyer-orders.html',
  styleUrls: ['./buyer-orders.css']
})
export class BuyerOrdersComponent implements OnInit {
  orders: IOrderResponse[] = [];
  loading = true;
  page = 0;
  size = 15;
  hasMore = false;
  totalOrders = 0;

  // Conflict handling
  showConflictDialog = false;
  submittingConflict = false;
  conflictMessage = '';
  selectedOrderForConflict: string | null = null;

  // Filters
  selectedStatus: string | null = null;
  searchText: string = '';
  statusOptions = [
    { label: 'All Status', value: null },
    { label: 'Waiting for Rider', value: 'PENDING' },
    { label: 'Rider Accepted', value: 'ACCEPTED' },
    { label: 'Shipping', value: 'SHIPPING' },
    { label: 'Delivered', value: 'DELIVERED' },
    { label: 'Conflict', value: 'CONFLICT' },
    { label: 'Resolved', value: 'RESOLVED' },
    { label: 'Cancelled', value: 'CANCELLED' }
  ];

  private searchSubject = new Subject<void>();

  constructor(
    private orderService: OrderService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private messageService: MessageService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    this.searchSubject.pipe(debounceTime(400)).subscribe(() => {
        this.loadOrders();
    });

    if (isPlatformBrowser(this.platformId)) {
      this.loadOrders();
    }
  }

  loadOrders() {
    this.loading = true;
    this.cdr.markForCheck();

    this.orderService.getBuyerOrders(this.page, this.size, this.selectedStatus, this.searchText).subscribe({
      next: (res: any) => {
        this.orders = res.response?.content || res.response || res.data || [];
        this.totalOrders = res.response?.totalElements || this.orders.length;
        this.hasMore = res.response ? res.response.totalPages > (this.page + 1) : false;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load orders' });
        this.orders = [];
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Conflict logic
  openConflictDialog(orderId: string) {
    this.selectedOrderForConflict = orderId;
    this.conflictMessage = '';
    this.showConflictDialog = true;
  }

  submitConflict() {
    if (!this.conflictMessage.trim() || !this.selectedOrderForConflict) return;

    this.submittingConflict = true;
    this.orderService.reportConflict(this.selectedOrderForConflict, this.conflictMessage).subscribe({
      next: (res) => {
        this.messageService.add({ severity: 'success', summary: 'Reported', detail: 'Conflict message sent to admin.' });
        this.showConflictDialog = false;
        this.submittingConflict = false;
        this.loadOrders();
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to report conflict.' });
        this.submittingConflict = false;
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

  onFilterChange(immediate = false) {
    this.page = 0;
    if (immediate) {
        this.loadOrders();
    } else {
        this.searchSubject.next();
    }
  }

  getStatusSeverity(status: string): "success" | "info" | "warn" | "danger" | "secondary" | "contrast" | undefined {
    const map: any = {
      'PENDING': 'warn',
      'ACCEPTED': 'info',
      'SHIPPING': 'info',
      'DELIVERED': 'success',
      'REJECTED': 'danger',
      'CANCELLED': 'danger',
      'CONFLICT': 'danger',
      'RESOLVED': 'success'
    };
    return map[status] || 'secondary';
  }

  getStatusLabel(status: string): string {
    const map: any = {
      'PENDING': 'Waiting for Rider',
      'ACCEPTED': 'Rider Accepted',
      'SHIPPING': 'Shipping',
      'DELIVERED': 'Delivered',
      'REJECTED': 'Rejected',
      'CANCELLED': 'Cancelled',
      'CONFLICT': 'Conflict (Reported)',
      'RESOLVED': 'Resolved'
    };
    return map[status] || status;
  }

  viewStockDetail(slug: string) {
    this.router.navigate(['/stock-detail', slug]);
  }

  isConflictAllowed(order: IOrderResponse): boolean {
    if (order.orderStatus !== 'DELIVERED') return false;
    
    const targetDateStr = order.deliveredAt || order.createdAt;
    if (!targetDateStr) return false;

    const targetDate = new Date(targetDateStr);
    const now = new Date();
    const msPerDay = 1000 * 60 * 60 * 24;
    const diffDays = (now.getTime() - targetDate.getTime()) / msPerDay;

    return diffDays <= 5;
  }
}
