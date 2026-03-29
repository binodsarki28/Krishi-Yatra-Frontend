import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { AccountService } from '../../components/account/account.service';
import { ButtonModule } from 'primeng/button';
import { OrderService } from '../../order/order.service';
import { NavigationService } from '../../util/navigation.service';

@Component({
  selector: 'app-buyer-dashboard',
  imports: [CommonModule, RouterModule, ButtonModule],
  templateUrl: './buyer-dashboard.html',
  styleUrls: ['./buyer-dashboard.css']
})
export class BuyerDashboard implements OnInit {
  isDefaultRoute: boolean = true;
  expandedGroup: string = 'order';
  totalOrders: number = 0;

  constructor(
    private orderService: OrderService,
    private accountService: AccountService,
    private navigationService: NavigationService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  goToProfile() {
    this.navigationService.isExiting = true;
    this.router.navigate(['/profile']).then(() => {
      this.navigationService.isExiting = false;
    });
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadStats();
    }

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const url = event.urlAfterRedirects || event.url;
      this.isDefaultRoute = url === '/buyer' || url === '/buyer/' || url === '/buyer/dashboard';

      if (url.includes('/orders')) {
        this.expandedGroup = 'order';
      }
    });

    const currentUrl = this.router.url;
    this.isDefaultRoute = currentUrl === '/buyer' || currentUrl === '/buyer/' || currentUrl === '/buyer/dashboard';
    if (currentUrl.includes('/orders')) this.expandedGroup = 'order';
  }

  toggleGroup(group: string) {
    this.expandedGroup = this.expandedGroup === group ? '' : group;
  }

  loadStats() {
    this.orderService.getBuyerOrders(0, 1).subscribe({
      next: (res: any) => {
        this.totalOrders = res.response?.totalElements || 0;
      },
      error: () => {
        this.totalOrders = 0;
      }
    });
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.clear();
    }
    this.accountService.updateLoginStatus();
    this.router.navigate(['/account/login']);
  }
}
