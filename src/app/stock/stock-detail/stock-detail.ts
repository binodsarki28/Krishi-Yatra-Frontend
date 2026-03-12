import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { StockService } from '../stock.service';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-stock-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule, CardModule],
  template: `
    <div class="p-4" *ngIf="stock">
      <p-button label="Back to List" icon="pi pi-arrow-left" [routerLink]="['/farmer/stocks/my-stocks']" 
        severity="secondary" [outlined]="true" class="mb-4"></p-button>
      
      <p-card [header]="stock.stockName" [subheader]="stock.categoryName + ' > ' + stock.subCategoryName">
        <div class="grid mt-4">
          <div class="col-12 md:col-6">
            <div class="text-500 mb-1">Product</div>
            <div class="text-900 font-bold mb-4">{{stock.productName}}</div>
            
            <div class="text-500 mb-1">Price</div>
            <div class="text-2xl text-green-600 font-bold mb-4">Rs. {{stock.pricePerUnit}} / unit</div>
            
            <div class="text-500 mb-1">Available Quantity</div>
            <div class="text-900 font-medium mb-4">{{stock.quantity}} units</div>
          </div>
          <div class="col-12 md:col-6">
            <div class="text-500 mb-1">Description</div>
            <div class="text-700 line-height-3 mb-4">{{stock.description}}</div>
          </div>
        </div>
      </p-card>
    </div>
  `,
  styles: []
})
export class StockDetailComponent implements OnInit {
  stock: any;

  constructor(private route: ActivatedRoute, private stockService: StockService) {}

  ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (slug) {
      this.stockService.getStockDetails(slug).subscribe(res => {
        this.stock = res.response;
      });
    }
  }
}
