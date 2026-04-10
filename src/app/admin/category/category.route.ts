import { Routes } from '@angular/router';

export const CATEGORY_ROUTES: Routes = [
    { 
        path: 'manage-category', 
        loadComponent: () => import('./manage-category/manage-category').then(m => m.ManageCategoryComponent) 
    },
    { 
        path: 'manage-sub-category', 
        loadComponent: () => import('./manage-sub-category/manage-sub-category').then(m => m.ManageSubCategoryComponent) 
    },
    { 
        path: '', 
        redirectTo: 'manage-category', 
        pathMatch: 'full' 
    }
];
