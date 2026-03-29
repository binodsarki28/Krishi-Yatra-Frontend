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
        path: '',
        component: BuyerDashboard,
        canActivate: [buyerGuard],
        children: [
            { path: 'dashboard', redirectTo: '', pathMatch: 'full' },
            {
                path: 'orders',
                children: [
                    { path: 'my-orders', loadComponent: () => import('../order/buyer-orders/buyer-orders').then(m => m.BuyerOrdersComponent) },
                    { path: 'track/:orderId', loadComponent: () => import('../order/buyer-tracking/buyer-tracking').then(m => m.BuyerTracking) }
                ]
            }
        ]
    }
];
