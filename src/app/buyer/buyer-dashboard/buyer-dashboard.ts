import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { AccountService } from '../../components/account/account.service';
import { ButtonModule } from 'primeng/button';
import { OrderService } from '../../order/order.service';
import { NavigationService } from '../../util/navigation.service';
import { ChartModule } from 'primeng/chart';
import { DashboardService } from '../../common/dashboard.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-buyer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule, ChartModule],
  templateUrl: './buyer-dashboard.html',
  styleUrls: ['./buyer-dashboard.css']
})
export class BuyerDashboard implements OnInit {
  isDefaultRoute: boolean = true;
  expandedGroup: string = 'order';
  totalOrders: number = 0;

  dashboard: any = null;
  loading: boolean = true;
  
  // Chart Data
  spentChartData: any;
  spentChartOptions: any;

  constructor(
    private orderService: OrderService,
    private accountService: AccountService,
    private navigationService: NavigationService,
    private dashboardService: DashboardService,
    private router: Router,
    private cdr: ChangeDetectorRef,
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
      this.loadDashboardData();
    }

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const url = event.urlAfterRedirects || event.url;
      this.isDefaultRoute = url === '/buyer' || url === '/buyer/' || url === '/buyer/dashboard';

      if (url.includes('/orders')) {
        this.expandedGroup = 'order';
      }
      this.cdr.detectChanges();
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
        this.cdr.detectChanges();
      },
      error: () => {
        this.totalOrders = 0;
        this.cdr.detectChanges();
      }
    });
  }

  loadDashboardData() {
    this.loading = true;
    this.dashboardService.getBuyerDashboard()
      .pipe(finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
      }))
      .subscribe({
        next: (res: any) => {
          this.dashboard = res.response;
          this.initCharts();
          this.cdr.detectChanges();
        },
        error: (err) => {
            console.error('Buyer dashboard error:', err);
            this.cdr.detectChanges();
        }
      });
  }

  initCharts() {
    if (!this.dashboard) return;

    const documentStyle = getComputedStyle(document.documentElement);
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary') || '#6c757d';
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border') || '#dfe7ef';

    const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Generate last 6 months
    const currentDate = new Date();
    const last6Months: string[] = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        last6Months.push(monthOrder[d.getMonth()]);
    }

    // Spending Trend
    const rawSpent = this.dashboard.spendingTrend || {};
    const spentLabels = last6Months;
    const spentValues = spentLabels.map(label => rawSpent[label] || 0);

    this.spentChartData = {
      labels: spentLabels.length ? spentLabels : ['Jan', 'Feb', 'Mar', 'Apr'],
      datasets: [
        {
          label: 'Monthly Spending (NPR)',
          data: spentValues.length ? spentValues : [0, 0, 0, 0],
          fill: true,
          borderColor: '#3b82f6',
          tension: 0.4,
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          pointBackgroundColor: '#3b82f6',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: '#3b82f6'
        }
      ]
    };

    this.spentChartOptions = {
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          padding: 12,
          cornerRadius: 8
        }
      },
      scales: {
        x: {
          ticks: { color: textColorSecondary, font: { weight: '500' } },
          grid: { display: false }
        },
        y: {
          min: 0,
          ticks: {
            color: textColorSecondary,
            callback: (value: any) => 'NPR ' + value
          },
          grid: { color: surfaceBorder, drawBorder: false, borderDash: [5, 5] }
        }
      }
    };
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.clear();
    }
    this.accountService.updateLoginStatus();
    this.router.navigate(['/account/login']);
  }
}
