import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
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
import { Router, RouterModule } from '@angular/router';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';

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
    InputIconModule
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

  constructor(
    private fb: FormBuilder,
    private stockService: StockService,
    private messageService: MessageService,
    private router: Router
  ) {
    this.initForm();
  }

  ngOnInit() {
    this.loadCategories();
    this.loadSubCategories();
  }

  initForm() {
    this.stockForm = this.fb.group({
      stockName: ['', [Validators.required, Validators.minLength(3)]],
      productName: ['', [Validators.required]],
      description: ['', [Validators.required]],
      stockImages: [''], // For now a simple string, could be comma separated
      quantity: [null, [Validators.required, Validators.min(1)]],
      pricePerUnit: [null, [Validators.required, Validators.min(1)]],
      categoryId: [null, [Validators.required]],
      subCategoryId: [null, [Validators.required]]
    });
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

  onCategoryChange() {
    const categoryId = this.stockForm.get('categoryId')?.value;
    if (categoryId) {
      this.subCategoriesFiltered = this.subCategories.filter(s => s.categoryId === categoryId);
      this.stockForm.get('subCategoryId')?.setValue(null);
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
    this.stockService.createStock(this.stockForm.value).subscribe({
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
