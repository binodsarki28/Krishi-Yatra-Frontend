import { Component, OnInit, HostListener, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser, NgOptimizedImage } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { finalize } from 'rxjs';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { RippleModule } from 'primeng/ripple';
import { TooltipModule } from 'primeng/tooltip';
import { DataViewModule } from 'primeng/dataview';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

import { StockService } from '../stock.service';
import { IStockListResponse, ICategoryResponse, ISubCategoryResponse } from '../IStock';
import { ToastService } from '../../util/toast.service';

@Component({
  selector: 'app-stock-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ButtonModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    CardModule,
    TagModule,
    SkeletonModule,
    RippleModule,
    TooltipModule,
    DataViewModule,
    ProgressSpinnerModule,
    NgOptimizedImage
  ],
  templateUrl: './stock-list.html',
  styleUrls: ['./stock-list.css']
})
export class StockListComponent implements OnInit {
  stocks: IStockListResponse[] = [];
  categories: ICategoryResponse[] = [];
  subCategories: ISubCategoryResponse[] = [];

  loading = true;
  loadingMore = false;

  // Filters
  searchTerm: string = '';
  selectedCategoryId: number | null = null;
  selectedSubCategoryId: number | null = null;

  // Pagination
  page = 0;
  size = 10;
  hasMore = true;

  defaultImage = 'assets/images/placeholder-stock.jpg';

  constructor(
    private stockService: StockService,
    private toastService: ToastService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      // Large applications often benefit from pushing initial data loads to the next macro-task
      // to avoid ExpressionChangedAfterItHasBeenCheckedError during the initial check.
      setTimeout(() => {
        this.loadInitialData();
      });
    }
  }

  loadInitialData() {
    this.loadCategories();
    this.loadStocks(true);
  }

  loadCategories() {
    this.stockService.getCategories().subscribe({
      next: (res) => {
        this.categories = res.response as ICategoryResponse[];
        this.cdr.markForCheck();
      }
    });
  }

  loadSubCategories(categoryId: number) {
    this.stockService.getSubCategories(categoryId.toString()).subscribe({
      next: (res) => {
        this.subCategories = res.response as ISubCategoryResponse[];
        this.cdr.markForCheck();
      }
    });
  }

  loadStocks(reset = false) {
    if (reset) {
      this.page = 0;
      this.stocks = [];
      this.loading = true;
      this.hasMore = true;
    } else {
      this.loadingMore = true;
    }

    const filters: any = {
      page: this.page,
      size: this.size
    };

    if (this.searchTerm) {
      filters.search = this.searchTerm;
    }
    if (this.selectedCategoryId) filters.categoryId = this.selectedCategoryId;
    if (this.selectedSubCategoryId) filters.subCategoryId = this.selectedSubCategoryId;

    this.stockService.getStockList(filters)
      .subscribe({
        next: (res) => {
          const newStocks = res.response || [];
          this.stocks = [...this.stocks, ...newStocks];
          this.hasMore = newStocks.length === this.size;
          if (this.hasMore) this.page++;

          this.loading = false;
          this.loadingMore = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.loading = false;
          this.loadingMore = false;
          this.toastService.errorResponse(err);
          this.cdr.markForCheck();
        }
      });
  }

  onSearch() {
    this.selectedCategoryId = null;
    this.selectedSubCategoryId = null;
    this.subCategories = [];
    this.loadStocks(true);
  }

  onClearSearch() {
    this.searchTerm = '';
    this.loadStocks(true);
  }

  selectCategory(id: number | null) {
    this.selectedCategoryId = id;
    this.selectedSubCategoryId = null;
    this.subCategories = [];
    if (id) {
      this.loadSubCategories(id);
    }
    this.loadStocks(true);
  }

  selectSubCategory(id: number | null) {
    this.selectedSubCategoryId = id;
    this.loadStocks(true);
  }

  resetFilters() {
    this.searchTerm = '';
    this.selectedCategoryId = null;
    this.selectedSubCategoryId = null;
    this.subCategories = [];
    this.loadStocks(true);
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (!isPlatformBrowser(this.platformId) || this.loading || this.loadingMore || !this.hasMore) return;

    const windowHeight = window.innerHeight;
    const dirtyHeight = document.documentElement.scrollHeight;
    const scrollPos = window.scrollY || document.documentElement.scrollTop;

    // Load more when user is 100px from the absolute bottom
    if (windowHeight + scrollPos >= dirtyHeight - 100) {
      this.loadStocks();
    }
  }

  getStockImage(stockImages: string[]): string {
    const fallback = 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?q=80&w=400';
    if (!stockImages || stockImages.length === 0 || !stockImages[0]) {
      return fallback;
    }
    
    let url = stockImages[0].trim();
    if (url.startsWith('http://')) {
      return url.replace('http://', 'https://');
    }
    return url;
  }

  viewDetail(slug: string) {
    this.router.navigate(['/stock-detail', slug]);
  }

  orderNow(stock: IStockListResponse) {
    this.router.navigate(['/stock-detail', stock.stockSlug]);
  }
}
