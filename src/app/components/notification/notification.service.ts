import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Endpoint } from '../../const/end_point';
import { GenerateUrlUtils } from '../../util/generate-url.utils';
import { IResponseWithObject, IResponse } from '../../response/SuccessResponse';

export interface INotification {
  id: number;
  title: string;
  body: string;
  category: string;
  read: boolean;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private unreadCountSubject = new BehaviorSubject<number>(0);
  unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient) { }

  updateUnreadCount(count: number) {
    this.unreadCountSubject.next(count);
  }

  getNotifications(page: number = 0, size: number = 10): Observable<IResponseWithObject> {
    const url = GenerateUrlUtils.generateUrl(Endpoint.NOTIFICATION_LIST + `?page=${page}&size=${size}`);
    return this.http.get<IResponseWithObject>(url);
  }

  getUnreadCount(): Observable<IResponseWithObject> {
    const url = GenerateUrlUtils.generateUrl(Endpoint.NOTIFICATION_UNREAD_COUNT);
    return this.http.get<IResponseWithObject>(url).pipe(
      tap(res => {
        const count = (res.response as unknown as number) || 0;
        this.unreadCountSubject.next(count);
      })
    );
  }

  markAsRead(id: number): Observable<IResponse> {
    const url = GenerateUrlUtils.generateUrl(Endpoint.NOTIFICATION_READ + id + '/read');
    return this.http.post<IResponse>(url, {}).pipe(
      tap(() => this.getUnreadCount().subscribe())
    );
  }

  markAllAsRead(): Observable<IResponse> {
    const url = GenerateUrlUtils.generateUrl(Endpoint.NOTIFICATION_READ + 'read-all');
    return this.http.post<IResponse>(url, {}).pipe(
      tap(() => this.unreadCountSubject.next(0))
    );
  }

  deleteNotification(id: number): Observable<IResponse> {
    const url = GenerateUrlUtils.generateUrl(Endpoint.NOTIFICATION_READ + id);
    return this.http.delete<IResponse>(url);
  }

  saveFcmToken(fcmToken: string, deviceName: string): Observable<IResponse> {
    const url = GenerateUrlUtils.generateUrl(Endpoint.NOTIFICATION_FCM_TOKEN);
    return this.http.post<IResponse>(url, { fcmToken, deviceName });
  }
}
