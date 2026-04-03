export interface IStockListResponse {
    stockName: string;
    productName: string;
    stockSlug: string;
    quantity: number;
    pricePerUnit: number;
    subCategoryName: string;
    subCategoryId: number;
    categoryName: string;
    categoryId: number;
    farmerName: string;
    minQuantity: number;
    stockImages: string[];
    active: boolean;
}

export interface ICategoryResponse {
    categoryId: number;
    categoryName: string;
    active: boolean;
}

export interface ISubCategoryResponse {
    subCategoryId: number;
    subCategoryName: string;
    categoryId: number;
    categoryName: string;
    active: boolean;
}
