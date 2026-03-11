import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GenerateUrlUtils } from '../util/generate-url.utils';

export interface IAdminStats {
    pendingFarmers: number;
    pendingBuyers: number;
    pendingDelivery: number;
}

@Injectable({ providedIn: 'root' })
export class AdminAppService {
    constructor(private http: HttpClient) { }

    getStats(): Observable<IAdminStats> {
        return this.http.get<IAdminStats>(GenerateUrlUtils.generateUrl('api/v1/admin/stats'));
    }
}
