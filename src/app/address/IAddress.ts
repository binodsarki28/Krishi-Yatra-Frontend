export interface IAddress {
    addressId?: string;
    province: string;
    district: string;
    municipality: string;
    city?: string;
    wardNo?: string;
    streetName?: string;
    other: string;
    fullAddress?: string;
}

export interface IAddressRequest {
    province: string;
    district: string;
    municipality: string;
    city?: string;
    wardNo?: string;
    streetName?: string;
    other: string;
}
