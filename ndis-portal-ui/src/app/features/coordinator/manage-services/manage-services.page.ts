// FILE: manage-services.page.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

// Your shared components
import { ManageServicesTableComponent } from '../../../../shared/components/table/manage-services/manage-services-table.component';

import { AddButtonComponent } from '../../../../shared/components/button/add-button/add-button.component';

import { ServiceFormModalComponent } from '../../../../shared/components/modals/service-form-modal.component';

// API Service
import { ApiService } from '../../../core/services/api-service';

@Component({
  selector: 'app-manage-services',
  standalone: true,
  imports: [
    CommonModule,
    ManageServicesTableComponent,
    AddButtonComponent,
    ServiceFormModalComponent,
  ],
  templateUrl: './manage-services.page.html',
})
export class ManageServicesComponent implements OnInit {
  // Services data from API
  services: any[] = [];
  
  // Loading state
  isLoading = true;

  // Controls modal visibility
  isModalOpen = false;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadServices();
  }

  // Load services from API
  loadServices() {
    this.api.getServices().subscribe({
      next: (res: any) => {
        if (res.Data && Array.isArray(res.Data)) {
          // Map API response to match table component expectations
          this.services = res.Data.map((service: any) => ({
            id: service.id,
            name: service.name || service.title,
            category: service.categoryName || service.category,
            status: service.status || 'Active', // Default to Active if not provided
          }));
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading services:', err);
        this.isLoading = false;
        
        // Commented out mock data - kept for reference
        /*
        this.services = [
          {
            id: 1,
            name: 'Web Development',
            category: 'IT Services',
            status: 'Active',
          },
          {
            id: 2,
            name: 'Logo Design',
            category: 'Graphics',
            status: 'Inactive',
          },
        ];
        */
      }
    });
  }

  // Open modal
  openModal() {
    this.isModalOpen = true;
    console.log('Modal Opened');
  }

  // Save new service
  saveNewService(formData: any) {
    // Call API to create new service
    this.api.createService(formData).subscribe({
      next: (res: any) => {
        console.log('Service created successfully:', res);
        
        // Reload services to get updated list from API
        this.loadServices();
        
        // Close modal
        this.isModalOpen = false;
      },
      error: (err) => {
        console.error('Error creating service:', err);
        // Optionally show error message to user
      }
    });
  }

  // Activate a service by setting its status to 'Active'
  // Activate a service by setting its status to 'Active'
  // Accepts either a service id (number) or a service object emitted from the table component.
  activateService(service: any) {
    const serviceId = typeof service === 'number' ? service : service?.id;
    if (serviceId == null) {
      console.error('Unable to activate service: invalid id', service);
      return;
    }
    this.api.updateService(serviceId, { status: 'Active' }).subscribe({
      next: () => this.loadServices(),
      error: (err) => console.error('Error activating service:', err)
    });
  }

  // Deactivate a service by setting its status to 'Inactive'
  // Accepts either a service id (number) or a service object.
  deactivateService(service: any) {
    const serviceId = typeof service === 'number' ? service : service?.id;
    if (serviceId == null) {
      console.error('Unable to deactivate service: invalid id', service);
      return;
    }
    this.api.updateService(serviceId, { status: 'Inactive' }).subscribe({
      next: () => this.loadServices(),
      error: (err) => console.error('Error deactivating service:', err)
    });
  }
}
