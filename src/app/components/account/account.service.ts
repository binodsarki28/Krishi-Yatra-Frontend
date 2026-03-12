import { HttpClient } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, finalize, Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

import { Endpoint } from '../../const/end_point';
import { GenerateUrlUtils } from '../../util/generate-url.utils';
import { IResponse, IResponseWithObject } from '../../response/SuccessResponse';
import {
    IUserCreateRequest,
    IUserLoginRequest,
    IOtpVerify,
    IOtpRequest,
} from './IAccount';

@Injectable({
    providedIn: 'root',
})
export class AccountService {
    private platformId = inject(PLATFORM_ID);
    private isLoggedInSubject = new BehaviorSubject<boolean>(this.getInitialLoginStatus());
    isLoggedIn$ = this.isLoggedInSubject.asObservable();

    constructor(private http: HttpClient) { }

    private getInitialLoginStatus(): boolean {
        if (isPlatformBrowser(this.platformId)) {
            return !!localStorage.getItem('token');
        }
        return false;
    }

    updateLoginStatus() {
        this.isLoggedInSubject.next(this.getInitialLoginStatus());
    }

    getUserEmail(): string {
        if (isPlatformBrowser(this.platformId)) {
            return localStorage.getItem('email') || '';
        }
        return '';
    }

    getFullName(): string {
        if (isPlatformBrowser(this.platformId)) {
            return localStorage.getItem('fullName') || '';
        }
        return '';
    }

    getUsername(): string {
        if (isPlatformBrowser(this.platformId)) {
            return localStorage.getItem('username') || '';
        }
        return '';
    }

    getRoles(): string[] {
        if (isPlatformBrowser(this.platformId)) {
            const roles = localStorage.getItem('roles');
            return roles ? JSON.parse(roles) : [];
        }
        return [];
    }

    getVerifiedRoles(): string[] {
        if (isPlatformBrowser(this.platformId)) {
            const roles = localStorage.getItem('verifiedRoles');
            return roles ? JSON.parse(roles) : [];
        }
        return [];
    }

    hasRole(role: string): boolean {
        return this.getRoles().includes(role);
    }

    isRoleVerified(role: string): boolean {
        // ADMIN is always verified
        if (role === 'ADMIN') return this.hasRole('ADMIN');
        return this.getVerifiedRoles().includes(role);
    }

    /**
     * POST /api/v1/user/login
     * Returns ServerResponse with JwtResponse as the response object.
     */
    login(request: IUserLoginRequest): Observable<IResponseWithObject> {
        const url: string = GenerateUrlUtils.generateUrl(Endpoint.LOGIN_USER);
        return this.http.post<IResponseWithObject>(url, request);
    }

    /**
     * POST /api/v1/user/register
     * Sends user registration data; backend sends OTP to the email.
     */
    register(request: IUserCreateRequest): Observable<IResponse> {
        const url: string = GenerateUrlUtils.generateUrl(Endpoint.CREATE_USER);
        return this.http.post<IResponse>(url, request);
    }

    /**
     * POST /api/v1/user/verify-otp
     * Verifies the OTP code sent to the user's email.
     */
    verifyOtp(request: IOtpVerify): Observable<IResponse> {
        const url: string = GenerateUrlUtils.generateUrl(Endpoint.VERIFY_OTP);
        return this.http.post<IResponse>(url, request);
    }

    /**
     * POST /api/v1/user/resend-otp
     * Requests a new OTP to be sent to the given email.
     */
    resendOtp(request: IOtpRequest): Observable<IResponse> {
        const url: string = GenerateUrlUtils.generateUrl(Endpoint.RESEND_OTP);
        return this.http.post<IResponse>(url, request);
    }

    /**
     * GET /api/v1/user/me
     * Fetches the latest user details including verified roles.
     */
    getCurrentUser(): Observable<IResponseWithObject> {
        const url: string = GenerateUrlUtils.generateUrl(Endpoint.GET_ME);
        return this.http.get<IResponseWithObject>(url);
    }

}
