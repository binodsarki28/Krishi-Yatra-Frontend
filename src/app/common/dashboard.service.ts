import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Endpoint } from '../const/end_point';
import { GenerateUrlUtils } from '../util/generate-url.utils';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  constructor(private http: HttpClient) {}

  getFarmerDashboard(): Observable<any> {
    const url = GenerateUrlUtils.generateUrl('api/v1/farmer/dashboard');
    return this.http.get(url);
  }

  getBuyerDashboard(): Observable<any> {
    const url = GenerateUrlUtils.generateUrl('api/v1/buyer/dashboard');
    return this.http.get(url);
  }

  getDeliveryDashboard(): Observable<any> {
    const url = GenerateUrlUtils.generateUrl('api/v1/delivery/dashboard');
    return this.http.get(url);
  }

  getAdminDashboard(): Observable<any> {
    const url = GenerateUrlUtils.generateUrl('api/v1/admin/dashboard');
    return this.http.get(url);
  }
}
