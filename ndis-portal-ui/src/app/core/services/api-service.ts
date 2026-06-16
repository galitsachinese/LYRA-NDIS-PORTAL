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
   * No auth required — backend has [AllowAnonymous]
   * Interceptor attaches token if exists; backend ignores it for this route
   */
  getServices(): Observable<any> {
    return this.http.get<any>(this.apiUrl).pipe(
      map((response: any) => {
        console.log('Raw API response:', response);

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
   * FIX: Removed manual header attachment.
   * Previously this was manually reading localStorage and attaching
   * its own Authorization header — which bypassed the interceptor
   * and caused header conflicts resulting in 403 errors.
   *
   * The interceptor (auth.interceptor.ts) already handles token
   * attachment globally. Never attach headers manually here.
   *
   * Backend: [AllowAnonymous] so public users can view,
   * but token is still forwarded if user is logged in (no harm).
   */
  getServiceById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map((response: any) => {
        return response?.Data ? response : { Data: response };
      }),
      catchError((error: any) => {
        console.error('Service detail error:', error);

        if (error.status === 403) {
          console.error(
            '403 on getServiceById — check if interceptor is conflicting or token is malformed',
          );
        }

        return throwError(() => new Error('Failed to load service.'));
      }),
    );
  }

  /**
   * =========================
   * PUBLIC CATEGORIES
   * =========================
   * No auth required
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
   * Protected — interceptor attaches JWT automatically.
   * Backend enforces [Authorize(Roles = "Coordinator")]
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

  /**
   * =========================
   * BOOKINGS (PROTECTED)
   * =========================
   * All booking endpoints require auth.
   * Interceptor handles JWT — no manual headers needed.
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
}
