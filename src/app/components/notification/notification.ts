import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { BadgeModule } from 'primeng/badge';
import { TooltipModule } from 'primeng/tooltip';
import { PaginatorModule } from 'primeng/paginator';
import { Router } from '@angular/router';
import { AccountService } from '../account/account.service';
import { NotificationService, INotification } from './notification.service';
import { finalize, fromEvent, debounceTime } from 'rxjs';
import { ToastService } from '../../util/toast.service';
import { inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    TagModule,
    BadgeModule,
    TooltipModule,
    PaginatorModule
  ],
  templateUrl: './notification.html',
  styles: [`
    p-button {
      display: inline-block;
    }
    .notification-card {
      transition: all 0.2s ease;
    }
    .notification-card.opacity-60 {
      background-color: var(--surface-fafafa);
    }
  `]
})
export class NotificationComponent implements OnInit, OnDestroy {
  notifications: INotification[] = [];
  loading: boolean = false;
  totalRecords: number = 0;
  rows: number = 10;
  first: number = 0;
  page: number = 0;
  unreadCountManual: number = 0;
  hasMore: boolean = true;
  isBrowser: boolean = false;
  private messageSubscription?: Subscription;
  private platformId = inject(PLATFORM_ID);

  constructor(
    private notificationService: NotificationService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef,
    public router: Router,
    private accountService: AccountService
  ) {}

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return; // Skip everything during SSR
    this.isBrowser = true;
    this.fetchNotifications();
    this.setupInfiniteScroll();
    this.listenForNewMessages();
  }

  listenForNewMessages() {
    this.messageSubscription = this.notificationService.newMessage$.subscribe({
      next: (notif) => {
        if (notif) {
          // Prepend the new notification to the list
          this.notifications = [notif, ...this.notifications];
          this.totalRecords++;
          this.updateUnreadCount();
          this.cdr.detectChanges();
        }
      }
    });
  }

  ngOnDestroy() {
    this.messageSubscription?.unsubscribe();
  }

  setupInfiniteScroll() {
    if (!isPlatformBrowser(this.platformId)) return;

    fromEvent(window, 'scroll')
      .pipe(debounceTime(150)) // Slightly higher debounce
      .subscribe(() => {
        const threshold = 100; // Trigger closer to the bottom
        const position = window.scrollY + window.innerHeight;
        const height = document.documentElement.scrollHeight;

        // Ensure we only load more if not already loading and there's more to fetch
        if (position >= height - threshold && !this.loading && this.hasMore) {
          this.loadMore();
        }
      });
  }

  fetchNotifications(isLoadMore = false) {
    if (!isPlatformBrowser(this.platformId)) return; // No API calls during SSR
    if (this.loading) return;
    this.loading = true;

    this.notificationService.getNotifications(this.page, this.rows)
      .pipe(finalize(() => {
        this.loading = false;
        this.updateUnreadCount();
      }))
      .subscribe({
        next: (res) => {
          const newNotifs = (res.response as INotification[]) || [];
          
          if (isLoadMore) {
            // Filter out existing to prevent duplicates
            const filtered = newNotifs.filter(nn => !this.notifications.some(on => on.id === nn.id));
            this.notifications = [...this.notifications, ...filtered];
          } else {
            this.notifications = newNotifs;
          }
          
          this.totalRecords = Number(res.totalItems) || 0;
          this.hasMore = this.notifications.length < this.totalRecords;
          this.cdr.detectChanges();
        },
        error: (err) => {
          // Only log non-401 errors (401 is expected when not logged in)
          if (err?.status !== 401) {
            console.error('Error fetching notifications', err);
            this.toastService.errorResponse(err);
          }
        }
      });
  }

  loadMore() {
    this.page++;
    this.fetchNotifications(true);
  }

  updateUnreadCount() {
    this.unreadCountManual = this.notifications.filter(n => !n.read).length;
    // Also update the global unread count via service if manually filtered
    this.notificationService.updateUnreadCount(this.unreadCountManual);
    this.cdr.detectChanges();
  }

  markAsRead(notification: INotification) {
    if (notification.read) return;
    
    // Optimistic UI update
    notification.read = true;
    this.updateUnreadCount();

    this.notificationService.markAsRead(notification.id).subscribe({
      next: (res) => {
          this.toastService.successResponse(res);
      },
      error: (err) => {
        // Rollback if failed
        notification.read = false;
        this.updateUnreadCount();
        this.toastService.errorResponse(err);
      }
    });
  }

  markAllAsRead() {
    // Optimistic UI update
    const previousStates = this.notifications.map(n => ({ id: n.id, read: n.read }));
    this.notifications.forEach(n => n.read = true);
    this.updateUnreadCount();

    this.notificationService.markAllAsRead().subscribe({
        next: (res) => {
            this.toastService.successResponse(res);
        },
        error: (err) => {
            // Rollback
            this.notifications.forEach(n => {
                const prev = previousStates.find(p => p.id === n.id);
                if (prev) n.read = prev.read;
            });
            this.updateUnreadCount();
            this.toastService.errorResponse(err);
        }
    });
  }

  deleteNotification(id: number) {
    // Optimistic removal
    const backupItem = this.notifications.find(n => n.id === id);
    const backupIndex = this.notifications.findIndex(n => n.id === id);

    this.notifications = this.notifications.filter(n => n.id !== id);
    this.updateUnreadCount();

    this.notificationService.deleteNotification(id).subscribe({
      next: (res) => {
        this.toastService.successResponse(res);
      },
      error: (err) => {
        // Rollback
        if (backupItem) {
          this.notifications.splice(backupIndex, 0, backupItem);
          this.updateUnreadCount();
        }
        this.toastService.errorResponse(err);
      }
    });
  }

  handleAction(notification: INotification) {
    this.markAsRead(notification);
    
    // Priority 1: Use direct Action URL from backend (New & Robust system)
    if (notification.actionUrl) {
      this.router.navigate([notification.actionUrl]);
      return;
    }

    // Priority 2: Fallback logic for legacy notifications (Legacy & Fragile)
    let link = '';
    const roles = this.accountService.getRoles();
    const isVerifiedRider = this.accountService.isRoleVerified('DELIVERY');

    if (notification.category.startsWith('ORDER')) {
      const match = notification.body.match(/ID: ([a-f0-9-]{36})/i);
      const orderId = match ? match[1] : '';

      if (orderId) {
        if (isVerifiedRider) link = '/delivery/jobs/available';
        else if (this.accountService.isRoleVerified('FARMER')) link = `/farmer/orders/track/${orderId}`;
        else if (this.accountService.isRoleVerified('BUYER')) link = `/buyer/orders/track/${orderId}`;
        else link = `/order/track/${orderId}`;
      } else {
        if (isVerifiedRider) link = '/delivery/jobs/available';
        else if (this.accountService.isRoleVerified('FARMER')) link = '/farmer/orders/my-orders';
        else if (this.accountService.isRoleVerified('BUYER')) link = '/buyer/orders/my-orders';
      }
    } else if (notification.category.startsWith('DEMAND')) {
        link = this.accountService.isRoleVerified('FARMER') ? '/farmer/demands' : '/demands';
    } else if (notification.category === 'STOCK_LOW') {
        link = '/farmer/stocks/my-stocks';
    }

    if (link) {
      this.router.navigate([link]);
    }
  }

  getIcon(category: string) {
    if (category.startsWith('ORDER')) return 'pi pi-shopping-bag';
    if (category.startsWith('DEMAND')) return 'pi pi-megaphone';
    if (category === 'STOCK_LOW') return 'pi pi-box';
    if (category.startsWith('VERIFICATION')) return 'pi pi-check-circle';
    return 'pi pi-bell';
  }

  getSeverity(category: string): 'info' | 'success' | 'warn' | 'danger' {
    if (category.endsWith('FAILURE') || category === 'ORDER_CONFLICT') return 'danger';
    if (category.endsWith('SUCCESS') || category.endsWith('ACCEPTED') || category.endsWith('DELIVERED')) return 'success';
    if (category === 'STOCK_LOW') return 'warn';
    return 'info';
  }
}
