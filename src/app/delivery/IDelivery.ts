export enum VehicleType {
    BICYCLE = 'BICYCLE',
    AUTO = 'AUTO',
    TAXI = 'TAXI',
    JEEP = 'JEEP',
    VAN = 'VAN',
    TRUCK = 'TRUCK',
    TRACTOR = 'TRACTOR'
}

export interface IRegisterDeliveryRequest {
    vehicleType: VehicleType;
    vehicleBrand: string;
    numberPlate: string;
    licenseNumber: string;
    vehiclePhoto?: string;
    licensePhoto?: string;
}
