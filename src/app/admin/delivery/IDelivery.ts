export interface IDeliveryListResponse {
    fullName: string;
    username: string;
    vehicleType: string;
    vehicleBrand: string;
    status: string;
    isActive: boolean;
}

export interface IVerifyDeliveryRequest {
    username: string;
    approved: boolean;
    reason?: string;
}
