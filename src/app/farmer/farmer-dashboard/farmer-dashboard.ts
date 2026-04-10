import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { AccountService } from '../../components/account/account.service';
import { ButtonModule } from 'primeng/button';
import { StockService } from '../../stock/stock.service';
import { OrderService } from '../../order/order.service';
import { NavigationService } from '../../util/navigation.service';
import { ChartModule } from 'primeng/chart';
import { DashboardService } from '../../common/dashboard.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-farmer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule, ChartModule],
  templateUrl: './farmer-dashboard.html',
  styleUrls: ['./farmer-dashboard.css']
})
export class FarmerDashboard implements OnInit {
  isDefaultRoute: boolean = true;
  expandedGroup: string = 'stock';
  totalStocks: number = 0;
  totalOrders: number = 0;

  dashboard: any = null;
  loading: boolean = true;
  
  // Chart Data
  revenueChartData: any;
  revenueChartOptions: any;
  categoryChartData: any;
  categoryChartOptions: any;

  constructor(
    private stockService: StockService,
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
        this.loadDashboardData();
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
        this.cdr.detectChanges();
    });

    const currentUrl = this.router.url;
    this.isDefaultRoute = currentUrl === '/farmer' || currentUrl === '/farmer/' || currentUrl === '/farmer/dashboard';
    if (currentUrl.includes('/stocks')) this.expandedGroup = 'stock';
    if (currentUrl.includes('/orders')) this.expandedGroup = 'order';
  }

  toggleGroup(group: string) {
    this.expandedGroup = this.expandedGroup === group ? '' : group;
  }

  loadDashboardData() {
    this.loading = true;
    this.dashboardService.getFarmerDashboard()
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
          console.error('Farmer dashboard error:', err);
          this.cdr.detectChanges();
        }
      });
  }

  initCharts() {
    if (!this.dashboard) return;

    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color') || '#495057';
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

    // Revenue Trend Line Chart
    const rawRevenue = this.dashboard.revenueByMonth || {};
    const revenueLabels = last6Months;
    const revenueValues = revenueLabels.map(label => rawRevenue[label] || 0);

    this.revenueChartData = {
      labels: revenueLabels.length ? revenueLabels : ['Jan', 'Feb', 'Mar', 'Apr'],
      datasets: [
        {
          label: 'Monthly Revenue (NPR)',
          data: revenueValues.length ? revenueValues : [0, 0, 0, 0],
          fill: true,
          borderColor: '#10b981',
          tension: 0.4,
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          pointBackgroundColor: '#10b981',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: '#10b981'
        }
      ]
    };

    this.revenueChartOptions = {
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
                ticks: { 
                    color: textColorSecondary,
                    callback: (value: any) => 'NPR ' + value
                },
                grid: { color: surfaceBorder, drawBorder: false, borderDash: [5, 5] }
            }
        }
    };

    // Category Distribution Pie Chart
    const rawCategories = this.dashboard.stocksByCategory || {};
    const categoryLabels = Object.keys(rawCategories);
    const categoryValues = Object.values(rawCategories);

    this.categoryChartData = {
      labels: categoryLabels.length ? categoryLabels : ['No Stocks'],
      datasets: [
        {
          data: categoryValues.length ? categoryValues : [1],
          backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'],
          hoverOffset: 20,
          borderWidth: 0
        }
      ]
    };

    this.categoryChartOptions = {
        plugins: {
            legend: {
                position: 'bottom',
                labels: { usePointStyle: true, color: textColor }
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
