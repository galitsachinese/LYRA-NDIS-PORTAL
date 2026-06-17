import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../../app/core/services/api-service';
import { ToastService } from '../../../../app/core/services/toast.service';
import { DialogUi } from '../../../ui/dialog/dialog.ui';

@Component({
  selector: 'app-edit-service-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogUi],
  templateUrl: './edit-service-modal.component.html',
})
export class EditServiceModalComponent implements OnInit {
  @Input() service: any = null;
  @Output() onClose = new EventEmitter<void>();
  @Output() onSaved = new EventEmitter<void>();

  // Form fields
  name = '';
  category = '';
  description = '';

  // Categories for dropdown
  categories: any[] = [];

  // States
  isSaving = false;
  isDeleting = false;
  showDeleteConfirm = false;
  errorMessage = '';
  deleteError = '';

  constructor(
    private api: ApiService,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    if (this.service) {
      this.name = this.service.name || '';
      this.category = this.service.categoryId || this.service.category || '';
      this.description = this.service.description || '';
    }

    this.api.getServiceCategories().subscribe({
      next: (res: any) => {
        this.categories = res.Data ? res.Data : res;
      },
      error: (err: any) => {
        console.error('Failed to load categories', err);
      },
    });
  }

  close() {
    this.onClose.emit();
  }

  save() {
    if (!this.name.trim()) {
      this.errorMessage = 'Service name is required.';
      return;
    }
    if (!this.category) {
      this.errorMessage = 'Category is required.';
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';

    const serviceData = {
      Name: this.name.trim(),
      CategoryId: parseInt(this.category, 10),
      Description: this.description.trim() || '',
    };

    this.api.updateService(this.service.id, serviceData).subscribe({
      next: () => {
        this.isSaving = false;
        this.toast.show('Service updated successfully!', 'success');
        this.onSaved.emit();
        this.close();
      },
      error: (err: any) => {
        this.isSaving = false;
        this.errorMessage = err?.error?.message || 'Failed to update service. Please try again.';
        this.toast.show(this.errorMessage, 'error');
      },
    });
  }

  confirmDelete() {
    this.showDeleteConfirm = true;
  }

  cancelDelete() {
    this.showDeleteConfirm = false;
  }

  deleteService() {
    this.isDeleting = true;
    this.deleteError = '';

    this.api.deleteService(this.service.id).subscribe({
      next: () => {
        this.isDeleting = false;
        this.toast.show('Service deleted successfully!', 'success');
        this.onSaved.emit();
        this.close();
      },
      error: (err: any) => {
        this.isDeleting = false;
        this.deleteError = err?.error?.message || 'Failed to delete service. Please try again.';
        this.toast.show(this.deleteError, 'error');
      },
    });
  }
}