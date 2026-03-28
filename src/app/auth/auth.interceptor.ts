import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const platformId = inject(PLATFORM_ID);
    const router = inject(Router);

    if (isPlatformBrowser(platformId)) {
        const token = localStorage.getItem('token');
        if (token) {
            const cloned = req.clone({
                setHeaders: {
                    Authorization: `Bearer ${token}`
                }
            });
            return next(cloned).pipe(
                tap({
                    error: (err: any) => {
                        // If server returns 401 or 403, token is likely expired
                        if (err instanceof HttpErrorResponse && (err.status === 401 || err.status === 403)) {
                            // Clear expired session data and redirect to login
                            localStorage.clear();
                            router.navigate(['/account/login']);
                        }
                    }
                })
            );
        }
    }

    return next(req);
};
