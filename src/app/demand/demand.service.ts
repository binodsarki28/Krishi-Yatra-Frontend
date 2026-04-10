import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GenerateUrlUtils } from '../util/generate-url.utils';
import { Endpoint } from '../const/end_point';
import { IResponse, IResponseWithObject } from '../response/SuccessResponse';
import { IDemandCreateRequest } from './IDemand';

@Injectable({ providedIn: 'root' })
export class DemandService {
    constructor(private http: HttpClient) {}

    createDemand(request: IDemandCreateRequest): Observable<IResponse> {
        return this.http.post<IResponse>(
            GenerateUrlUtils.generateUrl(Endpoint.DEMAND_CREATE),
            request
        );
    }

    getDemands(page = 0, size = 3, filters: any = {}): Observable<IResponseWithObject> {
        let url = GenerateUrlUtils.generateUrl(Endpoint.DEMAND_LIST) + `?page=${page}&size=${size}`;
        if (filters.categoryId) url += `&categoryId=${filters.categoryId}`;
        if (filters.subCategoryId) url += `&subCategoryId=${filters.subCategoryId}`;
        if (filters.status) url += `&status=${filters.status}`;
        return this.http.get<IResponseWithObject>(url);
    }

    getMyDemands(page = 0, size = 3): Observable<IResponseWithObject> {
        const url = GenerateUrlUtils.generateUrl(Endpoint.DEMAND_MY) + `?page=${page}&size=${size}`;
        return this.http.get<IResponseWithObject>(url);
    }

    getFulfilledDemands(page = 0, size = 3): Observable<IResponseWithObject> {
        const url = GenerateUrlUtils.generateUrl(Endpoint.DEMAND_FULFILLED) + `?page=${page}&size=${size}`;
        return this.http.get<IResponseWithObject>(url);
    }

    cancelDemand(demandId: string): Observable<IResponse> {
        return this.http.post<IResponse>(
            GenerateUrlUtils.generateUrl(Endpoint.DEMAND_CANCEL + demandId),
            {}
        );
    }

    acceptDemand(demandId: string): Observable<IResponse> {
        return this.http.post<IResponse>(
            GenerateUrlUtils.generateUrl(Endpoint.DEMAND_ACCEPT + demandId),
            {}
        );
    }
}
