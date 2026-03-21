import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  lastDashboardPath: string | null = null;
  isExiting: boolean = false;
}
