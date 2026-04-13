import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { ContactService } from './contact.service';
import { ToastService } from '../../util/toast.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    TextareaModule,
    ButtonModule,
    MessageModule
  ],
  templateUrl: './contact.html',
  styleUrl: './contact.css',
})
export class Contact implements OnInit {
  contactForm!: FormGroup;
  submitting = false;

  constructor(
    private fb: FormBuilder,
    private contactService: ContactService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      subject: ['', [Validators.required, Validators.minLength(5)]],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  onSubmit() {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.contactService.sendMessage(this.contactForm.value)
      .pipe(finalize(() => this.submitting = false))
      .subscribe({
        next: (res) => {
          this.toastService.successResponse(res);
          this.contactForm.reset();
        },
        error: (err) => {
          this.toastService.errorResponse(err);
        }
      });
  }
}
