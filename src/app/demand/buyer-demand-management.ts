import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DemandFormComponent } from './demand-form/demand-form';
import { DemandListComponent } from './demand-list/demand-list';

@Component({
  selector: 'app-buyer-demand-management',
  standalone: true,
  imports: [CommonModule, DemandFormComponent, DemandListComponent],
  template: `
    <div class="grid p-fluid">
        <div class="col-12 lg:col-5">
            <app-demand-form (demandCreated)="list.loadDemands(true)"></app-demand-form>
        </div>
        <div class="col-12 lg:col-7">
            <app-demand-list mode="my" #list></app-demand-list>
        </div>
    </div>
  `
})
export class BuyerDemandManagementComponent {
  @ViewChild('list') list!: DemandListComponent;
}
