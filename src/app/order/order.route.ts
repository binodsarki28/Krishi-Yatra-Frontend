import { Routes } from '@angular/router';
import { CreateOrder } from './create-order/create-order';

export const ORDER_ROUTES: Routes = [
    {
        path: 'create/:slug',
        component: CreateOrder,
        data: { breadcrumb: 'Place Order' }
    }
];
