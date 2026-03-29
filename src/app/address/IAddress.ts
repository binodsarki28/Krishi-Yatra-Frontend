export interface IAddress {
    province: string;
    district: string;
    municipality: string;
    city?: string;
    wardNo?: number;
    streetName?: string;
    fullAddress?: string;
}

export interface IAddressRequest {
    province: string;
    district: string;
    municipality: string;
    wardNo?: number;
    streetName?: string;
}
