export interface IDemandCreateRequest {
    categoryGuid: string;
    subCategoryGuid: string;
    quantity: number;
    expectedPricePerUnit: number;
    description: string;
}

export interface IDemandResponse {
    demandId: string;
    categoryName: string;
    categoryGuid: string;
    subCategoryName: string;
    subCategoryGuid: string;
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
