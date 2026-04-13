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
  selector: 'app-delivery-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule, ChartModule],
  templateUrl: './delivery-dashboard.html',
  styleUrls: ['./delivery-dashboard.css']
})
export class DeliveryDashboard implements OnInit {
  isDefaultRoute: boolean = true;
  expandedGroup: string = 'order';
  totalOrders: number = 0;

  dashboard: any = null;
  loading: boolean = true;
  
  // Chart Data
  earningsChartData: any;
  earningsChartOptions: any;

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
      this.isDefaultRoute = url === '/delivery' || url === '/delivery/' || url === '/delivery/dashboard';

      if (url.includes('/orders')) {
        this.expandedGroup = 'order';
      } else if (url.includes('/jobs')) {
        this.expandedGroup = 'jobs';
      }
      this.cdr.detectChanges();
    });

    const currentUrl = this.router.url;
    this.isDefaultRoute = currentUrl === '/delivery' || currentUrl === '/delivery/' || currentUrl === '/delivery/dashboard';
    if (currentUrl.includes('/orders')) this.expandedGroup = 'order';
    if (currentUrl.includes('/jobs')) this.expandedGroup = 'jobs';
  }

  toggleGroup(group: string) {
    this.expandedGroup = this.expandedGroup === group ? '' : group;
  }

  loadStats() {
    this.orderService.getDeliveryOrders(0, 1).subscribe({
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
    this.dashboardService.getDeliveryDashboard()
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
            console.error('Delivery dashboard error:', err);
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

    // Earnings Trend
    const rawEarnings = this.dashboard.earningsTrend || {};
    const earningsLabels = last6Months;
    const earningsValues = earningsLabels.map(label => rawEarnings[label] || 0);

    this.earningsChartData = {
      labels: earningsLabels.length ? earningsLabels : ['Jan', 'Feb', 'Mar', 'Apr'],
      datasets: [
        {
          label: 'Monthly Earnings (NPR)',
          data: earningsValues.length ? earningsValues : [0, 0, 0, 0],
          fill: true,
          borderColor: '#f59e0b',
          tension: 0.4,
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          pointBackgroundColor: '#f59e0b',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: '#f59e0b'
        }
      ]
    };

    this.earningsChartOptions = {
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
