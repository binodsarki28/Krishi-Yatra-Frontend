import { Routes } from '@angular/router';
import { RegisterBuyerComponent } from './register-buyer/register-buyer';
import { BuyerDashboard } from './buyer-dashboard/buyer-dashboard';

export const BUYER_ROUTES: Routes = [
    {
        path: 'register',
        component: RegisterBuyerComponent,
        data: { breadcrumb: 'Register as Buyer' }
    },
    {
        path: 'dashboard',
        component: BuyerDashboard,
        data: { breadcrumb: 'Buyer Dashboard' }
    }
];
