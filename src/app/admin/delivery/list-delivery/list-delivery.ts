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

@Component({
    selector: 'app-list-delivery',
    standalone: true,
    imports: [CommonModule, DialogModule, FormsModule, TextareaModule, DetailDeliveryComponent],
    templateUrl: './list-delivery.html',
    styleUrls: ['./list-delivery.css']
})
export class ListDeliveryComponent implements OnInit {
    partners: IDeliveryListResponse[] = [];
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
        licenseNumber: ''
    };
    private searchSubject = new Subject<void>();

    detailDialog = false;
    selectedPartner: any = null;
    detailLoading = false;

    rejectDialog = false;
    selectedUsername = '';
    rejectionReason = '';

    constructor(
        private deliveryService: DeliveryService,
        private toastService: ToastService,
        private cdr: ChangeDetectorRef,
        @Inject(PLATFORM_ID) private platformId: Object
    ) { }

    ngOnInit() {
        this.setupSearch();
        this.loadPartners();
    }

    setupSearch() {
        this.searchSubject.pipe(
            debounceTime(400)
        ).subscribe(() => {
            this.page = 0;
            this.loadPartners();
        });
    }

    onSearch(immediate = false) {
        if (immediate) {
            this.page = 0;
            this.loadPartners();
        } else {
            this.searchSubject.next();
        }
    }

    clearFilters() {
        this.filters = {
            fullName: '',
            username: '',
            vehicleType: '',
            licenseNumber: ''
        };
        this.page = 0;
        this.loadPartners();
    }

    setFilter(filter: 'all' | 'pending' | 'verified') {
        this.activeFilter = filter;
        this.page = 0;
        this.loadPartners();
    }

    loadPartners() {
        if (this.page === 0) {
            this.loading = true;
            this.cdr.markForCheck();
        }

        const requestId = ++this.currentRequestId;

        let verified: boolean | undefined;
        if (this.activeFilter === 'pending') verified = false;
        else if (this.activeFilter === 'verified') verified = true;

        this.deliveryService.getDeliveries(verified, this.page, this.size, this.filters)
            .pipe(finalize(() => {
                if (requestId === this.currentRequestId) {
                    this.loading = false;
                    this.cdr.markForCheck();
                }
            }))
            .subscribe({
                next: (data) => {
                    if (requestId === this.currentRequestId) {
                        this.partners = data || [];
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

    nextPage() { if (this.hasMore) { this.page++; this.loadPartners(); } }
    prevPage() { if (this.page > 0) { this.page--; this.loadPartners(); } }

    viewDetail(username: string) {
        this.detailLoading = true;
        this.detailDialog = true;
        this.deliveryService.getDeliveryDetail(username).subscribe({
            next: (data) => { this.selectedPartner = data; this.detailLoading = false; },
            error: (err) => { this.toastService.errorResponse(err); this.detailDialog = false; this.detailLoading = false; }
        });
    }

    approvePartner(username: string) {
        this.deliveryService.verifyDelivery({ username, approved: true }).subscribe({
            next: (res) => { this.toastService.successResponse(res); this.loadPartners(); },
            error: (err) => this.toastService.errorResponse(err)
        });
    }

    showRejectDialog(username: string) {
        this.selectedUsername = username;
        this.rejectionReason = '';
        this.rejectDialog = true;
    }

    confirmReject() {
        if (!this.rejectionReason.trim()) {
            this.toastService.warningResponse('Please provide a reason for rejection.');
            return;
        }
        this.deliveryService.verifyDelivery({ username: this.selectedUsername, approved: false, reason: this.rejectionReason }).subscribe({
            next: (res) => { this.toastService.successResponse(res); this.rejectDialog = false; this.loadPartners(); },
            error: (err) => this.toastService.errorResponse(err)
        });
    }

    blockUnblock(username: string, currentlyActive: boolean) {
        this.deliveryService.blockUnblockDelivery(username, currentlyActive).subscribe({
            next: (res) => { this.toastService.successResponse(res); this.loadPartners(); },
            error: (err) => this.toastService.errorResponse(err)
        });
    }
}
