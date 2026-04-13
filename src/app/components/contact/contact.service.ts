import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IResponseWithObject } from '../../response/SuccessResponse';
import { Endpoint } from '../../const/end_point';
import { GenerateUrlUtils } from '../../util/generate-url.utils';

@Injectable({
  providedIn: 'root'
})
export class ContactService {

  constructor(private http: HttpClient) { }

  sendMessage(contactData: any): Observable<IResponseWithObject> {
    const url = GenerateUrlUtils.generateUrl(Endpoint.CONTACT_SEND);
    return this.http.post<IResponseWithObject>(url, contactData);
  }
}
