import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-detail-farmer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detail-farmer.html',
  styleUrls: ['./detail-farmer.css']
})
export class DetailFarmerComponent {
  @Input() farmer: any;
  @Input() loading = false;

  @Output() onApprove = new EventEmitter<string>();
  @Output() onReject = new EventEmitter<string>();
  @Output() onBlockToggle = new EventEmitter<{ username: string, active: boolean }>();
}
