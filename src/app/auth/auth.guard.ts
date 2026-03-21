import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { AccountService } from '../components/account/account.service';
import { ToastService } from '../util/toast.service';

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

/**
 * farmerGuard - Protects farmer-only routes. Checks for Farmer role and verification status.
 */
export const farmerGuard: CanActivateFn = () => {
    const router = inject(Router);
    const toast = inject(ToastService);
    const account = inject(AccountService);
    const platformId = inject(PLATFORM_ID);

    if (!isPlatformBrowser(platformId)) return true;

    if (!account.hasRole('FARMER')) {
        router.navigate(['/farmer/register']);
        return false;
    }

    if (!account.isRoleVerified('FARMER')) {
        const msg = account.getStatusMessage('FARMER') || 'Your Farmer account is under verification.';
        toast.warningResponse(msg);
        router.navigate(['/profile']);
        return false;
    }

    return true;
};

/**
 * buyerGuard - Protects buyer-only routes. Checks for Buyer role and verification status.
 */
export const buyerGuard: CanActivateFn = () => {
    const router = inject(Router);
    const toast = inject(ToastService);
    const account = inject(AccountService);
    const platformId = inject(PLATFORM_ID);

    if (!isPlatformBrowser(platformId)) return true;

    if (!account.hasRole('BUYER')) {
        router.navigate(['/buyer/register']);
        return false;
    }

    if (!account.isRoleVerified('BUYER')) {
        const msg = account.getStatusMessage('BUYER') || 'Your Buyer account is under verification.';
        toast.warningResponse(msg);
        router.navigate(['/profile']);
        return false;
    }

    return true;
};

/**
 * deliveryGuard - Protects delivery partner routes. Checks for Delivery role and verification status.
 */
export const deliveryGuard: CanActivateFn = () => {
    const router = inject(Router);
    const toast = inject(ToastService);
    const account = inject(AccountService);
    const platformId = inject(PLATFORM_ID);

    if (!isPlatformBrowser(platformId)) return true;

    if (!account.hasRole('DELIVERY')) {
        router.navigate(['/delivery/register']);
        return false;
    }

    if (!account.isRoleVerified('DELIVERY')) {
        const msg = account.getStatusMessage('DELIVERY') || 'Your Linker account is under verification.';
        toast.warningResponse(msg);
        router.navigate(['/profile']);
        return false;
    }

    return true;
};
