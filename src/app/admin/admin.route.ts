import { Routes } from '@angular/router';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard';
import { ListFarmerComponent } from './farmer/list-farmer/list-farmer';
import { ListBuyerComponent } from './buyer/list-buyer/list-buyer';
import { ListDeliveryComponent } from './delivery/list-delivery/list-delivery';
import { ListStockComponent } from './stock/list-stock/list-stock';
import { Order } from './order/order';

export const ADMIN_ROUTES: Routes = [
    {
        path: '',
        component: AdminDashboardComponent,
        children: [
            { path: 'farmers', component: ListFarmerComponent },
            { path: 'buyers', component: ListBuyerComponent },
            { path: 'delivery', component: ListDeliveryComponent },
            { path: 'stocks', component: ListStockComponent },
            { path: 'orders', component: Order },
            { 
                path: 'orders/detail/:orderId', 
                loadComponent: () => import('../order/order-detail/order-detail').then(m => m.OrderDetailComponent) 
            },
            // Legacy redirects
            { path: 'verify-farmer', redirectTo: 'farmers', pathMatch: 'full' },
            { path: 'all-farmers', redirectTo: 'farmers', pathMatch: 'full' },
            { path: 'verify-buyer', redirectTo: 'buyers', pathMatch: 'full' },
            { path: 'all-buyers', redirectTo: 'buyers', pathMatch: 'full' },
            { path: 'verify-delivery', redirectTo: 'delivery', pathMatch: 'full' },
            { path: 'all-delivery', redirectTo: 'delivery', pathMatch: 'full' },
        ]
    }
];

