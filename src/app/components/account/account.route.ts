import { Routes } from '@angular/router';

export const ACCOUNT_ROUTES: Routes = [
    {
        path: 'login',
        loadComponent: () =>
            import('./login/login').then((c) => c.LoginComponent),
        data: { breadcrumb: 'Login' },
    },
    {
        path: 'register',
        loadComponent: () =>
            import('./register/register').then((c) => c.RegisterComponent),
        data: { breadcrumb: 'Register' },
    },
    {
        path: 'verify-otp',
        loadComponent: () =>
            import('./verify-otp/verify-otp').then((c) => c.VerifyOtpComponent),
        data: { breadcrumb: 'Verify OTP' },
    },
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
    },
];
