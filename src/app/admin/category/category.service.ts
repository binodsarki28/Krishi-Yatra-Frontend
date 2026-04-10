import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GenerateUrlUtils } from '../../util/generate-url.utils';

export interface Category {
    categoryId: number;
    categoryName: string;
    active: boolean;
}

export interface SubCategory {
    subCategoryId: number;
    subCategoryName: string;
    categoryId: number;
    categoryName?: string;
    active: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class CategoryService {
    constructor(private http: HttpClient) { }

    // Categories
    getCategories(): Observable<any> {
        return this.http.get(GenerateUrlUtils.generateUrl('api/v1/categories'));
    }

    createCategory(name: string): Observable<any> {
        return this.http.post(GenerateUrlUtils.generateUrl('api/v1/categories'), { name: name });
    }

    deleteCategory(id: number): Observable<any> {
        return this.http.delete(GenerateUrlUtils.generateUrl(`api/v1/categories/${id}`));
    }

    // Sub-Categories
    getSubCategories(categoryId?: number): Observable<any> {
        return this.http.get(GenerateUrlUtils.generateUrl('api/v1/sub-categories'), {
            params: categoryId ? { categoryId: categoryId.toString() } : {}
        });
    }

    createSubCategory(name: string, categoryId: number): Observable<any> {
        return this.http.post(GenerateUrlUtils.generateUrl('api/v1/sub-categories'), { name: name, categoryId: categoryId });
    }

    deleteSubCategory(id: number): Observable<any> {
        return this.http.delete(GenerateUrlUtils.generateUrl(`api/v1/sub-categories/${id}`));
    }
}
