import { Component, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { DemandService } from '../demand.service';
import { StockService } from '../../stock/stock.service';
import { ToastService } from '../../util/toast.service';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';

@Component({
  selector: 'app-demand-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, SelectModule, InputTextModule, InputNumberModule, TextareaModule],
  templateUrl: './demand-form.html',
  styleUrls: ['./demand-form.css']
})
export class DemandFormComponent implements OnInit {
  @Output() demandCreated = new EventEmitter<void>();

  categories: any[] = [];
  subCategories: any[] = [];
  
  demand = {
    categoryId: null as number | null,
    subCategoryId: null as number | null,
    quantity: null,
    expectedPricePerUnit: null,
    description: ''
  };

  submitting = false;

  constructor(
    private demandService: DemandService,
    private stockService: StockService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.stockService.getCategories().subscribe((res: any) => {
      this.categories = res.response || [];
    });
  }

  onCategoryChange() {
    this.demand.subCategoryId = null;
    if (this.demand.categoryId) {
      this.stockService.getSubCategories(this.demand.categoryId.toString()).subscribe((res: any) => {
        this.subCategories = res.response || [];
      });
    } else {
      this.subCategories = [];
    }
  }

  onSubmit(form: NgForm) {
    if (!this.demand.categoryId || !this.demand.subCategoryId || !this.demand.quantity || !this.demand.expectedPricePerUnit || !this.demand.description) {
      this.toastService.generalResponse('warning', 'Missing Information', 'Please fill in all mandatory fields.');
      return;
    }

    this.submitting = true;
    this.demandService.createDemand(this.demand as any).subscribe({
      next: () => {
        this.toastService.generalResponse('success', 'Created', 'Your demand has been posted successfully!');
        this.submitting = false;
        this.resetForm(form);
        this.demandCreated.emit();
      },
      error: err => {
        this.toastService.errorResponse(err);
        this.submitting = false;
      }
    });
  }

  resetForm(form?: NgForm) {
    if (form) {
      form.resetForm();
    }
    this.demand = {
      categoryId: null,
      subCategoryId: null,
      quantity: null,
      expectedPricePerUnit: null,
      description: ''
    };
    this.subCategories = [];
  }
}
