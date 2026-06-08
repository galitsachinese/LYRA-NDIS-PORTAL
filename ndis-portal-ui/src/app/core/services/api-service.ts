import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private apiUrl = `${environment.apiUrl}/services`;
  private bookingsApiUrl = `${environment.apiUrl}/bookings`;

  constructor(private http: HttpClient) {}

  /**
   * =========================
   * PUBLIC SERVICES ENDPOINT
   * =========================
   * No authentication required
   * No headers attached
   */
  getServices(): Observable<any> {
    return this.http.get<any>(this.apiUrl).pipe(
      map((response: any) => {
        console.log('Raw API response:', response);

        // Backend returns: [] OR { Data: [] }
        if (response && response.Data) {
          return response;
        }

        return { Data: response };
      }),
      catchError((error) => {
        console.error('API Error:', error);

        return throwError(
          () => new Error('Failed to load services. Please try again.'),
        );
      }),
    );
  }

  /**
   * =========================
   * PUBLIC SERVICE BY ID
   * =========================
   */
  getServiceById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map((response: any) => {
        if (response && response.Data) {
          return response;
        }
        return { Data: response };
      }),
      catchError((error: any) => {
        if (error.status === 404) {
          return throwError(() => new Error('Service not found.'));
        }

        return throwError(() => new Error('Failed to load service.'));
      }),
    );
  }

  /**
   * =========================
   * PUBLIC CATEGORIES
   * =========================
   */
  getServiceCategories(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/service-categories`).pipe(
      map((response: any) => {
        if (response && response.Data) return response;
        return { Data: response };
      }),
      catchError(() =>
        throwError(() => new Error('Failed to load service categories.')),
      ),
    );
  }

  /**
   * =========================
   * COORDINATOR ENDPOINTS
   * =========================
   * These automatically get JWT via interceptor
   */
  getCoordinatorServices(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/coordinator`).pipe(
      map((response: any) => {
        if (response && Array.isArray(response.Data)) {
          return response;
        }
        return { Data: response };
      }),
      catchError(() =>
        throwError(() => new Error('Failed to load coordinator services.')),
      ),
    );
  }

  createService(service: any): Observable<any> {
    return this.http
      .post<any>(this.apiUrl, service)
      .pipe(
        catchError(() =>
          throwError(() => new Error('Failed to create service.')),
        ),
      );
  }

  updateService(id: number, service: any): Observable<any> {
    return this.http
      .put<any>(`${this.apiUrl}/${id}`, service)
      .pipe(
        catchError(() =>
          throwError(() => new Error('Failed to update service.')),
        ),
      );
  }

  deleteService(id: number): Observable<any> {
    return this.http
      .delete<any>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(() =>
          throwError(() => new Error('Failed to delete service.')),
        ),
      );
  }

  /**
   * =========================
   * BOOKINGS (PROTECTED)
   * =========================
   */

  getBookingStats(): Observable<any> {
    return this.http
      .get<any>(`${this.bookingsApiUrl}/stats`)
      .pipe(
        catchError(() =>
          throwError(() => new Error('Failed to load booking stats.')),
        ),
      );
  }

  getBookings(): Observable<any> {
    return this.http
      .get<any>(this.bookingsApiUrl)
      .pipe(
        catchError(() =>
          throwError(() => new Error('Failed to load bookings.')),
        ),
      );
  }

  updateBookingStatus(
    id: number,
    status: 'Approved' | 'Cancelled',
  ): Observable<any> {
    return this.http
      .put<any>(`${this.bookingsApiUrl}/${id}/status`, { status })
      .pipe(
        catchError(() =>
          throwError(() => new Error(`Failed to ${status} booking.`)),
        ),
      );
  }

  assignWorkerToBooking(
    bookingId: number,
    supportWorkerId: number,
  ): Observable<any> {
    return this.http
      .put<any>(`${this.bookingsApiUrl}/${bookingId}/assign-worker`, {
        workerId: supportWorkerId,
        supportWorkerId,
      })
      .pipe(
        catchError((error) =>
          throwError(
            () =>
              new Error(error?.error?.message || 'Failed to assign worker.'),
          ),
        ),
      );
  }

  unassignWorkerFromBooking(bookingId: number): Observable<any> {
    return this.http
      .delete<any>(`${this.bookingsApiUrl}/${bookingId}/assign-worker`)
      .pipe(
        catchError(() =>
          throwError(() => new Error('Failed to remove worker.')),
        ),
      );
  }

  updateServiceStatus(
    id: number,
    status: 'Active' | 'Inactive',
    serviceData: any,
  ): Observable<any> {
    const payload = {
      Name: serviceData.name,
      CategoryId: serviceData.categoryId || serviceData.category,
      Description: serviceData.description || '',
      IsActive: status === 'Active',
    };

    return this.http
      .put<any>(`${this.apiUrl}/${id}`, payload)
      .pipe(
        catchError(() =>
          throwError(() => new Error('Failed to update service status.')),
        ),
      );
  }
}
