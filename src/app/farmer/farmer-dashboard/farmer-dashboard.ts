import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { AccountService } from '../../components/account/account.service';
import { ButtonModule } from 'primeng/button';
import { StockService } from '../../stock/stock.service';
import { OrderService } from '../../order/order.service';
import { NavigationService } from '../../util/navigation.service';

@Component({
  selector: 'app-farmer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule],
  templateUrl: './farmer-dashboard.html',
  styleUrls: ['./farmer-dashboard.css']
})
export class FarmerDashboard implements OnInit {
  isDefaultRoute: boolean = true;
  expandedGroup: string = 'stock';
  totalStocks: number = 0;
  totalOrders: number = 0;

  constructor(
    private stockService: StockService,
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
        this.isDefaultRoute = url === '/farmer' || url === '/farmer/' || url === '/farmer/dashboard';

        if (url.includes('/stocks')) {
            this.expandedGroup = 'stock';
        } else if (url.includes('/orders')) {
            this.expandedGroup = 'order';
        }
    });

    const currentUrl = this.router.url;
    this.isDefaultRoute = currentUrl === '/farmer' || currentUrl === '/farmer/' || currentUrl === '/farmer/dashboard';
    if (currentUrl.includes('/stocks')) this.expandedGroup = 'stock';
    if (currentUrl.includes('/orders')) this.expandedGroup = 'order';
  }

  toggleGroup(group: string) {
    this.expandedGroup = this.expandedGroup === group ? '' : group;
  }

  loadStats() {
    this.stockService.getFarmerStocks().subscribe({
      next: (res: any) => {
        this.totalStocks = res.totalItems || 0;
      },
      error: () => {
        this.totalStocks = 0;
      }
    });
    this.orderService.getFarmerOrders(0, 1).subscribe({
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
