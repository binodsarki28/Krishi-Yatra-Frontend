import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { DialogModule } from 'primeng/dialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';
import { SelectModule } from 'primeng/select';
import { finalize } from 'rxjs/operators';
import { StockService } from '../../../stock/stock.service';
import { ToastService } from '../../../util/toast.service';
import { IStockListResponse } from '../../../stock/IStock';

@Component({
  selector: 'app-list-stock',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    TagModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    DialogModule,
    ProgressSpinnerModule,
    TooltipModule,
    SelectModule
  ],
  templateUrl: './list-stock.html',
  styleUrls: ['./list-stock.css']
})
export class ListStockComponent implements OnInit {
  stocks: IStockListResponse[] = [];
  loading = true;

  // Pagination
  page = 0;
  size = 10;
  hasMore = true;

  // Filters
  filters = {
    search: '',
    category: '',
    subCategory: '',
    farmer: ''
  };
  activeFilter: 'all' | 'active' | 'blocked' = 'all';

  categories: any[] = [];
  subCategories: any[] = [];

  // Detail Dialog
  detailDialog = false;
  selectedStockDetail: any = null;
  detailLoading = false;

  constructor(
    private stockService: StockService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    setTimeout(() => {
        this.loadStocks();
        this.loadCategories();
    });
  }

  loadCategories() {
    this.stockService.getCategories().subscribe({
      next: (res) => {
        const rawCategories = (res.response as any[]) || [];
        this.categories = [
          { label: 'All Categories', value: '' },
          ...rawCategories.map((cat: any) => ({
            label: cat.categoryName,
            value: cat.categoryId
          }))
        ];
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error fetching categories', err);
      }
    });
  }

  onCategoryChange() {
    this.filters.subCategory = '';
    this.subCategories = [];
    
    if (this.filters.category) {
      this.stockService.getSubCategories(this.filters.category).subscribe({
        next: (res) => {
          const rawSubs = (res.response as any[]) || [];
          this.subCategories = [
            { label: 'All Sub-cats', value: '' },
            ...rawSubs.map((sub: any) => ({
              label: sub.subCategoryName,
              value: sub.subCategoryId
            }))
          ];
          this.cdr.markForCheck();
        }
      });
    }
    this.onSearch();
  }

  loadStocks() {
    this.loading = true;
    const params: any = {
      page: this.page,
      size: this.size,
      all: 'true'
    };

    if (this.filters.search) params.search = this.filters.search;
    if (this.filters.category) params.categoryId = this.filters.category;
    if (this.filters.subCategory) params.subCategoryId = this.filters.subCategory;
    if (this.filters.farmer) params.farmerSearch = this.filters.farmer;

    if (this.activeFilter === 'active') {
      params.active = 'true';
      delete params.all;
    } else if (this.activeFilter === 'blocked') {
      params.active = 'false';
      delete params.all;
    }

    this.stockService.getStockList(params)
      .pipe(finalize(() => {
        this.loading = false;
        this.cdr.markForCheck();
      }))
      .subscribe({
        next: (res) => {
          this.stocks = res.response || [];
          this.hasMore = this.stocks.length === this.size;
        },
        error: (err) => {
          this.toastService.errorResponse(err);
        }
      });
  }

  onSearch() {
    this.page = 0;
    this.loadStocks();
  }

  clearFilters() {
    this.filters = {
      search: '',
      category: '',
      subCategory: '',
      farmer: ''
    };
    this.subCategories = [];
    this.page = 0;
    this.loadStocks();
  }

  setFilter(filter: 'all' | 'active' | 'blocked') {
    this.activeFilter = filter;
    this.page = 0;
    this.loadStocks();
  }

  viewDetail(slug: string) {
    this.detailDialog = true;
    this.detailLoading = true;
    this.stockService.getStockDetails(slug).subscribe({
      next: (res) => {
        this.selectedStockDetail = res.response;
        this.detailLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.toastService.errorResponse(err);
        this.detailDialog = false;
        this.detailLoading = false;
      }
    });
  }

  toggleStatus(stock: IStockListResponse) {
    this.stockService.deleteOrUndeleteStock(stock.stockSlug).subscribe({
      next: (res: any) => {
        this.toastService.successResponse(res);
        this.loadStocks();
      },
      error: (err: any) => {
        this.toastService.errorResponse(err);
      }
    });
  }

  nextPage() {
    if (this.hasMore) {
      this.page++;
      this.loadStocks();
    }
  }

  prevPage() {
    if (this.page > 0) {
      this.page--;
      this.loadStocks();
    }
  }
}
