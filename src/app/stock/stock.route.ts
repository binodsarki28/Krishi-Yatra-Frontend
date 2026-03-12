import { Routes } from '@angular/router';
import { OwnStockListComponent } from './own-stock-list/own-stock-list';
import { CreateStockComponent } from './create-stock/create-stock';
import { UpdateStockComponent } from './update-stock/update-stock';
import { StockDetailComponent } from './stock-detail/stock-detail';

export const STOCK_ROUTES: Routes = [
  {
    path: 'my-stocks',
    component: OwnStockListComponent,
    data: { breadcrumb: 'My Stocks' }
  },
  {
    path: 'create',
    component: CreateStockComponent,
    data: { breadcrumb: 'Add Stock' }
  },
  {
    path: 'update/:slug',
    component: UpdateStockComponent,
    data: { breadcrumb: 'Update Stock' }
  },
  {
    path: 'details/:slug',
    component: StockDetailComponent,
    data: { breadcrumb: 'Stock Details' }
  }
];
