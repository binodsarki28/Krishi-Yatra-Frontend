
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import {Ripple} from 'primeng/ripple';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, ButtonModule, DividerModule, Ripple],
  templateUrl: './footer.html',
  styleUrls: ['./footer.css']
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}
