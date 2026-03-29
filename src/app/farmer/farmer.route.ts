import { Routes } from '@angular/router';
import { RegisterFarmerComponent } from './register-farmer/register-farmer';
import { FarmerDashboard } from './farmer-dashboard/farmer-dashboard';
import { STOCK_ROUTES } from '../stock/stock.route';
import { farmerGuard } from '../auth/auth.guard';

export const FARMER_ROUTES: Routes = [
  {
    path: 'register',
    component: RegisterFarmerComponent,
    data: { breadcrumb: 'Register Farm' }
  },
  {
    path: '',
    component: FarmerDashboard,
    canActivate: [farmerGuard],
    children: [
      {
        path: 'stocks',
        children: STOCK_ROUTES
      },
      {
        path: 'orders',
        children: [
          { path: 'my-orders', loadComponent: () => import('../order/farmer-orders/farmer-orders').then(m => m.FarmerOrdersComponent) },
          { 
            path: 'track/:orderId', 
            loadComponent: () => import('../order/buyer-tracking/buyer-tracking').then(m => m.BuyerTracking),
            data: { breadcrumb: 'Order Tracking' }
          }
        ]
      },
      {
        path: 'demands',
        loadComponent: () => import('../demand/farmer-demand-management').then(m => m.FarmerDemandManagementComponent)
      },
      // Redirect /farmer/dashboard to /farmer for the shell view
      { path: 'dashboard', redirectTo: '', pathMatch: 'full' }
    ]
  }
];
