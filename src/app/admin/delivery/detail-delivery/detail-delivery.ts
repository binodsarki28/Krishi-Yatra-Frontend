import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-detail-delivery',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detail-delivery.html',
  styleUrls: ['./detail-delivery.css']
})
export class DetailDeliveryComponent {
  @Input() delivery: any;
  @Input() loading = false;

  @Output() onApprove = new EventEmitter<string>();
  @Output() onReject = new EventEmitter<string>();
  @Output() onBlockToggle = new EventEmitter<{ username: string, active: boolean }>();
}
