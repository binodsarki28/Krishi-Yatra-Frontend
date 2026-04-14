import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { StockService } from '../stock.service';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ChangeDetectorRef } from '@angular/core';
import { GenerateUrlUtils } from '../../util/generate-url.utils';

import { AccountService } from '../../components/account/account.service';

@Component({
  selector: 'app-stock-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule, CardModule, TagModule, TooltipModule, ProgressSpinnerModule, NgOptimizedImage],
  templateUrl: './stock-detail.html',
  styleUrls: ['./stock-detail.css']
})
export class StockDetailComponent implements OnInit, OnDestroy {
  stock: any;
  images: any[] = [];
  activeIndex: number = 0;
  currentUserUsername: string = '';
  private autoSlideTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private readonly autoSlideMs = 2000;
  private readonly fallbackImage = 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?q=80&w=800';

  constructor(
    private route: ActivatedRoute, 
    private stockService: StockService,
    private accountService: AccountService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.currentUserUsername = this.accountService.getUsername();
    const slug = this.route.snapshot.paramMap.get('slug');
    if (slug) {
      this.stockService.getStockDetails(slug).subscribe({
        next: (res: any) => {
          this.stock = res.response;
          const normalizedUrls = this.normalizeStockImages(this.stock?.stockImages);
          this.images = normalizedUrls.length > 0
            ? normalizedUrls.map((url: string) => ({
                itemImageSrc: this.resolveImageUrl(url),
                thumbnailImageSrc: this.resolveImageUrl(url),
                alt: this.stock?.productName || 'Stock Product',
                title: this.stock?.stockName || 'Stock'
              }))
            : [{
                itemImageSrc: this.fallbackImage,
                thumbnailImageSrc: this.fallbackImage,
                alt: 'Default Product',
                title: 'Stock'
              }];

          this.activeIndex = 0;
          this.startAutoSlide();
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Failed to load stock data:', err);
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.stopAutoSlide();
  }

  onManualNavigate(): void {
    this.resetAutoSlideIfNeeded();
  }

  nextImage(): void {
    if (this.images.length <= 1) {
      return;
    }
    this.activeIndex = (this.activeIndex + 1) % this.images.length;
    this.onManualNavigate();
    this.cdr.detectChanges();
  }

  prevImage(): void {
    if (this.images.length <= 1) {
      return;
    }
    this.activeIndex = (this.activeIndex - 1 + this.images.length) % this.images.length;
    this.onManualNavigate();
    this.cdr.detectChanges();
  }

  selectImage(index: number): void {
    if (index < 0 || index >= this.images.length) {
      return;
    }
    this.activeIndex = index;
    this.onManualNavigate();
    this.cdr.detectChanges();
  }

  private startAutoSlide(): void {
    this.stopAutoSlide();
    if (this.images.length <= 1) {
      return;
    }
    this.scheduleNextSlide();
  }

  private stopAutoSlide(): void {
    if (this.autoSlideTimeoutId) {
      clearTimeout(this.autoSlideTimeoutId);
      this.autoSlideTimeoutId = null;
    }
  }

  private scheduleNextSlide(): void {
    this.autoSlideTimeoutId = setTimeout(() => {
      if (this.images.length > 1) {
        this.activeIndex = (this.activeIndex + 1) % this.images.length;
        this.cdr.detectChanges();
        this.scheduleNextSlide();
      } else {
        this.stopAutoSlide();
      }
    }, this.autoSlideMs);
  }

  private resetAutoSlideIfNeeded(): void {
    if (this.images.length > 1) {
      this.stopAutoSlide();
      this.startAutoSlide();
    }
  }

  private normalizeStockImages(rawImages: unknown): string[] {
    if (!rawImages) {
      return [];
    }

    if (Array.isArray(rawImages)) {
      return rawImages
        .map((img) => typeof img === 'string' ? img : '')
        .map((img) => img.trim())
        .filter((img) => !!img);
    }

    if (typeof rawImages === 'string') {
      return rawImages
        .split(',')
        .map((img) => img.trim())
        .filter((img) => !!img);
    }

    return [];
  }

  private resolveImageUrl(url: string): string {
    const trimmedUrl = url.trim();
    if (!trimmedUrl) {
      return this.fallbackImage;
    }

    if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
      return trimmedUrl;
    }

    const baseUrl = GenerateUrlUtils.generateUrl('');
    const normalizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
    const normalizedPath = trimmedUrl.startsWith('/') ? trimmedUrl.slice(1) : trimmedUrl;
    return `${normalizedBase}${normalizedPath}`;
  }
}
