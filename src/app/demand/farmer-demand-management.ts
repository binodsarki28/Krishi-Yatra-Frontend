import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DemandListComponent } from './demand-list/demand-list';

@Component({
  selector: 'app-farmer-demand-management',
  standalone: true,
  imports: [CommonModule, DemandListComponent],
  template: `
    <div class="card p-4 surface-card border-round-xl border-1 border-200 shadow-1 fadein animation-duration-300">
        <h2 class="m-0 text-2xl font-bold text-900 flex align-items-center gap-2">
            <i class="pi pi-check-circle text-green-500"></i>
            Demand Management
        </h2>
        <h3 class="m-0 mt-1 mb-4 text-600 font-semibold uppercase text-xs tracking-wider">Fulfilled Demands</h3>
        
        <p class="text-500 mb-4 text-sm mt-3">Track and review the history of market requests that you have fulfilled.</p>

        <app-demand-list mode="fulfilled"></app-demand-list>
    </div>
  `
})
export class FarmerDemandManagementComponent {}
