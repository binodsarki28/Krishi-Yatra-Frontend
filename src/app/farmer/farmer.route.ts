import { Routes } from '@angular/router';
import { RegisterFarmerComponent } from './register-farmer/register-farmer';
import { FarmerDashboard } from './farmer-dashboard/farmer-dashboard';

export const FARMER_ROUTES: Routes = [
  {
    path: 'register',
    component: RegisterFarmerComponent,
    data: { breadcrumb: 'Register Farm' }
  },
  {
    path: 'dashboard',
    component: FarmerDashboard,
    data: { breadcrumb: 'Farmer Dashboard' }
  }
];
