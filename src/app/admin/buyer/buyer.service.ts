import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GenerateUrlUtils } from '../../util/generate-url.utils';

import { Endpoint } from '../../const/end_point';
import { IVerifyBuyerRequest, IBuyerListResponse } from './IBuyer';
import { IResponse } from '../../response/SuccessResponse';

@Injectable({ providedIn: 'root' })
export class BuyerService {

    constructor(private http: HttpClient) { }

    getBuyers(verified?: boolean, page: number = 0, size: number = 10, filters: any = {}): Observable<IBuyerListResponse[]> {
        let url = `${Endpoint.LIST_BUYERS}?page=${page}&size=${size}`;
        if (verified !== undefined) {
            url += `&verified=${verified}`;
        }

        // Append filters
        if (filters.fullName) url += `&fullName=${encodeURIComponent(filters.fullName)}`;
        if (filters.username) url += `&username=${encodeURIComponent(filters.username)}`;
        if (filters.consumerType) url += `&consumerType=${encodeURIComponent(filters.consumerType)}`;
        if (filters.businessLocation) url += `&businessLocation=${encodeURIComponent(filters.businessLocation)}`;

        return this.http.get<IBuyerListResponse[]>(GenerateUrlUtils.generateUrl(url));
    }

    verifyBuyer(request: IVerifyBuyerRequest): Observable<IResponse> {
        return this.http.post<IResponse>(GenerateUrlUtils.generateUrl(Endpoint.VERIFY_BUYER), request);
    }

    blockUnblockBuyer(username: string, block: boolean): Observable<IResponse> {
        return this.http.post<IResponse>(GenerateUrlUtils.generateUrl(`${Endpoint.BLOCK_BUYER}${username}?block=${block}`), {});
    }

    getBuyerDetail(username: string): Observable<any> {
        return this.http.get<any>(GenerateUrlUtils.generateUrl(`${Endpoint.BUYER_DETAIL}${username}`));
    }
}
