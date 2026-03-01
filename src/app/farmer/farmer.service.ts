import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GenerateUrlUtils } from '../util/generate-url.utils';

import { Endpoint } from '../const/end_point';
import { IRegisterFarmerRequest } from './IFarmer';
import { IResponse } from '../response/SuccessResponse';

@Injectable({ providedIn: 'root' })
export class FarmerAppService {

    constructor(private http: HttpClient) { }

    registerFarmer(request: IRegisterFarmerRequest): Observable<IResponse> {
        return this.http.post<IResponse>(GenerateUrlUtils.generateUrl(Endpoint.REGISTER_FARMER), request);
    }
}
