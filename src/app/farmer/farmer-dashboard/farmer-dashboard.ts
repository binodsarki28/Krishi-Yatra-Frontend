import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { AccountService } from '../../components/account/account.service';
import { ButtonModule } from 'primeng/button';
import { StockService } from '../../stock/stock.service';

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
  expandedGroup: string = 'stock'; // Expand stock by default
  totalStocks: number = 0;

  constructor(
    private stockService: StockService,
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
        }
    });

    const currentUrl = this.router.url;
    this.isDefaultRoute = currentUrl === '/farmer' || currentUrl === '/farmer/' || currentUrl === '/farmer/dashboard';
    if (currentUrl.includes('/stocks')) this.expandedGroup = 'stock';
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
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
        localStorage.clear();
    }
    this.accountService.updateLoginStatus();
    this.router.navigate(['/account/login']);
  }
}
