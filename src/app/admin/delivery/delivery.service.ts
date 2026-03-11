import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GenerateUrlUtils } from '../../util/generate-url.utils';

import { Endpoint } from '../../const/end_point';
import { IVerifyDeliveryRequest, IDeliveryListResponse } from './IDelivery';
import { IResponse } from '../../response/SuccessResponse';

@Injectable({ providedIn: 'root' })
export class DeliveryService {

    constructor(private http: HttpClient) { }

    getDeliveries(verified?: boolean, page: number = 0, size: number = 10, filters: any = {}): Observable<IDeliveryListResponse[]> {
        let url = `${Endpoint.LIST_DELIVERY}?page=${page}&size=${size}`;
        if (verified !== undefined) {
            url += `&verified=${verified}`;
        }

        // Append filters
        if (filters.fullName) url += `&fullName=${encodeURIComponent(filters.fullName)}`;
        if (filters.username) url += `&username=${encodeURIComponent(filters.username)}`;
        if (filters.vehicleType) url += `&vehicleType=${encodeURIComponent(filters.vehicleType)}`;
        if (filters.licenseNumber) url += `&licenseNumber=${encodeURIComponent(filters.licenseNumber)}`;

        return this.http.get<IDeliveryListResponse[]>(GenerateUrlUtils.generateUrl(url));
    }

    verifyDelivery(request: IVerifyDeliveryRequest): Observable<IResponse> {
        return this.http.post<IResponse>(GenerateUrlUtils.generateUrl(Endpoint.VERIFY_DELIVERY), request);
    }

    blockUnblockDelivery(username: string, block: boolean): Observable<IResponse> {
        return this.http.post<IResponse>(GenerateUrlUtils.generateUrl(`${Endpoint.BLOCK_DELIVERY}${username}?block=${block}`), {});
    }

    getDeliveryDetail(username: string): Observable<any> {
        return this.http.get<any>(GenerateUrlUtils.generateUrl(`${Endpoint.DELIVERY_DETAIL}${username}`));
    }
}
