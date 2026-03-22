import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GenerateUrlUtils } from '../util/generate-url.utils';
import { Endpoint } from '../const/end_point';
import { IResponse, IResponseWithObject } from '../response/SuccessResponse';
import { IOrderCreateRequest } from './IOrder';

import { AccountService } from '../components/account/account.service';

@Injectable({ providedIn: 'root' })
export class OrderService {

    constructor(
        private http: HttpClient,
        private accountService: AccountService
    ) {}

    private isVerifiedDelivery(): boolean {
        // Only call if confirmed verified to avoid 403
        if (typeof this.accountService?.isRoleVerified !== 'function') return false;
        return this.accountService.isRoleVerified('DELIVERY');
    }

    createOrder(request: IOrderCreateRequest): Observable<IResponse> {
        return this.http.post<IResponse>(
            GenerateUrlUtils.generateUrl(Endpoint.ORDER_CREATE), request
        );
    }

    getPendingOrders(): Observable<IResponseWithObject> {
        if (!this.isVerifiedDelivery()) {
            return new Observable(obs => {
                obs.next({ response: [], status: 'OK', data: [] } as any);
                obs.complete();
            });
        }
        return this.http.get<IResponseWithObject>(
            GenerateUrlUtils.generateUrl(Endpoint.ORDER_PENDING)
        );
    }

    getAcceptedOrders(): Observable<IResponseWithObject> {
        if (!this.isVerifiedDelivery()) {
            return new Observable(obs => {
                obs.next({ response: [], status: 'OK', data: [] } as any);
                obs.complete();
            });
        }
        return this.http.get<IResponseWithObject>(
            GenerateUrlUtils.generateUrl(Endpoint.ORDER_ACCEPTED)
        );
    }

    acceptOrder(orderId: string): Observable<IResponse> {
        return this.http.post<IResponse>(
            GenerateUrlUtils.generateUrl(Endpoint.ORDER_ACCEPT + orderId), {}
        );
    }

    getFarmerAddress(stockSlug: string): Observable<IResponseWithObject> {
        return this.http.get<IResponseWithObject>(
            GenerateUrlUtils.generateUrl(Endpoint.ORDER_FARMER_ADDRESS + stockSlug)
        );
    }
}
