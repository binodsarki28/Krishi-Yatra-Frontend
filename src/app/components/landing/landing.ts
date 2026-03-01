
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './landing.html',
  styleUrls: ['./landing.css']
})
export class LandingComponent {
  constructor(private router: Router) { }

  navigateToRegister() {
    this.router.navigate(['/account/register']);
  }

  navigateToLogin() {
    this.router.navigate(['/account/login']);
  }
}
