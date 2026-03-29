import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DemandListComponent } from './demand-list/demand-list';

@Component({
  selector: 'app-farmer-demand-management',
  standalone: true,
  imports: [CommonModule, DemandListComponent],
  template: `
    <div class="card p-4 surface-card border-round-xl border-1 border-200 shadow-1 fadein animation-duration-300">
        <h2 class="m-0 mb-4 text-xl font-bold text-900 flex align-items-center gap-2">
            <i class="pi pi-check-circle text-green-500"></i>
            Fulfilled Market Demands
        </h2>
        
        <p class="text-500 mb-4">View the history of market requests that you have successfully fulfilled.</p>

        <app-demand-list mode="fulfilled"></app-demand-list>
    </div>
  `
})
export class FarmerDemandManagementComponent {}
