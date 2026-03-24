import { Component } from '@angular/core';
import { OrderListComponent } from '../order-list/order-list';

@Component({
  selector: 'app-farmer-orders',
  standalone: true,
  imports: [OrderListComponent],
  template: '<app-order-list role="FARMER"></app-order-list>'
})
export class FarmerOrdersComponent {}
