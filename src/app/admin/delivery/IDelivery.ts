export interface IDeliveryListResponse {
    fullName: string;
    username: string;
    vehicleType: string;
    vehicleBrand: string;
    isVerified: boolean;
    isActive: boolean;
}

export interface IVerifyDeliveryRequest {
    username: string;
    approved: boolean;
    reason?: string;
}
