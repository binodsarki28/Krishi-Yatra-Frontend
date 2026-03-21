export interface IFarmerListResponse {
    fullName: string;
    username: string;
    farmTypes: string;
    farmLocation: string;
    status: string;
    isActive: boolean;
}

export interface IVerifyFarmerRequest {
    username: string;
    approved: boolean;
    reason?: string;
}
