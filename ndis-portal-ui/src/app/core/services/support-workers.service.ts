import { HttpClient, HttpHeaders } from '@angular/common/http';
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
}

export interface SupportWorkerPayload {
  fullName: string;
  email: string;
  phone: string;
  assignedServiceId: number;
}

@Injectable({
  providedIn: 'root',
})
export class SupportWorkersService {
  private readonly apiUrl = `${environment.apiUrl}/support-workers`;

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
    };
  }

  private toError(error: any, fallback: string): Error {
    return new Error(error?.error?.message || error?.message || fallback);
  }
}
