import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { StockService } from '../stock.service';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-stock-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule, CardModule, TagModule, TooltipModule, ProgressSpinnerModule],
  templateUrl: './stock-detail.html',
  styleUrls: ['./stock-detail.css']
})
export class StockDetailComponent implements OnInit {
  stock: any;

  constructor(
    private route: ActivatedRoute, 
    private stockService: StockService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (slug) {
      this.stockService.getStockDetails(slug).subscribe(res => {
        this.stock = res.response;
        this.cdr.markForCheck();
      });
    }
  }
}
