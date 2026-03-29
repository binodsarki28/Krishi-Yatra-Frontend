import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { BadgeModule } from 'primeng/badge';
import { TooltipModule } from 'primeng/tooltip';
import { Router } from '@angular/router';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'order' | 'stock' | 'demand' | 'system' | 'conflict';
  severity: 'info' | 'success' | 'warn' | 'danger';
  timestamp: Date;
  read: boolean;
  link?: string;
}

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    TagModule,
    BadgeModule,
    TooltipModule
  ],
  templateUrl: './notification.html',
  styleUrl: './notification.css'
})
export class NotificationComponent implements OnInit {
  notifications: Notification[] = [];
  loading: boolean = false;
  activeFilter: 'all' | 'unread' = 'all';

  constructor(
    public router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadMockNotifications();
  }

  loadMockNotifications() {
    this.loading = true;
    // Simulate API delay
    setTimeout(() => {
      this.notifications = [
        {
          id: 1,
          title: 'Order Status Update',
          message: 'Your order for "Fresh organic Red Tomatoes" has been accepted by the farmer.',
          type: 'order',
          severity: 'success',
          timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
          read: false,
          link: '/order/list'
        },
        {
          id: 2,
          title: 'Conflict Reported',
          message: 'A buyer has reported a conflict regarding "Grade A Potatoes". Please review the details.',
          type: 'conflict',
          severity: 'danger',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
          read: false,
          link: '/order/farmer-orders'
        },
        {
          id: 3,
          title: 'New Demand Alert',
          message: 'A new demand for "Organic Ginger" has been posted in your region.',
          type: 'demand',
          severity: 'info',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
          read: true,
          link: '/demands'
        },
        {
          id: 4,
          title: 'Stock Running Low',
          message: 'Your stock for "Dry Onions" is below the minimum threshold.',
          type: 'stock',
          severity: 'warn',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
          read: true,
          link: '/farmer/stocks/my-stocks'
        },
        {
          id: 5,
          title: 'Profile Verified',
          message: 'Congratulations! Your profile has been successfully verified by the admin.',
          type: 'system',
          severity: 'success',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
          read: true
        }
      ];
      this.loading = false;
      this.cdr.detectChanges();
    }, 800);
  }

  get filteredNotifications() {
    if (this.activeFilter === 'unread') {
      return this.notifications.filter(n => !n.read);
    }
    return this.notifications;
  }

  get unreadCount() {
    return this.notifications.filter(n => !n.read).length;
  }

  markAsRead(id: number) {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.read = true;
      this.cdr.detectChanges();
    }
  }

  markAllAsRead() {
    this.notifications.forEach(n => n.read = true);
    this.cdr.detectChanges();
  }

  deleteNotification(id: number) {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.cdr.detectChanges();
  }

  handleAction(notification: Notification) {
    this.markAsRead(notification.id);
    if (notification.link) {
      this.router.navigate([notification.link]);
    }
  }

  getIcon(type: Notification['type']) {
    switch (type) {
      case 'order': return 'pi pi-shopping-bag';
      case 'stock': return 'pi pi-box';
      case 'demand': return 'pi pi-megaphone';
      case 'system': return 'pi pi-cog';
      case 'conflict': return 'pi pi-exclamation-triangle';
      default: return 'pi pi-bell';
    }
  }

  getTypeLabel(type: Notification['type']) {
    return type.toUpperCase();
  }
}
