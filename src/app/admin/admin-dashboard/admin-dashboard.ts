import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { FarmerService } from '../farmer/farmer.service';
import { BuyerService } from '../buyer/buyer.service';
import { DeliveryService } from '../delivery/delivery.service';
import { AdminAppService } from '../admin-app.service';
import { filter } from 'rxjs';
import { AccountService } from '../../components/account/account.service';

@Component({
    selector: 'app-admin-dashboard',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './admin-dashboard.html',
    styleUrls: ['./admin-dashboard.css']
})
export class AdminDashboardComponent implements OnInit {
    pendingFarmers: number = 0;
    pendingBuyers: number = 0;
    pendingDelivery: number = 0;
    isDefaultRoute: boolean = true;
    expandedGroup: string = '';

    constructor(
        private farmerService: FarmerService,
        private buyerService: BuyerService,
        private deliveryService: DeliveryService,
        private adminAppService: AdminAppService,
        private accountService: AccountService,
        private router: Router,
        @Inject(PLATFORM_ID) private platformId: Object
    ) { }

    ngOnInit() {
        if (isPlatformBrowser(this.platformId)) {
            this.loadCounts();
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
            }
        });

        // Check initial route
        const currentUrl = this.router.url;
        this.isDefaultRoute = currentUrl === '/admin' || currentUrl === '/admin/';
        if (currentUrl.includes('/farmers')) this.expandedGroup = 'farmer';
        else if (currentUrl.includes('/buyers')) this.expandedGroup = 'buyer';
        else if (currentUrl.includes('/delivery')) this.expandedGroup = 'delivery';
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

    logout() {
        if (isPlatformBrowser(this.platformId)) {
            localStorage.clear();
        }
        this.accountService.updateLoginStatus();
        this.router.navigate(['/account/login']);
    }
}
