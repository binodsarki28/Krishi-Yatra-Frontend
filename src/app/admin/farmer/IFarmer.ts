export interface IFarmerListResponse {
    fullName: string;
    username: string;
    farmTypes: string;
    farmLocation: string;
    isVerified: boolean;
    isActive: boolean;
}

export interface IVerifyFarmerRequest {
    username: string;
    approved: boolean;
    reason?: string;
}
