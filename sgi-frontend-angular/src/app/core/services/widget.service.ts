import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { WidgetLayout } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class WidgetService {
  private apiUrl = `${environment.apiUrl}/widgets`;

  constructor(private http: HttpClient) {}

  getLayout(organizationId?: string): Observable<WidgetLayout> {
    let params = new HttpParams();
    if (organizationId) {
      params = params.set('organization_id', organizationId);
    }
    return this.http.get<WidgetLayout>(`${this.apiUrl}/layout`, { params });
  }

  updateLayout(layout: Partial<WidgetLayout>, organizationId?: string): Observable<WidgetLayout> {
    let params = new HttpParams();
    if (organizationId) {
      params = params.set('organization_id', organizationId);
    }
    return this.http.put<WidgetLayout>(`${this.apiUrl}/layout`, layout, { params });
  }

  resetLayout(organizationId?: string): Observable<WidgetLayout> {
    let params = new HttpParams();
    if (organizationId) {
      params = params.set('organization_id', organizationId);
    }
    return this.http.post<WidgetLayout>(`${this.apiUrl}/layout/reset`, {}, { params });
  }
}
