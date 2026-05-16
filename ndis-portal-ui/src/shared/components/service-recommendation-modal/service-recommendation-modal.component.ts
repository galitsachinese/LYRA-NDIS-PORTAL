import { Component, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ServiceRecommendationService, ServiceRecommendationRequest, RecommendedService } from '../../../app/core/services/service-recommendation.service';

@Component({
  selector: 'app-service-recommendation-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './service-recommendation-modal.component.html',
  styleUrls: ['./service-recommendation-modal.component.scss']
})
export class ServiceRecommendationModalComponent {
  @Output() close = new EventEmitter<void>();

  private serviceRecommendationService = inject(ServiceRecommendationService);
  private router = inject(Router);

  isOpen = false;
  isLoading = false;
  currentStep = 1; // 1: Situation, 2: Needs, 3: Results

  userSituation = '';
  supportNeeds = '';
  conversationHistory: string[] = [];

  recommendations: RecommendedService[] = [];
  summary = '';

  openModal() {
    this.isOpen = true;
    this.currentStep = 1;
    this.userSituation = '';
    this.supportNeeds = '';
    this.conversationHistory = [];
    this.recommendations = [];
    this.summary = '';
  }

  closeModal() {
    this.isOpen = false;
    this.close.emit();
  }

  goToStep(step: number) {
    if (step < this.currentStep) {
      this.currentStep = step;
    }
  }

  submitSituation() {
    if (this.userSituation.trim()) {
      this.currentStep = 2;
    }
  }

  submitNeeds() {
    if (this.supportNeeds.trim()) {
      this.getRecommendations();
    }
  }

  getRecommendations() {
    this.isLoading = true;

    const request: ServiceRecommendationRequest = {
      userSituation: this.userSituation.trim(),
      supportNeeds: this.supportNeeds.trim(),
      conversationHistory: this.conversationHistory
    };

    this.serviceRecommendationService.getRecommendations(request).subscribe({
      next: (response) => {
        this.recommendations = response.recommendations;
        this.summary = response.summary;
        this.currentStep = 3;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error getting recommendations:', error);
        this.isLoading = false;
        alert('Unable to get recommendations. Please try again later.');
      }
    });
  }

  bookService(serviceId: number) {
    this.closeModal();
    this.router.navigate(['/services', serviceId]);
  }

  resetAndStartOver() {
    this.currentStep = 1;
    this.userSituation = '';
    this.supportNeeds = '';
    this.conversationHistory = [];
    this.recommendations = [];
    this.summary = '';
  }
}