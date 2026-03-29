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
        path: '',
        component: DeliveryDashboard,
        canActivate: [deliveryGuard],
        children: [
            { path: 'dashboard', redirectTo: '', pathMatch: 'full' },
            {
                path: 'orders',
                children: [
                    { path: 'my-orders', loadComponent: () => import('../order/delivery-orders/delivery-orders').then(m => m.DeliveryOrdersComponent) }
                ]
            },
            {
                path: 'jobs',
                children: [
                    { path: 'available', loadComponent: () => import('./available-jobs/available-jobs').then(m => m.AvailableJobsComponent) },
                    { path: 'active', loadComponent: () => import('./active-jobs/active-jobs').then(m => m.ActiveJobsComponent) }
                ]
            },
            {
                path: 'track/:orderId',
                loadComponent: () => import('./delivery-tracking/delivery-tracking').then(m => m.DeliveryTracking),
                data: { breadcrumb: 'Delivery Tracking' }
            }
        ]
    }
];
