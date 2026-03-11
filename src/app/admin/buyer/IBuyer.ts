export interface IBuyerListResponse {
    fullName: string;
    username: string;
    consumerType: string;
    businessLocation: string;
    isVerified: boolean;
    isActive: boolean;
}

export interface IVerifyBuyerRequest {
    username: string;
    approved: boolean;
    reason?: string;
}
