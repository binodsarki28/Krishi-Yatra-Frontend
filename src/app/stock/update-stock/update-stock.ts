import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin, finalize } from 'rxjs';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { StockService } from '../stock.service';
import { ICategoryResponse, ISubCategoryResponse } from '../IStock';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';

@Component({
  selector: 'app-update-stock',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule, 
    CardModule, 
    InputTextModule, 
    InputNumberModule, 
    TextareaModule, 
    SelectModule, 
    ButtonModule, 
    ToastModule,
    RouterModule,
    InputGroupModule,
    InputGroupAddonModule,
    IconFieldModule,
    InputIconModule
  ],
  providers: [MessageService],
  templateUrl: './update-stock.html',
  styleUrls: ['./update-stock.css']
})
export class UpdateStockComponent implements OnInit {
  stockForm!: FormGroup;
  categories: ICategoryResponse[] = [];
  subCategories: ISubCategoryResponse[] = [];
  subCategoriesFiltered: ISubCategoryResponse[] = [];
  submitting: boolean = false;
  loading: boolean = true;
  slug!: string;

  constructor(
    private fb: FormBuilder,
    private stockService: StockService,
    private messageService: MessageService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
    this.initForm();
  }

  ngOnInit() {
    this.slug = this.route.snapshot.paramMap.get('slug') || '';
    if (!this.slug) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Invalid Stock Slug' });
      this.loading = false;
      return;
    }
    this.loadAllData();
  }

  loadAllData() {
    this.loading = true;
    forkJoin({
      categories: this.stockService.getCategories(),
      subCategories: this.stockService.getSubCategories(),
      details: this.stockService.getStockDetails(this.slug)
    }).pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (res: any) => {
        this.categories = res.categories.response || [];
        this.subCategories = res.subCategories.response || [];
        
        const data = res.details.response;
        if (data) {
          this.stockForm.patchValue(data);
          // Manually filter subcategories based on loaded category
          const catId = data.categoryId;
          if (catId) {
            this.subCategoriesFiltered = this.subCategories.filter(s => s.categoryId === catId);
          }
          this.stockForm.get('subCategoryId')?.setValue(data.subCategoryId);
        }
      },
      error: (err) => {
        console.error('Failed to load stock data:', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load stock information' });
      }
    });
  }

  initForm() {
    this.stockForm = this.fb.group({
      stockSlug: [this.slug, [Validators.required]],
      stockName: ['', [Validators.required, Validators.minLength(3)]],
      productName: ['', [Validators.required]],
      description: ['', [Validators.required]],
      stockImages: [''],
      quantity: [null, [Validators.required, Validators.min(1)]],
      pricePerUnit: [null, [Validators.required, Validators.min(1)]],
      categoryId: [null, [Validators.required]],
      subCategoryId: [null, [Validators.required]],
      active: [true]
    });
  }

  onCategoryChange(clearSub: boolean = true) {
    const categoryId = this.stockForm.get('categoryId')?.value;
    if (categoryId) {
      this.subCategoriesFiltered = this.subCategories.filter(s => s.categoryId === categoryId);
      if (clearSub) this.stockForm.get('subCategoryId')?.setValue(null);
    } else {
      this.subCategoriesFiltered = [];
    }
  }

  onSubmit() {
    if (this.stockForm.invalid) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please fill all required fields correctly' });
      this.stockForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.stockService.updateStock(this.stockForm.value).subscribe({
      next: (res) => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: res.message });
        setTimeout(() => this.router.navigate(['/farmer/stocks/my-stocks']), 1500);
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Failed to update stock' });
        this.submitting = false;
      }
    });
  }
}
