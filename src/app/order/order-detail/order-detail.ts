import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { OrderService } from '../order.service';
import { ToastService } from '../../util/toast.service';
import { IOrderResponse } from '../IOrder';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { TimelineModule } from 'primeng/timeline';
import { CardModule } from 'primeng/card';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, TagModule, ButtonModule, TimelineModule, CardModule, RouterModule, ProgressSpinnerModule],
  templateUrl: './order-detail.html',
  styleUrl: './order-detail.css'
})
export class OrderDetailComponent implements OnInit {
  orderId: string | null = null;
  order: IOrderResponse | null = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService,
    private toastService: ToastService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('orderId');
      if (id) {
        this.orderId = id;
        this.fetchOrderDetails(id);
      }
    });
  }

  fetchOrderDetails(id: string): void {
    this.loading = true;
    this.orderService.getOrderById(id).subscribe({
      next: (res: any) => {
        this.order = res.response || res.data;
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

  getStatusSeverity(status?: string): "success" | "secondary" | "info" | "warn" | "danger" | "contrast" | undefined {
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

  goBack(): void {
    window.history.back();
  }
}
