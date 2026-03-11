import { Routes } from '@angular/router';
import { adminGuard, authGuard, publicGuard, userGuard } from './auth/auth.guard';

export const routes: Routes = [
    // ── Landing ───────────────────────────────────────────────────
    {
        path: '',
        loadComponent: () =>
            import('./components/landing/landing').then((l) => l.LandingComponent),
        canActivate: [userGuard],
    },

    // ── Account (login / register / verify-otp) ───────────────────
    {
        path: 'account',
        loadChildren: () =>
            import('./components/account/account.route').then(
                (a) => a.ACCOUNT_ROUTES
            ),
        canActivate: [publicGuard],
    },

    // ── Protected ─────────────────────────────────────────────────
    {
        path: 'profile',
        loadComponent: () =>
            import('./components/profile/profile').then((p) => p.ProfileComponent),
        canActivate: [authGuard, userGuard],
        data: { breadcrumb: 'Profile' },
    },
    {
        path: 'farmer',
        loadChildren: () =>
            import('./farmer/farmer.route').then((f) => f.FARMER_ROUTES),
        canActivate: [authGuard, userGuard],
    },
    {
        path: 'buyer',
        loadChildren: () =>
            import('./buyer/buyer.route').then((b) => b.BUYER_ROUTES),
        canActivate: [authGuard, userGuard],
    },
    {
        path: 'delivery',
        loadChildren: () =>
            import('./delivery/delivery.route').then((d) => d.DELIVERY_ROUTES),
        canActivate: [authGuard, userGuard],
    },
    {
        path: 'admin',
        loadChildren: () =>
            import('./admin/admin.route').then((a) => a.ADMIN_ROUTES),
        canActivate: [authGuard, adminGuard],
    },
    // ── Fallback ──────────────────────────────────────────────────
    {
        path: '**',
        redirectTo: '',
    },
];
