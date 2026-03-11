import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

/**
 * authGuard — Protects routes that require authentication.
 * Redirects to /account/login if no JWT token found.
 * SSR-safe: checks isPlatformBrowser before accessing localStorage.
 */
export const authGuard: CanActivateFn = () => {
    const router = inject(Router);
    const platformId = inject(PLATFORM_ID);

    // On the server (SSR), localStorage doesn't exist — allow through,
    // the client-side guard will handle the actual redirect.
    if (!isPlatformBrowser(platformId)) {
        return true;
    }

    const token = localStorage.getItem('token');

    if (token) {
        return true;
    }

    router.navigate(['/account/login']);
    return false;
};

/**
 * publicGuard — Protects public-only routes (login, register, landing).
 * Redirects to /profile if user is already logged in.
 * SSR-safe: checks isPlatformBrowser before accessing localStorage.
 */
export const publicGuard: CanActivateFn = () => {
    const router = inject(Router);
    const platformId = inject(PLATFORM_ID);

    // On the server (SSR), allow through — client will re-evaluate.
    if (!isPlatformBrowser(platformId)) {
        return true;
    }

    const token = localStorage.getItem('token');

    if (!token) {
        return true;
    }

    router.navigate(['/profile']);
    return false;
};

/**
 * adminGuard — Protects routes that require ADMIN role.
 * Redirects to /profile if user is not an admin.
 */
export const adminGuard: CanActivateFn = () => {
    const router = inject(Router);
    const platformId = inject(PLATFORM_ID);

    if (!isPlatformBrowser(platformId)) return true;

    const roles = localStorage.getItem('roles');
    if (roles && JSON.parse(roles).includes('ADMIN')) {
        return true;
    }

    router.navigate(['/profile']);
    return false;
};

/**
 * userGuard — Protects non-admin routes.
 * Redirects to /admin if user is an admin.
 */
export const userGuard: CanActivateFn = () => {
    const router = inject(Router);
    const platformId = inject(PLATFORM_ID);

    if (!isPlatformBrowser(platformId)) return true;

    const roles = localStorage.getItem('roles');
    if (roles && JSON.parse(roles).includes('ADMIN')) {
        router.navigate(['/admin']);
        return false;
    }

    return true;
};
