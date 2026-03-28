import { Component, inject, Inject, PLATFORM_ID } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { NavbarComponent } from './common/navbar/navbar';
import { FooterComponent } from './common/footer/footer';
import { GlobalToastComponent } from './common/global-toast/global-toast';
import { filter } from 'rxjs';
import { NavigationService } from './util/navigation.service';

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

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private navigationService: NavigationService
  ) {
    this.updateVisibility(this.router.url);
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const url = event.urlAfterRedirects || event.url;
      this.updateVisibility(url);

      if (isPlatformBrowser(this.platformId)) {
        const isDashboard = ['/farmer', '/buyer', '/delivery', '/admin'].some(d => url.startsWith(d));
        if (isDashboard) {
          this.navigationService.lastDashboardPath = url;
          // Push a dummy state so back button has something to pop
          if (!history.state || !history.state.isTrap) {
            history.pushState({ isTrap: true }, '', url);
          }
        } else if (this.navigationService.isExiting) {
          // User intentionally left the dashboard (e.g. Back to Profile)
          this.navigationService.lastDashboardPath = null;
          this.navigationService.isExiting = false;
        }
      }
    });

    // Trap the back button
    if (isPlatformBrowser(this.platformId)) {
      window.addEventListener('popstate', (event) => {
        const path = window.location.pathname;
        const isCurrentlyDashboard = ['/farmer', '/buyer', '/delivery', '/admin'].some(d => path.startsWith(d));
        
        // If they tried to leave a dashboard via back button (and weren't intentionally exiting)
        if (!isCurrentlyDashboard && this.navigationService.lastDashboardPath && !this.navigationService.isExiting) {
          // Force them back to the dashboard
          this.router.navigateByUrl(this.navigationService.lastDashboardPath);
          history.pushState({ isTrap: true }, '', this.navigationService.lastDashboardPath);
        } else if (isCurrentlyDashboard) {
           // If they are on a dashboard and hit back (trapped within dashboard), just re-push trap
           history.pushState({ isTrap: true }, '', window.location.href);
        }
      });
    }
  }

  private updateVisibility(url: string) {
    const isAdmin = url.includes('/admin');
    const isDashboard = isAdmin || ['/farmer', '/buyer', '/delivery'].some(path => url.startsWith(path));
    const isAuth = ['/account', '/register'].some(path => url.startsWith(path));

    // Basic visibility — hide navbar & footer on dashboards + auth pages
    this.showNavbar = !isDashboard && !isAuth;
    this.showFooter = !isDashboard && !isAuth;

    // Non-dashboard overrides: show navbar on stock/profile/order pages that are NOT inside dashboards
    if (!isDashboard && !isAuth && !isAdmin) {
      if (url.includes('/stocks') || url.includes('/stock-detail') || url.includes('/profile') || url.includes('/order')) {
        this.showNavbar = true;
        this.showFooter = false;
      }
    }
  }
}
