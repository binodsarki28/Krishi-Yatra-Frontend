import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GenerateUrlUtils } from '../util/generate-url.utils';
import { Endpoint } from '../const/end_point';
import { IResponse, IResponseWithObject } from '../response/SuccessResponse';

@Injectable({
  providedIn: 'root'
})
export class StockService {

  constructor(private http: HttpClient) {}

  createStock(stockData: any): Observable<IResponse> {
    return this.http.post<IResponse>(GenerateUrlUtils.generateUrl(Endpoint.STOCK_CREATE), stockData);
  }

  updateStock(stockData: any): Observable<IResponse> {
    return this.http.put<IResponse>(GenerateUrlUtils.generateUrl(Endpoint.STOCK_UPDATE), stockData);
  }

  deleteOrUndeleteStock(slug: string): Observable<IResponse> {
    return this.http.put<IResponse>(GenerateUrlUtils.generateUrl(Endpoint.STOCK_DELETE_OR_UNDELETE + slug), {});
  }

  getStockDetails(slug: string): Observable<IResponseWithObject> {
    return this.http.get<IResponseWithObject>(GenerateUrlUtils.generateUrl(Endpoint.STOCK_DETAILS + slug));
  }

  getStockList(filters?: any): Observable<any> {
    let url = Endpoint.STOCK_LIST + '?';
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null) {
          url += `${key}=${encodeURIComponent(filters[key])}&`;
        }
      });
    }
    return this.http.get<any>(GenerateUrlUtils.generateUrl(url));
  }

  getFarmerStocks(): Observable<IResponseWithObject> {
    return this.http.get<IResponseWithObject>(GenerateUrlUtils.generateUrl(Endpoint.MY_STOCKS));
  }

  getCategories(): Observable<IResponseWithObject> {
    return this.http.get<IResponseWithObject>(GenerateUrlUtils.generateUrl(Endpoint.CATEGORIES));
  }

  getSubCategories(categoryId?: string): Observable<IResponseWithObject> {
    let url = Endpoint.SUB_CATEGORIES;
    if (categoryId) {
      url += `?categoryId=${categoryId}`;
    }
    return this.http.get<IResponseWithObject>(GenerateUrlUtils.generateUrl(url));
  }

  adjustStockQuantity(slug: string, amount: number): Observable<IResponse> {
    const url = GenerateUrlUtils.generateUrl(Endpoint.STOCK_ADJUST);
    return this.http.put<IResponse>(url, null, { params: { slug, amount: amount.toString() } });
  }
}
