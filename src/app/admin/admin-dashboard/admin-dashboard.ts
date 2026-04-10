import { Component, OnInit, Inject, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { FarmerService } from '../farmer/farmer.service';
import { BuyerService } from '../buyer/buyer.service';
import { DeliveryService } from '../delivery/delivery.service';
import { AdminAppService } from '../admin-app.service';
import { filter } from 'rxjs';
import { AccountService } from '../../components/account/account.service';
import { ButtonModule } from 'primeng/button';
import { NavigationService } from '../../util/navigation.service';
import { ChartModule } from 'primeng/chart';
import { DashboardService } from '../../common/dashboard.service';
import { finalize } from 'rxjs';

@Component({
    selector: 'app-admin-dashboard',
    standalone: true,
    imports: [CommonModule, RouterModule, ButtonModule, ChartModule],
    templateUrl: './admin-dashboard.html',
    styleUrls: ['./admin-dashboard.css']
})
export class AdminDashboardComponent implements OnInit {
    pendingFarmers: number = 0;
    pendingBuyers: number = 0;
    pendingDelivery: number = 0;

    dashboard: any = null;
    loading: boolean = true;

    // Chart Data
    growthChartData: any;
    growthChartOptions: any;
    orderChartData: any;
    orderChartOptions: any;
    isDefaultRoute: boolean = true;
    expandedGroup: string = '';

    constructor(
        private farmerService: FarmerService,
        private buyerService: BuyerService,
        private deliveryService: DeliveryService,
        private adminAppService: AdminAppService,
        private accountService: AccountService,
        private navigationService: NavigationService,
        private dashboardService: DashboardService,
        private router: Router,
        @Inject(PLATFORM_ID) private platformId: Object
    ) { }

    ngOnInit() {
        if (isPlatformBrowser(this.platformId)) {
            this.loadCounts();
            this.loadDashboardData();
        }

        this.router.events.pipe(
            filter(event => event instanceof NavigationEnd)
        ).subscribe((event: any) => {
            const url = event.urlAfterRedirects || event.url;
            this.isDefaultRoute = url === '/admin' || url === '/admin/';

            // Auto-expand the correct group based on the URL
            if (url.includes('/farmers')) {
                this.expandedGroup = 'farmer';
            } else if (url.includes('/buyers')) {
                this.expandedGroup = 'buyer';
            } else if (url.includes('/delivery')) {
                this.expandedGroup = 'delivery';
            } else if (url.includes('/stocks')) {
                this.expandedGroup = 'stock';
            } else if (url.includes('/orders')) {
                this.expandedGroup = 'order';
            } else if (url.includes('/category')) {
                this.expandedGroup = 'category';
            }
        });

        // Check initial route
        const currentUrl = this.router.url;
        this.isDefaultRoute = currentUrl === '/admin' || currentUrl === '/admin/';
        if (currentUrl.includes('/farmers')) this.expandedGroup = 'farmer';
        else if (currentUrl.includes('/buyers')) this.expandedGroup = 'buyer';
        else if (currentUrl.includes('/delivery')) this.expandedGroup = 'delivery';
        else if (currentUrl.includes('/stocks')) this.expandedGroup = 'stock';
        else if (currentUrl.includes('/orders')) this.expandedGroup = 'order';
        else if (currentUrl.includes('/category')) this.expandedGroup = 'category';
    }

    toggleGroup(group: string) {
        this.expandedGroup = this.expandedGroup === group ? '' : group;
    }

    loadCounts() {
        this.adminAppService.getStats().subscribe({
            next: (data) => {
                this.pendingFarmers = data.pendingFarmers;
                this.pendingBuyers = data.pendingBuyers;
                this.pendingDelivery = data.pendingDelivery;
            },
            error: () => {
                this.pendingFarmers = 0;
                this.pendingBuyers = 0;
                this.pendingDelivery = 0;
            }
        });
    }

    loadDashboardData() {
        this.loading = true;
        this.dashboardService.getAdminDashboard()
            .pipe(finalize(() => this.loading = false))
            .subscribe({
                next: (res: any) => {
                    this.dashboard = res.response;
                    this.initCharts();
                },
                error: (err) => console.error('Admin dashboard error:', err)
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
        const last6Months = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
            last6Months.push(monthOrder[d.getMonth()]);
        }

        const rawTrend = this.dashboard.userRegistrationTrend || {};
        const growthLabels = last6Months;
        const growthValues = growthLabels.map(label => rawTrend[label] || 0);

        this.growthChartData = {
            labels: growthLabels.length ? growthLabels : ['Jan', 'Feb', 'Mar', 'Apr'],
            datasets: [
                {
                    label: 'New Registrations',
                    data: growthValues.length ? growthValues : [0, 0, 0, 0],
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

        this.growthChartOptions = {
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
                        stepSize: 1
                    },
                    grid: { color: surfaceBorder, drawBorder: false, borderDash: [5, 5] }
                }
            }
        };

        // Orders by Status
        const statusLabels = Object.keys(this.dashboard.ordersByStatus || {});
        const statusValues = Object.values(this.dashboard.ordersByStatus || {});

        this.orderChartData = {
            labels: statusLabels,
            datasets: [
                {
                    data: statusValues,
                    backgroundColor: ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#6366f1'],
                    hoverBackgroundColor: ['#16a34a', '#2563eb', '#d97706', '#dc2626', '#7c3aed', '#4f46e5']
                }
            ]
        };

        this.orderChartOptions = {
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: textColor }
                }
            }
        };
    }

    logout() {
        if (isPlatformBrowser(this.platformId)) {
            localStorage.clear();
        }
        this.navigationService.isExiting = true;
        this.accountService.updateLoginStatus();
        this.router.navigate(['/account/login']).then(() => {
            this.navigationService.isExiting = false;
        });
    }
}
