import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ManageServicesTableComponent } from '../../../../shared/components/table/manage-services/manage-services-table.component';
import { AddButtonComponent } from '../../../../shared/components/button/add-button/add-button.component';
import { ServiceFormModalComponent } from '../../../../shared/components/modals/service-form/service-form-modal.component';
import { EditServiceModalComponent } from '../../../../shared/components/modals/edit-service-modal/edit-service-modal.component';

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
    EditServiceModalComponent,
  ],
  templateUrl: './manage-services.page.html',
})
export class ManageServicesComponent implements OnInit {
  services: any[] = [];
  allServices: any[] = [];

  isLoading = true;
  errorMessage = '';

  isModalOpen = false;
  isEditModalOpen = false;
  selectedServiceForEdit: any = null;

  selectedStatusFilter = 'Active';

  private toast = inject(ToastService);

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadServices();
  }

  loadServices(showLoading = true) {
    if (showLoading) {
      this.isLoading = true;
    }
    this.errorMessage = '';

    this.api.getCoordinatorServices().subscribe({
      next: (res: any) => {
        const data = Array.isArray(res?.Data)
          ? res.Data
          : Array.isArray(res?.data)
            ? res.data
            : Array.isArray(res)
              ? res
              : [];

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

        this.filterByStatus();
        this.isLoading = false;
      },
      error: (err) => {
        this.services = [];
        this.allServices = [];
        this.errorMessage =
          err?.message || 'Could not load services. Please try again.';
        this.isLoading = false;
        this.toast.show(this.errorMessage, 'error');
      },
    });
  }

  openModal() {
    this.isModalOpen = true;
  }

  openEditModal(service: any) {
    this.selectedServiceForEdit = service;
    this.isEditModalOpen = true;
  }

  saveNewService(formData: any) {
    const serviceData = {
      Name: formData.name,
      CategoryId: parseInt(formData.category, 10),
      Description: formData.description || '',
    };

    this.api.createService(serviceData).subscribe({
      next: (res: any) => {
        this.toast.show('Service created successfully!', 'success');
        this.loadServices();
        this.isModalOpen = false;
      },
      error: (err) => {
        this.toast.show('Could not save service. Please try again.', 'error');
      },
    });
  }

  toggleServiceStatus(service: any) {
    const serviceId = service?.id;
    if (serviceId == null) {
      return;
    }

    const newStatus = service.status === 'Active' ? 'Inactive' : 'Active';

    this.api.updateServiceStatus(serviceId, newStatus, service).subscribe({
      next: () => {
        this.toast.show('Service status updated successfully!', 'success');
        this.loadServices(false);
      },
      error: (err) => {
        this.toast.show(
          'Failed to update service status. Please try again.',
          'error',
        );
      },
    });
  }

  refreshServices() {
    this.loadServices(true);
    this.toast.show('Services refreshed successfully!', 'success');
  }

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