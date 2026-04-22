import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
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
import { AddressService } from '../../address/address.service';
import { ICategoryResponse, ISubCategoryResponse } from '../IStock';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { FileUploadModule } from 'primeng/fileupload';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-create-stock',
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
    InputIconModule,
    FileUploadModule,
    ProgressSpinnerModule
  ],
  providers: [MessageService],
  templateUrl: './create-stock.html',
  styleUrls: ['./create-stock.css']
})
export class CreateStockComponent implements OnInit {
  stockForm!: FormGroup;
  categories: ICategoryResponse[] = [];
  subCategories: ISubCategoryResponse[] = [];
  subCategoriesFiltered: ISubCategoryResponse[] = [];
  submitting: boolean = false;
  selectedFiles: any[] = [];

  hasAddress: boolean = false;
  loadingAddress: boolean = true;
  demandId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private stockService: StockService,
    private addressService: AddressService,
    private messageService: MessageService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer
  ) {
    this.initForm();
  }

  ngOnInit() {
    this.checkAddress();
    this.loadCategories();
    this.loadSubCategories();
    this.checkQueryParams();
  }

  checkQueryParams() {
    this.route.queryParams.subscribe(params => {
        if (params['categoryId']) {
            const catId = Number(params['categoryId']);
            this.stockForm.patchValue({ categoryId: catId });
            this.onCategoryChange();
        }
        if (params['subCategoryId']) {
            setTimeout(() => {
                const subCatId = Number(params['subCategoryId']);
                this.stockForm.patchValue({ subCategoryId: subCatId });
                this.cdr.detectChanges();
            }, 500); // give time for subcategories to load and filter
        }
        if (params['demandId']) {
            this.demandId = params['demandId'];
        }
    });
  }

  checkAddress() {
    this.addressService.getMyAddress().subscribe({
        next: (res: any) => {
            setTimeout(() => {
                this.hasAddress = !!res.response;
                this.loadingAddress = false;
                this.cdr.detectChanges();
            });
        },
        error: () => {
            setTimeout(() => {
                this.hasAddress = false;
                this.loadingAddress = false;
                this.cdr.detectChanges();
            });
        }
    });
  }

  initForm() {
    this.stockForm = this.fb.group({
      stockName: ['', [Validators.required, Validators.minLength(3)]],
      productName: ['', [Validators.required]],
      description: ['', [Validators.required]],
      stockImages: [''], // For now a simple string, could be comma separated
      quantity: [null, [Validators.required, Validators.min(0)]],
      pricePerUnit: [null, [Validators.required, Validators.min(1)]],
      minQuantity: [1, [Validators.required, Validators.min(1)]],
      categoryId: [null, [Validators.required]],
      subCategoryId: [{ value: null, disabled: true }, [Validators.required]]
    });
  }

  loadCategories() {
    this.stockService.getCategories().subscribe({
      next: (res: any) => {
        const list = res.response || [];
        this.categories = list.filter((c: ICategoryResponse) => c.active !== false);
        this.cdr.detectChanges();
      }
    });
  }

  loadSubCategories() {
    this.stockService.getSubCategories().subscribe({
      next: (res: any) => {
        const list = res.response || [];
        this.subCategories = list.filter((s: ISubCategoryResponse) => s.active !== false);
        this.cdr.detectChanges();
      }
    });
  }

  onCategoryChange() {
    const categoryId = this.stockForm.get('categoryId')?.value;
    const subCatControl = this.stockForm.get('subCategoryId');

    if (categoryId) {
      this.subCategoriesFiltered = this.subCategories.filter(s => s.categoryId === categoryId);
      subCatControl?.enable();
      subCatControl?.setValue(null);
    } else {
      this.subCategoriesFiltered = [];
      subCatControl?.disable();
      subCatControl?.setValue(null);
    }
  }

  onFilesSelected(event: any) {
    const files = Array.from(event.files) as File[];
    files.forEach(file => {
      const safeUrl = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(file));
      (file as any)['objectURL'] = safeUrl;
      this.selectedFiles.push(file);
    });

    if (this.selectedFiles.length > 5) {
      this.selectedFiles = this.selectedFiles.slice(0, 5);
      this.messageService.add({ severity: 'warn', summary: 'Limit Reached', detail: 'Maximum 5 images allowed' });
    }
  }

  removeFile(index: number) {
    this.selectedFiles.splice(index, 1);
  }

  ngOnDestroy() {
    this.selectedFiles.forEach(file => {
      if (file.objectURL) {
        URL.revokeObjectURL(file.objectURL);
      }
    });
  }

  onSubmit() {
    if (this.stockForm.invalid || this.selectedFiles.length === 0) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: this.selectedFiles.length === 0 ? 'Please select at least one photo' : 'Please fill all required fields correctly' });
      this.stockForm.markAllAsTouched();
      return;
    }

    const formData = new FormData();
    const stockData: any = this.stockForm.getRawValue(); // Ensure disabled controls (like subCategoryId) are included
    if (this.demandId) {
        stockData.demandId = this.demandId;
    }

    // Send stock data as a JSON blob
    formData.append('stockData', new Blob([JSON.stringify(stockData)], { type: 'application/json' }));

    // Add images with unique keys
    console.log('Frontend (Create): Total files to send:', this.selectedFiles.length);
    this.selectedFiles.forEach((file, index) => {
      formData.append(`image_${index}`, file);
    });

    this.submitting = true;
    this.stockService.createStock(formData).subscribe({
      next: (res) => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: res.message });
        setTimeout(() => this.router.navigate(['/farmer/stocks/my-stocks']), 1500);
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Failed to create stock' });
        this.submitting = false;
      }
    });
  }
}
