import { Routes } from '@angular/router';
import { RegisterDeliveryComponent } from './register-delivery/register-delivery';
import { DeliveryDashboard } from './delivery-dashboard/delivery-dashboard';
import { deliveryGuard } from '../auth/auth.guard';

export const DELIVERY_ROUTES: Routes = [
    {
        path: 'register',
        component: RegisterDeliveryComponent,
        data: { breadcrumb: 'Register as Delivery Partner' }
    },
    {
        path: 'dashboard',
        component: DeliveryDashboard,
        canActivate: [deliveryGuard],
        data: { breadcrumb: 'Delivery Dashboard' }
    },
    {
        path: 'track/:orderId',
        loadComponent: () => import('./delivery-tracking/delivery-tracking').then(m => m.DeliveryTracking),
        canActivate: [deliveryGuard],
        data: { breadcrumb: 'Delivery Tracking' }
    }
];
