import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GenerateUrlUtils } from '../../util/generate-url.utils';

import { Endpoint } from '../../const/end_point';
import { IVerifyFarmerRequest, IFarmerListResponse } from './IFarmer';
import { IResponse } from '../../response/SuccessResponse';

@Injectable({ providedIn: 'root' })
export class FarmerService {

    constructor(private http: HttpClient) { }

    getFarmers(status?: string, page: number = 0, size: number = 10, filters: any = {}): Observable<IFarmerListResponse[]> {
        let url = `${Endpoint.LIST_FARMERS}?page=${page}&size=${size}`;
        if (status) {
            url += `&status=${status}`;
        }

        // Append filters
        if (filters.fullName) url += `&fullName=${encodeURIComponent(filters.fullName)}`;
        if (filters.username) url += `&username=${encodeURIComponent(filters.username)}`;
        if (filters.farmTypes) url += `&farmTypes=${encodeURIComponent(filters.farmTypes)}`;
        if (filters.farmLocation) url += `&farmLocation=${encodeURIComponent(filters.farmLocation)}`;

        return this.http.get<IFarmerListResponse[]>(GenerateUrlUtils.generateUrl(url));
    }

    verifyFarmer(request: IVerifyFarmerRequest): Observable<IResponse> {
        return this.http.post<IResponse>(GenerateUrlUtils.generateUrl(Endpoint.VERIFY_FARMER), request);
    }

    blockUnblockFarmer(username: string, block: boolean, reason?: string): Observable<IResponse> {
        let url = `${Endpoint.BLOCK_FARMER}${username}?block=${block}`;
        if (reason) {
            url += `&reason=${encodeURIComponent(reason)}`;
        }
        return this.http.post<IResponse>(GenerateUrlUtils.generateUrl(url), {});
    }

    getFarmerDetail(username: string): Observable<any> {
        return this.http.get<any>(GenerateUrlUtils.generateUrl(`${Endpoint.FARMER_DETAIL}${username}`));
    }
}
