import { Component } from '@angular/core';
import { OrderListComponent } from '../order-list/order-list';

@Component({
  selector: 'app-delivery-orders',
  standalone: true,
  imports: [OrderListComponent],
  template: '<app-order-list role="DELIVERY"></app-order-list>'
})
export class DeliveryOrdersComponent {}
