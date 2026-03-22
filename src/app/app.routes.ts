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
    {
        path: 'stocks',
        loadComponent: () =>
            import('./stock/stock-list/stock-list').then((m) => m.StockListComponent),
        canActivate: [userGuard],
        data: { breadcrumb: 'Marketplace' }
    },
    {
        path: 'stock-detail/:slug',
        loadComponent: () =>
            import('./stock/stock-detail/stock-detail').then((m) => m.StockDetailComponent),
        canActivate: [userGuard],
        data: { breadcrumb: 'Stock Details' }
    },
    {
        path: 'order',
        loadChildren: () =>
            import('./order/order.route').then((o) => o.ORDER_ROUTES),
        canActivate: [authGuard, userGuard],
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

    // ── Admin Login ───────────────────────────────────────────────
    {
        path: 'admin-login',
        loadComponent: () =>
            import('./admin/login/login').then(
                (m) => m.AdminLoginComponent
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
