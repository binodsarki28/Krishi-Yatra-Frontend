import { Component, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './common/navbar/navbar';
import { FooterComponent } from './common/footer/footer';
import { GlobalToastComponent } from './common/global-toast/global-toast';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent, GlobalToastComponent, CommonModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent {
  title = 'KrishiYatra';
  showFooter = true;
  showNavbar = true;
  private router = inject(Router);

  constructor() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const url = event.urlAfterRedirects || event.url;
      const isAccount = url.includes('/account');
      const isAdmin = url.includes('/admin');
      const isProfile = url.includes('/profile');

      this.showFooter = !isAccount && !isAdmin && !isProfile;
      this.showNavbar = !isAccount && !isAdmin;
    });
  }
}
