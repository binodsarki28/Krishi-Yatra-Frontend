import { Routes } from '@angular/router';
import { RegisterBuyerComponent } from './register-buyer/register-buyer';
import { BuyerDashboard } from './buyer-dashboard/buyer-dashboard';
import { buyerGuard } from '../auth/auth.guard';

export const BUYER_ROUTES: Routes = [
    {
        path: 'register',
        component: RegisterBuyerComponent,
        data: { breadcrumb: 'Register as Buyer' }
    },
    {
        path: 'dashboard',
        component: BuyerDashboard,
        canActivate: [buyerGuard],
        data: { breadcrumb: 'Buyer Dashboard' }
    }
];
