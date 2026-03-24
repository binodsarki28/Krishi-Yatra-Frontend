import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GenerateUrlUtils } from '../util/generate-url.utils';

import { Endpoint } from '../const/end_point';
import { IRegisterDeliveryRequest } from './IDelivery';
import { IResponse } from '../response/SuccessResponse';
import { AccountService } from '../components/account/account.service';

@Injectable({ providedIn: 'root' })
export class DeliveryAppService {

    constructor(
        private http: HttpClient,
        private accountService: AccountService
    ) { }

    private isVerifiedDelivery(): boolean {
        if (typeof this.accountService?.isRoleVerified !== 'function') return false;
        return this.accountService.isRoleVerified('DELIVERY');
    }

    registerDelivery(request: IRegisterDeliveryRequest): Observable<IResponse> {
        return this.http.post<IResponse>(GenerateUrlUtils.generateUrl(Endpoint.REGISTER_DELIVERY), request);
    }

    getPendingOrders(): Observable<IResponse> {
        if (!this.isVerifiedDelivery()) {
            return new Observable(obs => {
                obs.next({ response: [], status: 'OK' } as any);
                obs.complete();
            });
        }
        return this.http.get<IResponse>(GenerateUrlUtils.generateUrl(Endpoint.ORDER_PENDING));
    }

    acceptOrder(orderId: string): Observable<IResponse> {
        return this.http.post<IResponse>(GenerateUrlUtils.generateUrl(Endpoint.ORDER_ACCEPT + orderId), {});
    }

    getOrderDetails(orderId: string): Observable<IResponse> {
        return this.http.get<IResponse>(GenerateUrlUtils.generateUrl(Endpoint.ORDER_DETAILS + orderId));
    }

    updateCheckpoints(orderId: string, checkpoints: string): Observable<IResponse> {
        return this.http.post<IResponse>(GenerateUrlUtils.generateUrl(Endpoint.ORDER_UPDATE_CHECKPOINTS + orderId), { checkpoints });
    }

    markAsDelivered(orderId: string): Observable<IResponse> {
        return this.http.post<IResponse>(GenerateUrlUtils.generateUrl(Endpoint.ORDER_MARK_AS_DELIVERED + orderId), {});
    }

    markAsPickedUp(orderId: string): Observable<IResponse> {
        return this.http.post<IResponse>(GenerateUrlUtils.generateUrl(Endpoint.ORDER_PICKED_UP + orderId), {});
    }
}
