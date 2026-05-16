import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ServiceRecommendationRequest {
  userSituation: string;
  supportNeeds: string;
  conversationHistory?: string[];
}

export interface RecommendedService {
  id: number;
  name: string;
  description: string;
  categoryName: string;
  reason: string;
}

export interface ServiceRecommendationResponse {
  recommendations: RecommendedService[];
  summary: string;
}

@Injectable({
  providedIn: 'root'
})
export class ServiceRecommendationService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/ai/recommend-services`;

  private getAuthHeaders(): HttpHeaders {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }

  getRecommendations(request: ServiceRecommendationRequest): Observable<ServiceRecommendationResponse> {
    // Combine situation and needs into a single message for the backend
    const message = `Situation: ${request.userSituation}\n\nSupport Needs: ${request.supportNeeds}`;
    
    return this.http.post<any>(this.apiUrl, { message }, { headers: this.getAuthHeaders() }).pipe(
      map(response => {
        // Handle wrapped response: { recommendations: [...], ... }
        // or { data: { recommendations: [...] } }
        const data = response.data || response;
        const recommendations = data.recommendations || [];
        
        return {
          recommendations: recommendations.map((r: any) => ({
            id: r.id,
            name: r.name || r.serviceName || '',
            description: r.description || '',
            categoryName: r.categoryName || r.category || 'General',
            reason: r.reason || r.reasoning || '',
          })),
          summary: data.summary || data.outOfScopeMessage || data.message || 
                   `Based on your needs, we found ${recommendations.length} service(s) that may be suitable for you.`
        };
      })
    );
  }
}