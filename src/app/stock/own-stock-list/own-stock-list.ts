import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { StockService } from '../stock.service';
import { IStockListResponse, ICategoryResponse, ISubCategoryResponse } from '../IStock';
import { MessageService, ConfirmationService } from 'primeng/api';
import { SelectModule } from 'primeng/select';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ToastModule } from 'primeng/toast';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { TooltipModule } from 'primeng/tooltip';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { Subject, filter } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-own-stock-list',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    TagModule,
    ToastModule,
    RouterModule,
    FormsModule,
    IconFieldModule,
    InputIconModule,
    SelectModule,
    InputGroupModule,
    InputGroupAddonModule,
    ConfirmDialogModule,
    TooltipModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './own-stock-list.html',
  styleUrls: ['./own-stock-list.css']
})
export class OwnStockListComponent implements OnInit, OnDestroy {
  stocks: IStockListResponse[] = [];
  filteredStocks: IStockListResponse[] = [];
  displayStocks: IStockListResponse[] = [];
  loading: boolean = true;

  categories: ICategoryResponse[] = [];
  subCategories: ISubCategoryResponse[] = [];
  subCategoriesFiltered: ISubCategoryResponse[] = [];

  page = 0;
  size = 10;
  hasMore = false;

  filters = {
    stockName: '',
    productName: '',
    categoryName: '',
    subCategoryName: ''
  };

  private searchSubject = new Subject<void>();
  private routerSubscription: any;

  constructor(
    private stockService: StockService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    this.setupSearch();
    if (isPlatformBrowser(this.platformId)) {
        setTimeout(() => {
            this.loadStocks();
            this.loadCategories();
            this.loadSubCategories();
        });
    }

    this.routerSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const url = event.urlAfterRedirects || event.url;
      if (url.includes('/my-stocks')) {
        this.loadStocks();
      }
    });
  }

  setupSearch() {
    this.searchSubject.pipe(
      debounceTime(400)
    ).subscribe(() => {
      this.applyFilters();
    });
  }

  onSearch(immediate = false) {
    if (immediate) {
      this.applyFilters();
    } else {
      this.searchSubject.next();
    }
  }

  clearFilters() {
    this.filters = {
      stockName: '',
      productName: '',
      categoryName: '',
      subCategoryName: ''
    };
    this.subCategoriesFiltered = [];
    this.applyFilters();
  }

  loadCategories() {
    this.stockService.getCategories().subscribe({
      next: (res: any) => {
        this.categories = res.response || [];
      }
    });
  }

  loadSubCategories() {
    this.stockService.getSubCategories().subscribe({
      next: (res: any) => {
        this.subCategories = res.response || [];
      }
    });
  }

  onCategoryFilterChange() {
    const selectedCat = this.categories.find(c => c.categoryName === this.filters.categoryName);
    if (selectedCat) {
      this.subCategoriesFiltered = this.subCategories.filter(s => s.categoryId === selectedCat.categoryId);
    } else {
      this.subCategoriesFiltered = [];
    }
    this.filters.subCategoryName = '';
    this.onSearch(true);
  }

  applyFilters() {
    this.page = 0;
    const f = this.filters;

    if (!f.stockName && !f.productName && !f.categoryName && !f.subCategoryName) {
      this.filteredStocks = [...this.stocks];
    } else {
      this.filteredStocks = this.stocks.filter(s => {
        return (!f.stockName || (s.stockName?.toLowerCase() || '').includes(f.stockName.toLowerCase())) &&
               (!f.productName || (s.productName?.toLowerCase() || '').includes(f.productName.toLowerCase())) &&
               (!f.categoryName || (s.categoryName?.toLowerCase() || '').includes(f.categoryName.toLowerCase())) &&
               (!f.subCategoryName || (s.subCategoryName?.toLowerCase() || '').includes(f.subCategoryName.toLowerCase()));
      });
    }
    this.updateDisplayStocks();
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  updateDisplayStocks() {
    const start = this.page * this.size;
    const end = start + this.size;
    this.displayStocks = this.filteredStocks.slice(start, end);
    this.hasMore = end < this.filteredStocks.length;
    this.cdr.markForCheck();
  }

  nextPage() {
    if (this.hasMore) {
        this.page++;
        this.updateDisplayStocks();
    }
  }

  prevPage() {
    if (this.page > 0) {
        this.page--;
        this.updateDisplayStocks();
    }
  }



  loadStocks() {
    this.loading = true;
    this.cdr.markForCheck();

    this.stockService.getFarmerStocks().subscribe({
      next: (res: any) => {
        this.stocks = res.response || [];
        this.applyFilters();
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load stocks' });
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  deleteOrUndeleteStock(slug: string, currentStatus: boolean) {
    this.confirmationService.confirm({
      message: `Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this stock listing?`,
      header: 'Confirm Status Change',
      icon: currentStatus ? 'pi pi-exclamation-triangle' : 'pi pi-info-circle',
      accept: () => {
        this.stockService.deleteOrUndeleteStock(slug).subscribe({
          next: (res: any) => {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: res.message });
            this.loadStocks();
          },
          error: (err: any) => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update stock status' });
          }
        });
      }
    });
  }

  getSeverity(active: boolean) {
    return active ? 'success' : 'danger';
  }
}
