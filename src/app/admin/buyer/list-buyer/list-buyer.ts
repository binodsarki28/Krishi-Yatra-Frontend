import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { TextareaModule } from 'primeng/textarea';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs/operators';
import { BuyerService } from '../buyer.service';
import { ToastService } from '../../../util/toast.service';
import { IBuyerListResponse } from '../IBuyer';
import { DetailBuyerComponent } from '../detail-buyer/detail-buyer';
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
    selector: 'app-list-buyer',
    standalone: true,
    imports: [CommonModule, DialogModule, FormsModule, TextareaModule, DetailBuyerComponent,
        TableModule, ButtonModule, TagModule, ProgressSpinnerModule, IconFieldModule, InputIconModule, InputTextModule, TooltipModule, SelectModule],
    templateUrl: './list-buyer.html',
    styleUrls: ['./list-buyer.css']
})
export class ListBuyerComponent implements OnInit {
    buyers: IBuyerListResponse[] = [];
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
        consumerType: '',
        businessLocation: ''
    };

    consumerTypeOptions = [
        { label: 'All Types', value: '' },
        { label: 'Hotel', value: 'HOTEL' },
        { label: 'Wholesaler', value: 'WHOLESALER' },
        { label: 'Restaurant', value: 'RESTAURANT' },
        { label: 'Retailer', value: 'RETAILER' },
        { label: 'Normal', value: 'NORMAL' },
        { label: 'Individual', value: 'INDIVIDUAL' },
        { label: 'Hotel & Restaurant', value: 'HOTEL_RESTAURANT' }
    ];

    private searchSubject = new Subject<void>();

    detailDialog = false;
    selectedBuyer: any = null;
    detailLoading = false;

    actionDialog = false;
    actionType: 'REJECT' | 'BLOCK' = 'REJECT';
    selectedUsername = '';
    actionReason = '';

    constructor(
        private buyerService: BuyerService,
        private toastService: ToastService,
        private cdr: ChangeDetectorRef,
        @Inject(PLATFORM_ID) private platformId: Object
    ) { }

    ngOnInit() {
        this.setupSearch();
        if (isPlatformBrowser(this.platformId)) {
            setTimeout(() => {
                this.loadBuyers();
            });
        }
    }

    setupSearch() {
        this.searchSubject.pipe(
            debounceTime(400)
        ).subscribe(() => {
            this.page = 0;
            this.loadBuyers();
        });
    }

    onSearch(immediate = false) {
        if (immediate) {
            this.page = 0;
            this.loadBuyers();
        } else {
            this.searchSubject.next();
        }
    }

    clearFilters() {
        this.filters = {
            fullName: '',
            username: '',
            consumerType: '',
            businessLocation: ''
        };
        this.page = 0;
        this.loadBuyers();
    }

    setFilter(filter: 'all' | 'pending' | 'verified') {
        this.activeFilter = filter;
        this.page = 0;
        this.loadBuyers();
    }

    loadBuyers() {
        if (this.page === 0) {
            this.loading = true;
            this.cdr.markForCheck();
        }

        const requestId = ++this.currentRequestId;

        let status: string | undefined;
        if (this.activeFilter === 'pending') status = 'PENDING';
        else if (this.activeFilter === 'verified') status = 'VERIFIED';

        this.buyerService.getBuyers(status, this.page, this.size, this.filters)
            .pipe(finalize(() => {
                if (requestId === this.currentRequestId) {
                    this.loading = false;
                    this.cdr.markForCheck();
                }
            }))
            .subscribe({
                next: (data) => {
                    if (requestId === this.currentRequestId) {
                        this.buyers = data || [];
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

    nextPage() { if (this.hasMore) { this.page++; this.loadBuyers(); } }
    prevPage() { if (this.page > 0) { this.page--; this.loadBuyers(); } }

    viewDetail(username: string) {
        this.detailLoading = true;
        this.detailDialog = true;
        this.buyerService.getBuyerDetail(username).subscribe({
            next: (data) => { this.selectedBuyer = data; this.detailLoading = false; },
            error: (err) => { this.toastService.errorResponse(err); this.detailDialog = false; this.detailLoading = false; }
        });
    }

    approveBuyer(username: string) {
        this.buyerService.verifyBuyer({ username, approved: true }).subscribe({
            next: (res: any) => { this.toastService.successResponse(res); this.loadBuyers(); },
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
            this.buyerService.verifyBuyer({ username: this.selectedUsername, approved: false, reason: this.actionReason }).subscribe({
                next: (res: any) => { 
                    this.toastService.successResponse(res); 
                    this.actionDialog = false; 
                    this.loadBuyers(); 
                },
                error: (err: any) => { 
                    this.toastService.errorResponse(err); 
                    this.actionDialog = false; 
                }
            });
        } else {
            this.buyerService.blockUnblockBuyer(this.selectedUsername, true, this.actionReason).subscribe({
                next: (res: any) => { 
                    this.toastService.successResponse(res); 
                    this.actionDialog = false; 
                    this.loadBuyers(); 
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
            this.buyerService.blockUnblockBuyer(username, false).subscribe({
                next: (res: any) => { this.toastService.successResponse(res); this.loadBuyers(); },
                error: (err: any) => this.toastService.errorResponse(err)
            });
        }
    }
}
