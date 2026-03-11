import { Component, OnInit, ChangeDetectorRef, inject, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastMessage, ToastService } from '../../util/toast.service';

@Component({
  selector: 'app-global-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './global-toast.html',
  styleUrls: ['./global-toast.css'],
})
export class GlobalToastComponent implements OnInit {
  toast: ToastMessage | null = null;
  visible = false;
  private cdr = inject(ChangeDetectorRef);

  constructor(private toastService: ToastService) { }

  ngOnInit() {
    this.toastService.toast$.subscribe((toast) => {
      if (!toast) {
        this.visible = false;
        this.cdr.markForCheck();
        this.cdr.detectChanges();
        return;
      }

      this.toast = toast;
      this.visible = true;
      this.cdr.markForCheck();
      this.cdr.detectChanges();

      // STRICTLY hide: 1.5s for success, 4s for errors
      const time = toast.type === 'success' ? 1500 : 4000;

      setTimeout(() => {
        this.hideToast();
      }, time);
    });
  }

  hideToast() {
    this.visible = false;
    this.cdr.markForCheck();
    this.cdr.detectChanges();

    // After animation, clear data
    setTimeout(() => {
      this.toast = null;
      this.cdr.markForCheck();
      this.cdr.detectChanges();
    }, 500);
  }
}
