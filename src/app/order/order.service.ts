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

    markAsPickedUp(orderId: string): Observable<IResponse> {
        return this.http.post<IResponse>(
            GenerateUrlUtils.generateUrl(Endpoint.ORDER_PICKED_UP + orderId), {}
        );
    }

    getFarmerAddress(stockSlug: string): Observable<IResponseWithObject> {
        return this.http.get<IResponseWithObject>(
            GenerateUrlUtils.generateUrl(Endpoint.ORDER_FARMER_ADDRESS + stockSlug)
        );
    }

    // Role-specific order lists
    getBuyerOrders(page = 0, size = 20, status?: string | null, search?: string | null): Observable<IResponseWithObject> {
        let url = GenerateUrlUtils.generateUrl(Endpoint.ORDER_BUYER_LIST) + `?page=${page}&size=${size}&sort=createdAt,desc`;
        if (status) url += `&status=${status}`;
        if (search) url += `&search=${search}`;
        return this.http.get<IResponseWithObject>(url);
    }

    getFarmerOrders(page = 0, size = 20, status?: string | null, search?: string | null): Observable<IResponseWithObject> {
        let url = GenerateUrlUtils.generateUrl(Endpoint.ORDER_FARMER_LIST) + `?page=${page}&size=${size}&sort=createdAt,desc`;
        if (status) url += `&status=${status}`;
        if (search) url += `&search=${search}`;
        return this.http.get<IResponseWithObject>(url);
    }

    getDeliveryOrders(page = 0, size = 20, status?: string | null, search?: string | null): Observable<IResponseWithObject> {
        let url = GenerateUrlUtils.generateUrl(Endpoint.ORDER_DELIVERY_LIST) + `?page=${page}&size=${size}&sort=createdAt,desc`;
        if (status) url += `&status=${status}`;
        if (search) url += `&search=${search}`;
        return this.http.get<IResponseWithObject>(url);
    }

    getAllOrders(page = 0, size = 20, status?: string | null, search?: string | null, filters?: any): Observable<IResponseWithObject> {
        let url = GenerateUrlUtils.generateUrl(Endpoint.ORDER_LIST) + `?page=${page}&size=${size}&sort=createdAt,desc`;
        if (status) url += `&status=${status}`;
        if (search) url += `&search=${search}`;
        if (filters) {
            if (filters.orderId) url += `&orderId=${filters.orderId}`;
            if (filters.buyer) url += `&buyer=${filters.buyer}`;
            if (filters.farmer) url += `&farmer=${filters.farmer}`;
            if (filters.delivery) url += `&delivery=${filters.delivery}`;
            if (filters.productName) url += `&productName=${filters.productName}`;
        }
        return this.http.get<IResponseWithObject>(url);
    }

    reportConflict(orderId: string, message: string): Observable<IResponse> {
        return this.http.post<IResponse>(
            GenerateUrlUtils.generateUrl(Endpoint.ORDER_REPORT_CONFLICT + orderId),
            { conflictMessage: message }
        );
    }

    resolveConflict(orderId: string): Observable<IResponse> {
        return this.http.put<IResponse>(
            GenerateUrlUtils.generateUrl(Endpoint.ORDER_RESOLVE_CONFLICT + orderId), {}
        );
    }
}
