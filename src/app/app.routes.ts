import { Routes } from '@angular/router';
import { authGuard, publicGuard } from './auth/auth.guard';

export const routes: Routes = [
    // ── Landing ───────────────────────────────────────────────────
    {
        path: '',
        loadComponent: () =>
            import('./components/landing/landing').then((l) => l.LandingComponent),
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
        canActivate: [authGuard],
        data: { breadcrumb: 'Profile' },
    },

    // ── Fallback ──────────────────────────────────────────────────
    {
        path: '**',
        redirectTo: '',
    },
];
