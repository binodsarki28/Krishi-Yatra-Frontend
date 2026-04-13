import { Component, OnInit, Input, ChangeDetectorRef, HostListener, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DemandService } from '../demand.service';
import { IDemandResponse } from '../IDemand';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';
import { RippleModule } from 'primeng/ripple';
import { ToastService } from '../../util/toast.service';
import { StockService } from '../../stock/stock.service';
import { Router } from '@angular/router';
import { AccountService } from '../../components/account/account.service';

@Component({
  selector: 'app-demand-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    TagModule,
    SelectModule,
    CardModule,
    SkeletonModule,
    RippleModule,
  ],
  templateUrl: './demand-list.html',
  styleUrls: ['./demand-list.css']
})
export class DemandListComponent implements OnInit {
  @Input() mode: 'all' | 'my' | 'fulfilled' = 'all';

  demands: IDemandResponse[] = [];
  loading = false;
  loadingMore = false;
  hasMore = true;
  page = 0;
  size = 6;
  totalElements = 0;
  hasLoaded = false;

  categories: any[] = [];
  subCategories: any[] = [];

  filters = {
    categoryId: null as number | null,
    subCategoryId: null as number | null,
    status: 'OPEN'
  };

  constructor(
    private demandService: DemandService,
    private stockService: StockService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    public accountService: AccountService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    // Skip API calls during SSR — no JWT token available on the server
    if (!isPlatformBrowser(this.platformId)) return;

    this.loadCategories();
    // Default open status only for marketplace demands
    if (this.mode === 'all') {
        this.filters.status = 'OPEN';
    } else {
        this.filters.status = (null as any);
    }
    this.loadDemands(true);
  }

  loadDemands(reset = false) {
    if (reset) {
        this.page = 0;
        this.demands = [];
        this.loading = isPlatformBrowser(this.platformId);
        this.hasMore = true;
    } else {
        if (!this.hasMore) return;
        this.loadingMore = true;
    }

    this.cdr.markForCheck();

    let apiCall;
    if (this.mode === 'all') {
      apiCall = this.demandService.getDemands(this.page, this.size, this.filters);
    } else if (this.mode === 'my') {
      apiCall = this.demandService.getMyDemands(this.page, this.size);
    } else {
      apiCall = this.demandService.getFulfilledDemands(this.page, this.size);
    }

    apiCall.subscribe({
      next: (res: any) => {
        const newDemands = res.response || res.data || [];
        this.totalElements = res.dataCount || 0;

        this.demands = [...this.demands, ...newDemands];
        this.hasMore = newDemands.length === this.size;

        if (this.hasMore) this.page++;

        this.loading = false;
        this.loadingMore = false;
        this.hasLoaded = true;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.toastService.errorResponse(err);
        this.loading = false;
        this.loadingMore = false;
        this.hasLoaded = true;
        this.cdr.detectChanges();
      }
    });
  }

  loadCategories() {
    this.stockService.getCategories().subscribe((res: any) => {
      setTimeout(() => {
          this.categories = res.response || [];
          this.cdr.detectChanges();
      });
    });
  }

  onCategoryChange() {
    this.filters.subCategoryId = null;
    if (this.filters.categoryId) {
      this.stockService.getSubCategories(this.filters.categoryId.toString()).subscribe((res: any) => {
          setTimeout(() => {
              this.subCategories = res.response || [];
              this.cdr.detectChanges();
          });
      });
    } else {
      setTimeout(() => {
          this.subCategories = [];
          this.cdr.detectChanges();
      });
    }
    this.onFilter();
  }

  onFilter() {
    this.loadDemands(true);
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (!isPlatformBrowser(this.platformId) || this.loading || this.loadingMore || !this.hasMore) return;

    const windowHeight = window.innerHeight;
    const dirtyHeight = document.documentElement.scrollHeight;
    const scrollPos = window.scrollY || document.documentElement.scrollTop;

    // Load more when user is 100px from the absolute bottom
    if (windowHeight + scrollPos >= dirtyHeight - 100) {
      this.loadDemands();
    }
  }

  cancelDemand(id: string) {
    this.demandService.cancelDemand(id).subscribe({
      next: () => {
        this.toastService.generalResponse('success', 'Cancelled', 'Demand cancelled successfully');
        this.loadDemands(true);
      },
      error: err => this.toastService.errorResponse(err)
    });
  }

  acceptDemand(demand: IDemandResponse) {
    this.demandService.acceptDemand(demand.demandId).subscribe({
      next: () => {
        this.toastService.generalResponse('success', 'Accepted', 'Demand accepted! Redirecting to list stock page.');
        this.router.navigate(['/farmer/stocks/create'], {
          queryParams: {
            categoryId: demand.categoryId,
            subCategoryId: demand.subCategoryId,
            demandId: demand.demandId
          }
        });
      },
      error: err => this.toastService.errorResponse(err)
    });
  }
}
