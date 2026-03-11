export enum ConsumerType {
    HOTEL = 'HOTEL',
    WHOLESALER = 'WHOLESALER',
    RESTAURANT = 'RESTAURANT',
    RETAILER = 'RETAILER',
    NORMAL = 'NORMAL'
}

export interface IRegisterBuyerRequest {
    consumerType: ConsumerType;
    businessName: string;
    businessLocation: string;
}
