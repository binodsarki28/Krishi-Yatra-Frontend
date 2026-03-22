export interface IOrderCreateRequest {
    stockSlug: string;
    orderQuantity: number;
    pickupAddress: string;
    dropAddress: string;
    deliveryFee: number;
    vehicleType: string;
    notes: string;
    checkpoints?: string;
}

export interface IOrderResponse {
    orderId: string;
    stockSlug: string;
    productName: string;
    orderQuantity: number;
    perUnitPrice: number;
    totalPrice: number;
    orderStatus: string;
    pickupAddress: string;
    dropAddress: string;
    deliveryFee: number;
    vehicleType: string;
    notes: string;
    checkpoints?: string;
    createdAt: string;
}
