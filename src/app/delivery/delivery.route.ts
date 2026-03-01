import { Routes } from '@angular/router';
import { RegisterDeliveryComponent } from './register-delivery/register-delivery';
import { DeliveryDashboard } from './delivery-dashboard/delivery-dashboard';

export const DELIVERY_ROUTES: Routes = [
    {
        path: 'register',
        component: RegisterDeliveryComponent,
        data: { breadcrumb: 'Register as Delivery Partner' }
    },
    {
        path: 'dashboard',
        component: DeliveryDashboard,
        data: { breadcrumb: 'Delivery Dashboard' }
    }
];
