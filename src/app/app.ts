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
    this.updateVisibility(this.router.url);
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.updateVisibility(event.urlAfterRedirects || event.url);
    });
  }

  private updateVisibility(url: string) {
    const dashboardRoutes = ['/admin', '/farmer', '/buyer', '/delivery'];
    const authRoutes = ['/account', '/register'];
    
    const isDashboard = dashboardRoutes.some(path => url.startsWith(path));
    const isAuth = authRoutes.some(path => url.startsWith(path));

    this.showFooter = !isDashboard && !isAuth;
    this.showNavbar = !isDashboard && !isAuth;
    
    // Explicitly show navbar on marketplace and profile
    if (url.includes('/stocks') || url.includes('/stock-detail') || url.includes('/profile')) {
        this.showNavbar = true; 
        this.showFooter = false;
    }
  }
}
