import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface ToastMessage {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private toastSubject = new BehaviorSubject<ToastMessage | null>(null);
  toast$ = this.toastSubject.asObservable();
  private errorToastShown = false;
  private platformId = inject(PLATFORM_ID);

  successResponse(response: any): void {
    this.showToast('success', response?.message || 'Success!');
  }

  errorResponse(err: any): void {
    console.error('API Error:', err);
    if (this.errorToastShown) return;
    this.errorToastShown = true;

    let message = 'Connection error!';
    const isHttpError = err instanceof HttpErrorResponse;
    const status = isHttpError ? err.status : null;

    if (status === 0) {
      if (isPlatformBrowser(this.platformId) && (window as any).performance.navigation.type === 1) {
          // If this is a page reload, maybe ignore status 0 errors as they might be cancelled requests
          this.errorToastShown = false;
          return;
      }
      message = 'Server unreachable!';
    }
    else if (status === 401) {
      if (!isPlatformBrowser(this.platformId)) {
        return; // Skip SSR toast
      }
      const isLoggedIn = !!localStorage.getItem('token');
      if (!isLoggedIn) {
        message = err.error?.message || 'Invalid username or password!';
      } else {
        message = 'You have been logged out. Please log in again.';
      }
    }
    else if (isHttpError && (status === 400 || status === 409)) {
      message = err.error?.message || 'Invalid input or record already exists!';
    }
    else if (isHttpError && err.error?.message === 'Validation Failed' && err.error?.response) {
      message = Object.values(err.error.response)[0] as string;
    }
    else if (isHttpError && err.error?.message) {
      message = err.error.message;
    }
    else if (!isHttpError && err.message?.includes('Authentication required')) {
      this.errorToastShown = false;
      return;
    }

    this.showToast('error', message);
    setTimeout(() => (this.errorToastShown = false), 2000);
  }

  warningResponse(msg: string): void {
    this.showToast('warning', msg || 'Warning!');
  }

  generalResponse(severity: ToastMessage['type'], summary: string, detail: string): void {
    const message = summary ? `${summary}: ${detail}` : detail;
    this.showToast(severity, message);
  }

  clear(): void {
    this.toastSubject.next(null);
  }

  private showToast(type: ToastMessage['type'], message: string): void {
    this.toastSubject.next({ type, message });
    // Timing is now handled 100% by GlobalToastComponent to avoid conflicts
  }
}
