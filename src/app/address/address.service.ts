import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GenerateUrlUtils } from '../util/generate-url.utils';
import { Endpoint } from '../const/end_point';
import { IResponse, IResponseWithObject } from '../response/SuccessResponse';
import { IAddressRequest } from './IAddress';

@Injectable({ providedIn: 'root' })
export class AddressService {

    constructor(private http: HttpClient) {}

    saveAddress(request: IAddressRequest): Observable<IResponse> {
        return this.http.post<IResponse>(
            GenerateUrlUtils.generateUrl(Endpoint.ADDRESS_SAVE), request
        );
    }

    getMyAddress(): Observable<IResponseWithObject> {
        return this.http.get<IResponseWithObject>(
            GenerateUrlUtils.generateUrl(Endpoint.ADDRESS_ME)
        );
    }
}
