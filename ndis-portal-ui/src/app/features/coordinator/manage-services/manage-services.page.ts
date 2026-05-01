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
            categoryId: service.categoryId,
            description: service.description,
            status: service.isActive || service.IsActive ? 'Active' : 'Inactive',
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
    // Map form fields to backend expected format
    const serviceData = {
      Name: formData.name,
      CategoryId: parseInt(formData.category, 10),
      Description: formData.description || ''
    };
    
    // Call API to create new service
    this.api.createService(serviceData).subscribe({
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

  // Toggle service status between Active and Inactive
  toggleServiceStatus(service: any) {
    const serviceId = service?.id;
    if (serviceId == null) {
      console.error('Unable to toggle service: invalid id', service);
      return;
    }
    const newStatus = service.status === 'Active' ? 'Inactive' : 'Active';
    this.api.updateServiceStatus(serviceId, newStatus, service).subscribe({
      next: () => this.loadServices(),
      error: (err) => console.error('Error toggling service status:', err)
    });
  }
}
