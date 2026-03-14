
import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { MenubarModule } from 'primeng/menubar';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AccountService } from '../../components/account/account.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, MenubarModule, ButtonModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class NavbarComponent implements OnInit {
  items: MenuItem[] | undefined;
  isLoggedIn: boolean = false;
  private platformId = inject(PLATFORM_ID);

  constructor(
    private router: Router,
    private accountService: AccountService
  ) { }

  ngOnInit() {
    this.accountService.isLoggedIn$.subscribe((status: boolean) => {
      this.isLoggedIn = status;
    });

    this.items = [
      {
        label: 'Home',
        icon: 'pi pi-home',
        command: () => this.router.navigate(['/'])
      },
      {
        label: 'Stocks',
        icon: 'pi pi-list',
        command: () => this.router.navigate(['/stocks'])
      },
      {
        label: 'Features',
        icon: 'pi pi-star'
      },
      {
        label: 'Services',
        icon: 'pi pi-cog'
      },
      {
        label: 'Contact',
        icon: 'pi pi-envelope'
      }
    ];
  }

  navigateToLogin() {
    this.router.navigate(['/account/login']);
  }

  navigateToRegister() {
    this.router.navigate(['/account/register']);
  }

  navigateToHome() {
    this.router.navigate(['/']);
  }

  navigateToProfile() {
    this.router.navigate(['/profile']);
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      localStorage.removeItem('roles');
    }
    this.accountService.updateLoginStatus();
    this.router.navigate(['/account/login']);
  }
}
