import { Routes } from '@angular/router';
import { RegisterFarmerComponent } from './register-farmer/register-farmer';
import { FarmerDashboard } from './farmer-dashboard/farmer-dashboard';
import { STOCK_ROUTES } from '../stock/stock.route';

export const FARMER_ROUTES: Routes = [
  {
    path: 'register',
    component: RegisterFarmerComponent,
    data: { breadcrumb: 'Register Farm' }
  },
  {
    path: '',
    component: FarmerDashboard,
    children: [
      {
        path: 'stocks',
        children: STOCK_ROUTES
      },
      // Redirect /farmer/dashboard to /farmer for the shell view
      { path: 'dashboard', redirectTo: '', pathMatch: 'full' }
    ]
  }
];
