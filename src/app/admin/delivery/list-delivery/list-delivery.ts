import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { TextareaModule } from 'primeng/textarea';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs/operators';
import { DeliveryService } from '../delivery.service';
import { ToastService } from '../../../util/toast.service';
import { IDeliveryListResponse } from '../IDelivery';
import { DetailDeliveryComponent } from '../detail-delivery/detail-delivery';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';

@Component({
    selector: 'app-list-delivery',
    standalone: true,
    imports: [CommonModule, DialogModule, FormsModule, TextareaModule, DetailDeliveryComponent,
        TableModule, ButtonModule, TagModule, ProgressSpinnerModule, IconFieldModule, InputIconModule, InputTextModule, TooltipModule, SelectModule],
    templateUrl: './list-delivery.html',
    styleUrls: ['./list-delivery.css']
})
export class ListDeliveryComponent implements OnInit {
    deliveries: IDeliveryListResponse[] = [];
    loading = true;

    page = 0;
    size = 10;
    hasMore = true;

    activeFilter: 'all' | 'pending' | 'verified' = 'all';
    private currentRequestId = 0;

    // Search filters
    filters = {
        fullName: '',
        username: '',
        vehicleType: '',
        vehicleBrand: '',
        vehicleNumber: ''
    };

    vehicleTypeOptions = [
        { label: 'All Types', value: '' },
        { label: 'Bicycle', value: 'BICYCLE' },
        { label: 'Auto', value: 'AUTO' },
        { label: 'Taxi', value: 'TAXI' },
        { label: 'Jeep', value: 'JEEP' },
        { label: 'Van', value: 'VAN' },
        { label: 'Truck', value: 'TRUCK' },
        { label: 'Tractor', value: 'TRACTOR' },
        { label: 'Pickup', value: 'PICKUP' },
        { label: 'Motorcycle', value: 'MOTORCYCLE' }
    ];

    private searchSubject = new Subject<void>();

    detailDialog = false;
    selectedDelivery: any = null;
    detailLoading = false;

    actionDialog = false;
    actionType: 'REJECT' | 'BLOCK' = 'REJECT';
    selectedUsername = '';
    actionReason = '';

    constructor(
        private deliveryService: DeliveryService,
        private toastService: ToastService,
        private cdr: ChangeDetectorRef,
        @Inject(PLATFORM_ID) private platformId: Object
    ) { }

    ngOnInit() {
        this.setupSearch();
        if (isPlatformBrowser(this.platformId)) {
            setTimeout(() => {
                this.loadDeliveries();
            });
        }
    }

    setupSearch() {
        this.searchSubject.pipe(
            debounceTime(400)
        ).subscribe(() => {
            this.page = 0;
            this.loadDeliveries();
        });
    }

    onSearch(immediate = false) {
        if (immediate) {
            this.page = 0;
            this.loadDeliveries();
        } else {
            this.searchSubject.next();
        }
    }

    clearFilters() {
        this.filters = {
            fullName: '',
            username: '',
            vehicleType: '',
            vehicleBrand: '',
            vehicleNumber: ''
        };
        this.page = 0;
        this.loadDeliveries();
    }

    setFilter(filter: 'all' | 'pending' | 'verified') {
        this.activeFilter = filter;
        this.page = 0;
        this.loadDeliveries();
    }

    loadDeliveries() {
        if (this.page === 0) {
            this.loading = true;
            this.cdr.markForCheck();
        }

        const requestId = ++this.currentRequestId;

        let status: string | undefined;
        if (this.activeFilter === 'pending') status = 'PENDING';
        else if (this.activeFilter === 'verified') status = 'VERIFIED';

        this.deliveryService.getDeliveries(status, this.page, this.size, this.filters)
            .pipe(finalize(() => {
                if (requestId === this.currentRequestId) {
                    this.loading = false;
                    this.cdr.markForCheck();
                }
            }))
            .subscribe({
                next: (data) => {
                    if (requestId === this.currentRequestId) {
                        this.deliveries = data || [];
                        this.hasMore = data && data.length === this.size;
                        this.cdr.markForCheck();
                    }
                },
                error: (err) => {
                    if (requestId === this.currentRequestId) {
                        this.toastService.errorResponse(err);
                        this.cdr.markForCheck();
                    }
                }
            });
    }

    nextPage() { if (this.hasMore) { this.page++; this.loadDeliveries(); } }
    prevPage() { if (this.page > 0) { this.page--; this.loadDeliveries(); } }

    viewDetail(username: string) {
        this.detailLoading = true;
        this.detailDialog = true;
        this.deliveryService.getDeliveryDetail(username).subscribe({
            next: (data) => { this.selectedDelivery = data; this.detailLoading = false; },
            error: (err) => { this.toastService.errorResponse(err); this.detailDialog = false; this.detailLoading = false; }
        });
    }

    approveDelivery(username: string) {
        this.deliveryService.verifyDelivery({ username, approved: true }).subscribe({
            next: (res: any) => { this.toastService.successResponse(res); this.loadDeliveries(); },
            error: (err: any) => this.toastService.errorResponse(err)
        });
    }

    showActionDialog(username: string, type: 'REJECT' | 'BLOCK') {
        this.selectedUsername = username;
        this.actionType = type;
        this.actionReason = '';
        this.actionDialog = true;
    }

    confirmAction() {
        if (!this.actionReason.trim()) {
            this.toastService.warningResponse('Please provide a reason.');
            return;
        }
        if (this.actionType === 'REJECT') {
            this.deliveryService.verifyDelivery({ username: this.selectedUsername, approved: false, reason: this.actionReason }).subscribe({
                next: (res: any) => { 
                    this.toastService.successResponse(res); 
                    this.actionDialog = false; 
                    this.loadDeliveries(); 
                },
                error: (err: any) => { 
                    this.toastService.errorResponse(err); 
                    this.actionDialog = false; 
                }
            });
        } else {
            this.deliveryService.blockUnblockDelivery(this.selectedUsername, true, this.actionReason).subscribe({
                next: (res: any) => { 
                    this.toastService.successResponse(res); 
                    this.actionDialog = false; 
                    this.loadDeliveries(); 
                },
                error: (err: any) => { 
                    this.toastService.errorResponse(err); 
                    this.actionDialog = false; 
                }
            });
        }
    }

    blockUnblock(username: string, currentlyActive: boolean) {
        if (currentlyActive) {
            this.showActionDialog(username, 'BLOCK');
        } else {
            this.deliveryService.blockUnblockDelivery(username, false).subscribe({
                next: (res: any) => { this.toastService.successResponse(res); this.loadDeliveries(); },
                error: (err: any) => this.toastService.errorResponse(err)
            });
        }
    }
}
