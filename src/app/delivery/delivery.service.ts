import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GenerateUrlUtils } from '../util/generate-url.utils';

import { Endpoint } from '../const/end_point';
import { IRegisterDeliveryRequest } from './IDelivery';
import { IResponse } from '../response/SuccessResponse';

@Injectable({ providedIn: 'root' })
export class DeliveryAppService {

    constructor(private http: HttpClient) { }

    registerDelivery(request: IRegisterDeliveryRequest): Observable<IResponse> {
        return this.http.post<IResponse>(GenerateUrlUtils.generateUrl(Endpoint.REGISTER_DELIVERY), request);
    }
}
