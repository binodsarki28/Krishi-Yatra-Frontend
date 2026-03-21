import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
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
import { FileUploadModule } from 'primeng/fileupload';

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
    InputIconModule,
    FileUploadModule
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
  selectedFiles: any[] = [];
  existingImages: string[] = [];

  constructor(
    private fb: FormBuilder,
    private stockService: StockService,
    private messageService: MessageService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer
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
          // Images are now a List from the backend
          this.existingImages = data.stockImages || [];
          
          this.stockForm.patchValue(data);
          
          const catId = data.categoryId;
          const subCatControl = this.stockForm.get('subCategoryId');
          if (catId) {
            this.subCategoriesFiltered = this.subCategories.filter(s => s.categoryId === catId);
            subCatControl?.enable();
          } else {
            subCatControl?.disable();
          }
          subCatControl?.setValue(data.subCategoryId);
          this.cdr.detectChanges();
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
      quantity: [null, [Validators.required, Validators.min(0)]],
      pricePerUnit: [null, [Validators.required, Validators.min(1)]],
      minQuantity: [1, [Validators.required, Validators.min(1)]],
      categoryId: [null, [Validators.required]],
      subCategoryId: [{ value: null, disabled: true }, [Validators.required]],
      active: [true],
      image1: [''],
      image2: [''],
      image3: [''],
      image4: [''],
      image5: ['']
    });
  }

  onCategoryChange(clearSub: boolean = true) {
    const categoryId = this.stockForm.get('categoryId')?.value;
    const subCatControl = this.stockForm.get('subCategoryId');
    
    if (categoryId) {
      this.subCategoriesFiltered = this.subCategories.filter(s => s.categoryId === categoryId);
      subCatControl?.enable();
      if (clearSub) subCatControl?.setValue(null);
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
    // Cleanup object URLs
    this.selectedFiles.forEach(file => {
      if (file.objectURL) {
        URL.revokeObjectURL(file.objectURL);
      }
    });
  }

  onSubmit() {
    if (this.stockForm.invalid || (this.selectedFiles.length === 0 && this.existingImages.length === 0)) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: (this.selectedFiles.length === 0 && this.existingImages.length === 0) ? 'Please select at least one photo' : 'Please fill all required fields correctly' });
      this.stockForm.markAllAsTouched();
      return;
    }

    const formData = new FormData();
    const stockData = this.stockForm.value;
    
    // Send stock data as a JSON blob
    formData.append('stockData', new Blob([JSON.stringify(stockData)], { type: 'application/json' }));
    
    // Add images
    console.log('Frontend: Total files to send:', this.selectedFiles.length);
    // Unique keys to prevent any 'duplicate key' issues in transit
    this.selectedFiles.forEach((file, index) => {
      console.log('Appending file to FormData:', file.name);
      formData.append(`image_${index}`, file);
    });

    console.log('Frontend: Total files in FormData:', this.selectedFiles.length);
    if (confirm(`You have selected ${this.selectedFiles.length} photos. Are you sure you want to upload them?`)) {
      this.submitting = true;
      this.stockService.updateStock(formData).subscribe({
        next: (response) => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Stock updated successfully' });
          setTimeout(() => this.router.navigate(['/farmer/stocks']), 1500);
        },
        error: (err) => {
          this.submitting = false;
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update stock' });
        }
      });
    } else {
      this.submitting = false;
    }
  }
}
