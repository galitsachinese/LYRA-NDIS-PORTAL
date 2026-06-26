import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ContactEnquiry } from '../models/contact-enquiry.model';

export interface EnquiryResponse {
  status: number;
  data: ContactEnquiry[];
}

export interface SingleEnquiryResponse {
  status: number;
  data: ContactEnquiry;
}

@Injectable({
  providedIn: 'root',
})
export class ContactEnquiryService {
  private apiUrl = `${environment.apiUrl}/contact`;

  constructor(private http: HttpClient) {}

  /**
   * GET /api/contact
   * Coordinator only — returns all contact enquiries, newest first.
   */
  getEnquiries(status?: string, search?: string): Observable<ContactEnquiry[]> {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }
    if (search) {
      params = params.set('search', search);
    }

    return this.http
      .get<EnquiryResponse>(this.apiUrl, { params })
      .pipe(map((response) => response.data || []));
  }

  /**
   * GET /api/contact/{id}
   * Coordinator only — returns full enquiry detail and marks as read.
   */
  getEnquiryById(id: number): Observable<ContactEnquiry> {
    return this.http
      .get<SingleEnquiryResponse>(`${this.apiUrl}/${id}`)
      .pipe(map((response) => response.data));
  }
}