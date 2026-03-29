import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { OrderService } from '../../order/order.service';
import { ToastService } from '../../util/toast.service';
import { Router } from '@angular/router';
import { Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-order',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    TagModule,
    TooltipModule,
    IconFieldModule,
    InputIconModule,
    ConfirmDialogModule
  ],
  providers: [ConfirmationService],
  templateUrl: './order.html',
  styleUrl: './order.css',
})
export class Order implements OnInit {
  orders: any[] = [];
  loading = false;
  page = 0;
  pageSize = 10;
  hasMore = true;
  activeFilter = 'all';

  filters = {
    search: '',
    status: '',
    orderId: '',
    buyer: '',
    farmer: '',
    delivery: ''
  };

  private searchSubject = new Subject<void>();

  statusOptions = [
    { label: 'All Statuses', value: '' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Accepted', value: 'ACCEPTED' },
    { label: 'Shipping', value: 'SHIPPING' },
    { label: 'Delivered', value: 'DELIVERED' },
    { label: 'Rejected', value: 'REJECTED' },
    { label: 'Conflict', value: 'CONFLICT' },
    { label: 'Resolved', value: 'RESOLVED' }
  ];

  constructor(
    private orderService: OrderService,
    private toastService: ToastService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private confirmationService: ConfirmationService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    this.setupSearch();
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        this.loadOrders();
      }, 0);
    }
  }

  setupSearch() {
    this.searchSubject.pipe(
      debounceTime(400)
    ).subscribe(() => {
      this.loadOrders(true);
    });
  }

  loadOrders(reset = false) {
    if (reset) {
      this.page = 0;
      this.orders = [];
    }

    this.loading = true;
    this.cdr.markForCheck();

    this.orderService.getAllOrders(this.page, this.pageSize, this.filters.status, this.filters.search, this.filters).subscribe({
      next: (res: any) => {
        const data = res.response || res.data || [];
        this.orders = data;
        this.hasMore = data.length === this.pageSize;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.toastService.errorResponse(err);
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  onSearch(immediate = false) {
    if (immediate) {
      this.loadOrders(true);
    } else {
      this.searchSubject.next();
    }
  }

  clearFilters() {
    this.filters = { search: '', status: '', orderId: '', buyer: '', farmer: '', delivery: '' };
    this.activeFilter = 'all';
    this.onSearch(true);
  }

  setFilter(filter: string) {
    this.activeFilter = filter;
    this.filters.status = filter === 'all' ? '' : filter.toUpperCase();
    this.onSearch(true);
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
      this.loadOrders(true);
    }
  }

  viewTrack(orderId: string) {
    // Admin can view buyer tracking for any order
    this.router.navigate(['/order/track', orderId]);
  }

  resolveConflict(orderId: string) {
    this.confirmationService.confirm({
        message: 'Are you sure you want to mark this conflict as resolved?',
        header: 'Resolve Conflict',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
            this.loading = true;
            this.orderService.resolveConflict(orderId).subscribe({
                next: (res: any) => {
                    this.toastService.successResponse({ message: 'Conflict resolved successfully.' });
                    this.loadOrders(true);
                },
                error: (err: any) => {
                    this.toastService.errorResponse(err);
                    this.loading = false;
                    this.cdr.markForCheck();
                }
            });
        }
    });
  }

  getStatusSeverity(status: string): "success" | "secondary" | "info" | "warn" | "danger" | "contrast" | undefined {
    switch (status) {
      case 'DELIVERED': return 'success';
      case 'SHIPPING': return 'info';
      case 'ACCEPTED': return 'warn';
      case 'PENDING': return 'secondary';
      case 'REJECTED': return 'danger';
      case 'CONFLICT': return 'danger';
      case 'RESOLVED': return 'success';
      default: return 'secondary';
    }
  }
}
