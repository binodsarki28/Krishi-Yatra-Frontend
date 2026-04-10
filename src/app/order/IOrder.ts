export interface IOrderCreateRequest {
    stockSlug: string;
    orderQuantity: number;
    pickupAddress: string;
    dropAddress: string;
    deliveryFee: number;
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
    notes: string;
    checkpoints?: string;
    createdAt: string;
    conflictMessage?: string;
    conflictRaisedAt?: string;
    message?: string;
    farmerName?: string;
    farmerPhone?: string;
    buyerName?: string;
    buyerPhone?: string;
    deliveryName?: string;
    deliveryPhone?: string;
    stockImages?: string[];
    categoryName?: string;
    acceptedAt?: string;
    pickedUpAt?: string;
    deliveredAt?: string;
}
