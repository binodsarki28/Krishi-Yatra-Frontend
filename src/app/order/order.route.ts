import { Routes } from '@angular/router';
import { CreateOrder } from './create-order/create-order';

export const ORDER_ROUTES: Routes = [
    {
        path: 'create/:slug',
        component: CreateOrder,
        data: { breadcrumb: 'Place Order' }
    },
    {
        path: 'track/:orderId',
        loadComponent: () => import('./buyer-tracking/buyer-tracking').then(m => m.BuyerTracking),
        data: { breadcrumb: 'Tracking' }
    },
    {
        path: 'detail/:orderId',
        loadComponent: () => import('./order-detail/order-detail').then(m => m.OrderDetailComponent),
        data: { breadcrumb: 'Order Details' }
    }
];
