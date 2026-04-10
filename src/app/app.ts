import { Component, inject, Inject, PLATFORM_ID } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { NavbarComponent } from './common/navbar/navbar';
import { FooterComponent } from './common/footer/footer';
import { GlobalToastComponent } from './common/global-toast/global-toast';
import { filter } from 'rxjs';
import { NavigationService } from './util/navigation.service';
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { firebaseConfig } from './util/firebase.config';
import { NotificationService } from './components/notification/notification.service';
import { AccountService } from './components/account/account.service';

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
    private navigationService: NavigationService,
    private notificationService: NotificationService,
    private accountService: AccountService
  ) {
    this.updateVisibility(this.router.url);
    
    // Initialize Firebase once if already logged in, otherwise wait for login event
    if (this.accountService.getUsername()) {
        this.initializeFirebase();
    }

    this.accountService.isLoggedIn$.subscribe((loggedIn: boolean) => {
        if (loggedIn) {
            this.initializeFirebase();
        }
    });

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
      if (
        url.includes('/stocks') || 
        url.includes('/stock-detail') || 
        url.includes('/profile') || 
        url.includes('/order') || 
        url.includes('/demands') ||
        url.includes('/notifications')
      ) {
        this.showNavbar = true;
        this.showFooter = false;
      }
    }
  }

  private initializeFirebase() {
    if (isPlatformBrowser(this.platformId)) {
      try {
        const app = initializeApp(firebaseConfig);
        const messaging = getMessaging(app);

        getToken(messaging, { vapidKey: firebaseConfig.vapidKey })
          .then((currentToken) => {
            if (currentToken) {
              console.log('FCM Token received:', currentToken);
              const username = this.accountService.getUsername();
              this.notificationService.saveFcmToken(username, currentToken, navigator.userAgent).subscribe({
                next: () => console.log('FCM Token saved to backend'),
                error: (err) => console.error('Error saving FCM Token:', err)
              });
            } else {
              console.warn('No registration token available. Request permission to generate one.');
            }
          })
          .catch((err) => {
             // Silently fail if VAPID key is placeholder or user denies permission
             console.log('Firebase registration skipped or failed:', err.message);
          });

        onMessage(messaging, (payload) => {
          console.log('Foreground message received:', payload);
          // You could trigger a toast here if needed
        });
      } catch (e) {
        console.error('Firebase initialization error:', e);
      }
    }
  }
}
