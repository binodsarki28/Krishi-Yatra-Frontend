export interface IStockListResponse {
    stockName: string;
    productName: string;
    stockSlug: string;
    quantity: number;
    pricePerUnit: number;
    subCategoryName: string;
    categoryName: string;
    farmerName: string;
    minQuantity: number;
    stockImages: string[];
    active: boolean;
}

export interface ICategoryResponse {
    categoryId: string;
    categoryName: string;
}

export interface ISubCategoryResponse {
    subCategoryId: string;
    subCategoryName: string;
    categoryId: string;
    categoryName: string;
}
