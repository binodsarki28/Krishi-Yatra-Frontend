import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GenerateUrlUtils } from '../util/generate-url.utils';

import { Endpoint } from '../const/end_point';
import { IRegisterBuyerRequest } from './IBuyer';
import { IResponse } from '../response/SuccessResponse';

@Injectable({ providedIn: 'root' })
export class BuyerAppService {

    constructor(private http: HttpClient) { }

    registerBuyer(request: IRegisterBuyerRequest): Observable<IResponse> {
        return this.http.post<IResponse>(GenerateUrlUtils.generateUrl(Endpoint.REGISTER_BUYER), request);
    }
}
