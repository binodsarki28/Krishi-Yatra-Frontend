import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-detail-buyer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detail-buyer.html',
  styleUrls: ['./detail-buyer.css']
})
export class DetailBuyerComponent {
  @Input() buyer: any;
  @Input() loading = false;

  @Output() onApprove = new EventEmitter<string>();
  @Output() onReject = new EventEmitter<string>();
  @Output() onBlockToggle = new EventEmitter<{ username: string, active: boolean }>();
}
