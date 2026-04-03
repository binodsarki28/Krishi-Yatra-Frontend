import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { MenubarModule } from 'primeng/menubar';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AccountService } from '../../components/account/account.service';
import { NotificationService } from '../../components/notification/notification.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, MenubarModule, ButtonModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class NavbarComponent implements OnInit {
  items: MenuItem[] | undefined;
  isLoggedIn: boolean = false;
  unreadCount: number = 0;
  private platformId = inject(PLATFORM_ID);

  constructor(
    private router: Router,
    private accountService: AccountService,
    private notificationService: NotificationService
  ) { }

  ngOnInit() {
    this.accountService.isLoggedIn$.subscribe((status: boolean) => {
      this.isLoggedIn = status;
      this.updateNavbarItems();
      if (status) {
        this.fetchUnreadCount();
      }
    });

    // Subscribe to notification service for real-time count updates
    this.notificationService.unreadCount$.subscribe(count => {
      this.unreadCount = count;
    });
  }

  fetchUnreadCount() {
    this.notificationService.getUnreadCount().subscribe();
  }

  updateNavbarItems() {
    this.items = [
      {
        label: 'Home',
        icon: 'pi pi-home',
        command: () => this.router.navigate(['/'])
      },
      {
        label: 'Stocks',
        icon: 'pi pi-list',
        command: () => this.router.navigate(['/stocks'])
      },
      {
        label: 'Demands',
        icon: 'pi pi-megaphone',
        command: () => this.router.navigate(['/demands'])
      }
    ];

    if (this.accountService.isRoleVerified('DELIVERY')) {
      this.items.push({
        label: 'Delivery Jobs',
        icon: 'pi pi-truck',
        command: () => this.router.navigate(['/delivery/dashboard'])
      });
    }

    this.items.push(
      {
        label: 'Guide',
        icon: 'pi pi-question-circle',
        command: () => this.router.navigate(['/guide'])
      },
      {
        label: 'Contact',
        icon: 'pi pi-envelope'
      }
    );
  }

  navigateToLogin() {
    this.router.navigate(['/account/login']);
  }

  navigateToRegister() {
    this.router.navigate(['/account/register']);
  }

  navigateToHome() {
    this.router.navigate(['/']);
  }

  navigateToProfile() {
    this.router.navigate(['/profile']);
  }

  navigateToNotifications() {
    this.router.navigate(['/notifications']);
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.clear();
    }
    this.accountService.updateLoginStatus();
    this.router.navigate(['/account/login']);
  }
}
