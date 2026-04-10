export interface IDemandCreateRequest {
    categoryId: number;
    subCategoryId: number;
    quantity: number;
    expectedPricePerUnit: number;
    description: string;
}

export interface IDemandResponse {
    demandId: string;
    categoryName: string;
    categoryId: number;
    subCategoryName: string;
    subCategoryId: number;
    quantity: number;
    expectedPricePerUnit: number;
    description: string;
    status: 'OPEN' | 'ACCEPTED' | 'CANCELLED' | 'COMPLETED';
    buyerName: string;
    buyerPhone: string;
    acceptedFarmerName: string;
    fulfilledStockSlug: string;
    createdAt: string;
}
