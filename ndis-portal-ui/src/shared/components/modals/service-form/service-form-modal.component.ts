// FILE: service-form-modal.component.ts

import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { ApiService } from '../../../../app/core/services/api-service';
import { CommonModule } from '@angular/common';
import { DialogUi } from '../../../ui/dialog/dialog.ui';

// Reactive Forms imports (VERY IMPORTANT)
import {
  FormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';

@Component({
  selector: 'app-service-form-modal',
  standalone: true,
  imports: [
    CommonModule,
    DialogUi,
    ReactiveFormsModule, // Needed for FormGroup to work
  ],
  templateUrl: './service-form-modal.component.html',
})
export class ServiceFormModalComponent {
  // Emits when modal is closed
  @Output() onClose = new EventEmitter<void>();

  // Emits when form is saved
  @Output() onSave = new EventEmitter<any>();

  // Reactive form definition
  serviceForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    category: new FormControl('', [Validators.required]),
    description: new FormControl(''),
  });

  // Toggle state for "Active on creation"
  isActiveOnCreation = true;

  // Service categories for dropdown
  categories: any[] = [];

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.getServiceCategories().subscribe({
      next: (res: any) => {
        // Assuming API returns array directly or wrapped in Data
        this.categories = res.Data ? res.Data : res;
      },
      error: (err: any) => {
        console.error('Failed to load categories', err);
      },
    });
  }

  // Submit form
  submit() {
    if (this.serviceForm.valid) {
      // Emit form data with active status
      const formData = {
        ...this.serviceForm.value,
        isActive: this.isActiveOnCreation,
      };
      this.onSave.emit(formData);
      // Close the modal after successful save
      this.onClose.emit();
    }
  }

  // Toggle active on creation
  toggleActiveCreation() {
    this.isActiveOnCreation = !this.isActiveOnCreation;
  }
}
