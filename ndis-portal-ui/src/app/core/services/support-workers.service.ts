import { HttpClient, HttpEvent, HttpHeaders, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface SupportWorker {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  assignedServiceId: number;
  assignedServiceName?: string | null;
  status?: string | null;
  profilePicture?: string | null;
}

export interface SupportWorkerPayload {
  fullName: string;
  email: string;
  phone: string;
  assignedServiceId: number;
}

export type SupportWorkerStatus = 'Active' | 'Inactive';

@Injectable({
  providedIn: 'root',
})
export class SupportWorkersService {
  private readonly apiUrl = `${environment.apiUrl}/support-workers`;
  private readonly apiBaseUrl = environment.apiUrl.replace(/\/api$/, '');

  constructor(private http: HttpClient) {}

  getSupportWorkers(): Observable<SupportWorker[]> {
    return this.http.get<any>(this.apiUrl, { headers: this.getAuthHeaders() }).pipe(
      map((response) => this.unwrapList(response).map((worker) => this.normalizeWorker(worker))),
      catchError((error) => throwError(() => this.toError(error, 'Failed to load support workers.')))
    );
  }

  createSupportWorker(payload: SupportWorkerPayload): Observable<SupportWorker> {
    return this.http.post<any>(this.apiUrl, payload, { headers: this.getAuthHeaders() }).pipe(
      map((response) => this.normalizeWorker(response)),
      catchError((error) => throwError(() => this.toError(error, 'Failed to create support worker.')))
    );
  }

  updateSupportWorker(id: number, payload: SupportWorkerPayload): Observable<SupportWorker> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, payload, { headers: this.getAuthHeaders() }).pipe(
      map((response) => this.normalizeWorker(response)),
      catchError((error) => throwError(() => this.toError(error, 'Failed to update support worker.')))
    );
  }

  updateSupportWorkerStatus(id: number, status: SupportWorkerStatus): Observable<SupportWorker> {
    return this.http.put<any>(`${this.apiUrl}/${id}/status`, { status }, { headers: this.getAuthHeaders() }).pipe(
      map((response) => this.normalizeWorker(response)),
      catchError((error) => throwError(() => this.toError(error, 'Failed to update support worker status.')))
    );
  }

  getUpcomingBookingCount(id: number): Observable<number> {
    return this.http.get<any>(`${this.apiUrl}/${id}/upcoming-bookings/count`, { headers: this.getAuthHeaders() }).pipe(
      map((response) => Number(response?.count ?? response?.Count ?? response?.data?.count ?? response?.Data?.Count ?? 0)),
      catchError((error) => throwError(() => this.toError(error, 'Failed to load assigned booking count.')))
    );
  }

  deleteSupportWorker(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() }).pipe(
      catchError((error) => throwError(() => this.toError(error, 'Failed to delete support worker.')))
    );
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }

  private unwrapList(response: any): any[] {
    if (Array.isArray(response)) {
      return response;
    }

    if (Array.isArray(response?.Data)) {
      return response.Data;
    }

    if (Array.isArray(response?.data)) {
      return response.data;
    }

    return [];
  }

  private normalizeWorker(worker: any): SupportWorker {
    const fullName =
      worker?.fullName ??
      worker?.FullName ??
      `${worker?.firstName ?? worker?.FirstName ?? ''} ${worker?.lastName ?? worker?.LastName ?? ''}`.trim();

    return {
      id: Number(worker?.id ?? worker?.Id ?? 0),
      fullName,
      email: worker?.email ?? worker?.Email ?? '',
      phone: worker?.phone ?? worker?.Phone ?? '',
      assignedServiceId: Number(
        worker?.assignedServiceId ?? worker?.AssignedServiceId ?? worker?.serviceId ?? worker?.ServiceId ?? 0
      ),
      assignedServiceName:
        worker?.assignedServiceName ?? worker?.AssignedServiceName ?? worker?.serviceName ?? worker?.ServiceName ?? null,
      status: worker?.status ?? worker?.Status ?? null,
      profilePicture: this.resolveProfilePictureUrl(worker?.profilePicture ?? worker?.ProfilePicture ?? null),
    };
  }

  uploadProfilePicture(id: number, file: File): Observable<HttpEvent<any>> {
    const formData = new FormData();
    formData.append('file', file);

    const request = new HttpRequest('POST', `${this.apiUrl}/${id}/upload-picture`, formData, {
      headers: this.getAuthHeadersForUpload(),
      reportProgress: true,
    });

    return this.http.request(request).pipe(
      catchError((error) => throwError(() => this.toError(error, 'Failed to upload profile picture.')))
    );
  }

  resolveWorkerProfilePictureUrl(value: string | null | undefined): string | null {
    return this.resolveProfilePictureUrl(value);
  }

  private resolveProfilePictureUrl(value: string | null | undefined): string | null {
    if (!value) {
      return null;
    }

    if (/^https?:\/\//i.test(value)) {
      return value;
    }

    return `${this.apiBaseUrl}${value.startsWith('/') ? value : `/${value}`}`;
  }

  private getAuthHeadersForUpload(): HttpHeaders {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    // Do NOT set Content-Type - let browser set it with boundary for multipart
    return headers;
  }

  private toError(error: any, fallback: string): Error {
    return new Error(error?.error?.message || error?.message || fallback);
  }
}
