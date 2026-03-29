import { Component } from '@angular/core';
import { OrderListComponent } from '../order-list/order-list';

@Component({
  selector: 'app-buyer-orders',
  standalone: true,
  imports: [OrderListComponent],
  template: '<app-order-list role="BUYER"></app-order-list>'
})
export class BuyerOrdersComponent {}
