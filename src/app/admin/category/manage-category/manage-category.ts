import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryService, Category } from '../category.service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-manage-category',
  standalone: true,
  imports: [
      CommonModule,
      FormsModule,
      ToastModule,
      TableModule,
      ButtonModule,
      InputTextModule,
      TagModule,
      ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './manage-category.html',
  styleUrl: './manage-category.css',
})
export class ManageCategoryComponent implements OnInit {
    categories: Category[] = [];
    newCategoryName: string = '';
    isAddingCategory: boolean = false;
    
    constructor(
        private categoryService: CategoryService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        this.loadCategories();
    }

    loadCategories() {
        this.categoryService.getCategories().subscribe({
            next: (res) => {
                this.categories = res.response || [];
                this.cdr.detectChanges();
            },
            error: (err) => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load categories' });
            }
        });
    }

    createCategory() {
        if (!this.newCategoryName.trim()) return;
        this.isAddingCategory = true;
        this.categoryService.createCategory(this.newCategoryName).subscribe({
            next: (res) => {
                this.messageService.add({ severity: 'success', summary: 'Success', detail: res.message || 'Category created' });
                this.newCategoryName = '';
                this.loadCategories();
            },
            error: (err) => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Failed to create category' });
                this.isAddingCategory = false;
            },
            complete: () => {
                this.isAddingCategory = false;
            }
        });
    }

    deleteCategory(id: number) {
        this.confirmationService.confirm({
            message: 'Are you sure you want to toggle this category?',
            header: 'Confirm Toggle',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.categoryService.deleteCategory(id).subscribe({
                    next: (res) => {
                        this.messageService.add({ severity: 'success', summary: 'Success', detail: res.message || 'Category toggled' });
                        this.loadCategories();
                    },
                    error: (err) => {
                        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Failed to toggle category' });
                    }
                });
            }
        });
    }
}
