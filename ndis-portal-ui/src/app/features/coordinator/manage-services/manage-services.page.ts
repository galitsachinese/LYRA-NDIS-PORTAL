// FILE: manage-services.page.ts

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Your shared components
import { ManageServicesTableComponent } from '../../../../shared/components/table/manage-services/manage-services-table.component';
import { AddButtonComponent } from '../../../../shared/components/button/add-button/add-button.component';
import { ServiceFormModalComponent } from '../../../../shared/components/modals/service-form/service-form-modal.component';

// API Service
import { ApiService } from '../../../core/services/api-service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-manage-services',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ManageServicesTableComponent,
    AddButtonComponent,
    ServiceFormModalComponent,
  ],
  templateUrl: './manage-services.page.html',
})
export class ManageServicesComponent implements OnInit {
  // Services data from API
  services: any[] = [];
  allServices: any[] = [];

  // Loading state
  isLoading = true;
  errorMessage = '';

  // Controls modal visibility
  isModalOpen = false;

  // Status filter
  selectedStatusFilter = 'Active';

  private toast = inject(ToastService);

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadServices();
  }

  // Load services from API
  loadServices(showLoading = true) {
    if (showLoading) {
      this.isLoading = true;
    }
    this.errorMessage = '';

    this.api.getCoordinatorServices().subscribe({
      next: (res: any) => {
        console.log('API Response:', res); // Debug log

        const data = Array.isArray(res?.Data)
          ? res.Data
          : Array.isArray(res?.data)
            ? res.data
            : Array.isArray(res)
              ? res
              : [];

        // Map API response to match table component expectations
        this.allServices = data.map((service: any) => ({
          id: service.id ?? service.Id,
          name: service.name ?? service.Name,
          category:
            service.categoryName ?? service.CategoryName ?? 'Uncategorized',
          categoryId: service.categoryId ?? service.CategoryId,
          description: service.description ?? service.Description ?? '',
          status:
            (service.isActive ?? service.IsActive) ? 'Active' : 'Inactive',
        }));

        // Apply filter
        this.filterByStatus();

        console.log('Mapped services:', this.services); // Debug log

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading services:', err);

        this.services = [];
        this.allServices = [];
        this.errorMessage =
          err?.message || 'Could not load services. Please try again.';
        this.isLoading = false;

        this.toast.show(this.errorMessage, 'error');
      },
    });
  }

  // Open modal
  openModal() {
    this.isModalOpen = true;
  }

  // Save new service
  saveNewService(formData: any) {
    // Map form fields to backend expected format
    const serviceData = {
      Name: formData.name,
      CategoryId: parseInt(formData.category, 10),
      Description: formData.description || '',
    };

    // Call API to create new service
    this.api.createService(serviceData).subscribe({
      next: (res: any) => {
        console.log('Service created successfully:', res);

        // Success Feedback
        this.toast.show('Service created successfully!', 'success');

        // Reload services to get updated list from API
        this.loadServices();

        // Close modal
        this.isModalOpen = false;
      },
      error: (err) => {
        console.error('Error creating service:', err);

        // Error Feedback
        this.toast.show('Could not save service. Please try again.', 'error');
      },
    });
  }

  // Toggle service status between Active and Inactive
  toggleServiceStatus(service: any) {
    const serviceId = service?.id;

    if (serviceId == null) {
      console.error('Unable to toggle service: invalid id', service);
      return;
    }

    const newStatus = service.status === 'Active' ? 'Inactive' : 'Active';

    this.api.updateServiceStatus(serviceId, newStatus, service).subscribe({
      next: () => {
        console.log('Service status updated successfully');

        this.toast.show('Service status updated successfully!', 'success');

        this.loadServices(false);
      },
      error: (err) => {
        console.error('Error toggling service status:', err);

        this.toast.show(
          'Failed to update service status. Please try again.',
          'error',
        );
      },
    });
  }

  // Refresh services list
  refreshServices() {
    this.loadServices(true);
    this.toast.show('Services refreshed successfully!', 'success');
  }

  // Filter services by status
  filterByStatus() {
    if (this.selectedStatusFilter === 'All') {
      this.services = [...this.allServices];
    } else {
      this.services = this.allServices.filter(
        (service) => service.status === this.selectedStatusFilter,
      );
    }
  }
}
