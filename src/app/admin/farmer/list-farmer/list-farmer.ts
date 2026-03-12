import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { TextareaModule } from 'primeng/textarea';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs/operators';
import { FarmerService } from '../farmer.service';
import { ToastService } from '../../../util/toast.service';
import { IFarmerListResponse } from '../IFarmer';
import { DetailFarmerComponent } from '../detail-farmer/detail-farmer';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';

@Component({
    selector: 'app-list-farmer',
    standalone: true,
    imports: [CommonModule, DialogModule, FormsModule, TextareaModule, DetailFarmerComponent,
        TableModule, ButtonModule, TagModule, ProgressSpinnerModule, IconFieldModule, InputIconModule, InputTextModule],
    templateUrl: './list-farmer.html',
    styleUrls: ['./list-farmer.css']
})
export class ListFarmerComponent implements OnInit {
    farmers: IFarmerListResponse[] = [];
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
        farmTypes: '',
        farmLocation: ''
    };
    private searchSubject = new Subject<void>();

    detailDialog = false;
    selectedFarmer: any = null;
    detailLoading = false;

    rejectDialog = false;
    selectedUsername = '';
    rejectionReason = '';

    constructor(
        private farmerService: FarmerService,
        private toastService: ToastService,
        private cdr: ChangeDetectorRef,
        @Inject(PLATFORM_ID) private platformId: Object
    ) { }

    ngOnInit() {
        this.setupSearch();
        if (isPlatformBrowser(this.platformId)) {
            this.loadFarmers();
        }
    }

    setupSearch() {
        this.searchSubject.pipe(
            debounceTime(400)
        ).subscribe(() => {
            this.page = 0;
            this.loadFarmers();
        });
    }

    onSearch(immediate = false) {
        if (immediate) {
            this.page = 0;
            this.loadFarmers();
        } else {
            this.searchSubject.next();
        }
    }

    clearFilters() {
        this.filters = {
            fullName: '',
            username: '',
            farmTypes: '',
            farmLocation: ''
        };
        this.page = 0;
        this.loadFarmers();
    }

    setFilter(filter: 'all' | 'pending' | 'verified') {
        this.activeFilter = filter;
        this.page = 0;
        this.loadFarmers();
    }

    loadFarmers() {
        if (this.page === 0) {
            this.loading = true;
            this.cdr.markForCheck();
        }

        const requestId = ++this.currentRequestId;

        let verified: boolean | undefined;
        if (this.activeFilter === 'pending') verified = false;
        else if (this.activeFilter === 'verified') verified = true;

        this.farmerService.getFarmers(verified, this.page, this.size, this.filters)
            .pipe(finalize(() => {
                if (requestId === this.currentRequestId) {
                    this.loading = false;
                    this.cdr.markForCheck();
                }
            }))
            .subscribe({
                next: (data) => {
                    if (requestId === this.currentRequestId) {
                        this.farmers = data || [];
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

    nextPage() { if (this.hasMore) { this.page++; this.loadFarmers(); } }
    prevPage() { if (this.page > 0) { this.page--; this.loadFarmers(); } }

    viewDetail(username: string) {
        this.detailLoading = true;
        this.detailDialog = true;
        this.farmerService.getFarmerDetail(username).subscribe({
            next: (data) => { this.selectedFarmer = data; this.detailLoading = false; },
            error: (err) => { this.toastService.errorResponse(err); this.detailDialog = false; this.detailLoading = false; }
        });
    }

    approveFarmer(username: string) {
        this.farmerService.verifyFarmer({ username, approved: true }).subscribe({
            next: (res) => { this.toastService.successResponse(res); this.loadFarmers(); },
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
        this.farmerService.verifyFarmer({ username: this.selectedUsername, approved: false, reason: this.rejectionReason }).subscribe({
            next: (res) => { this.toastService.successResponse(res); this.rejectDialog = false; this.loadFarmers(); },
            error: (err) => this.toastService.errorResponse(err)
        });
    }

    blockUnblock(username: string, currentlyActive: boolean) {
        this.farmerService.blockUnblockFarmer(username, currentlyActive).subscribe({
            next: (res) => { this.toastService.successResponse(res); this.loadFarmers(); },
            error: (err) => this.toastService.errorResponse(err)
        });
    }
}
