import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryService, Category, SubCategory } from '../category.service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-manage-sub-category',
  standalone: true,
  imports: [
      CommonModule,
      FormsModule,
      ToastModule,
      TableModule,
      ButtonModule,
      InputTextModule,
      SelectModule,
      TagModule,
      ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './manage-sub-category.html',
  styleUrl: './manage-sub-category.css',
})
export class ManageSubCategoryComponent implements OnInit {
    categories: Category[] = [];
    subCategories: SubCategory[] = [];
    
    newSubCategoryName: string = '';
    selectedCategoryForSub: any = null;
    isAddingSubCategory: boolean = false;
    
    constructor(
        private categoryService: CategoryService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        this.loadCategories();
        this.loadSubCategories();
    }

    loadCategories() {
        this.categoryService.getCategories().subscribe({
            next: (res) => {
                this.categories = res.response || [];
                this.mapCategoryNames();
                this.cdr.detectChanges();
            },
            error: (err) => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load categories' });
            }
        });
    }

    loadSubCategories() {
        this.categoryService.getSubCategories().subscribe({
            next: (res) => {
                this.subCategories = res.response || [];
                this.mapCategoryNames();
                this.cdr.detectChanges();
            },
            error: (err) => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load sub-categories' });
            }
        });
    }

    mapCategoryNames() {
        if (this.categories.length > 0 && this.subCategories.length > 0) {
            this.subCategories.forEach(sub => {
                const cat = this.categories.find(c => c.categoryId === sub.categoryId);
                if (cat) sub.categoryName = cat.categoryName;
            });
            this.subCategories = [...this.subCategories];
            this.cdr.detectChanges();
        }
    }

    createSubCategory() {
        if (!this.newSubCategoryName.trim() || !this.selectedCategoryForSub) return;
        this.isAddingSubCategory = true;
        this.categoryService.createSubCategory(this.newSubCategoryName, this.selectedCategoryForSub.categoryId).subscribe({
            next: (res) => {
                this.messageService.add({ severity: 'success', summary: 'Success', detail: res.message || 'Sub-Category created' });
                this.newSubCategoryName = '';
                this.selectedCategoryForSub = null;
                this.loadSubCategories();
            },
            error: (err) => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Failed to create sub-category' });
                this.isAddingSubCategory = false;
            },
            complete: () => {
                this.isAddingSubCategory = false;
            }
        });
    }

    deleteSubCategory(id: number) {
        this.confirmationService.confirm({
            message: 'Are you sure you want to toggle this sub-category?',
            header: 'Confirm Toggle',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.categoryService.deleteSubCategory(id).subscribe({
                    next: (res) => {
                        this.messageService.add({ severity: 'success', summary: 'Success', detail: res.message || 'Sub-Category toggled' });
                        this.loadSubCategories();
                    },
                    error: (err) => {
                        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Failed to toggle sub-category' });
                    }
                });
            }
        });
    }
}
