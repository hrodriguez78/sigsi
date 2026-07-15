import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OrgPosition, OrgChartResponse } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class OrgchartService {
  private apiUrl = `${environment.apiUrl}/orgchart`;

  constructor(private http: HttpClient) {}

  getTree(organizationId: string): Observable<OrgChartResponse> {
    const params = new HttpParams().set('organization_id', organizationId);
    return this.http.get<OrgChartResponse>(`${this.apiUrl}/tree`, { params });
  }

  listPositions(organizationId: string): Observable<OrgPosition[]> {
    const params = new HttpParams().set('organization_id', organizationId);
    return this.http.get<OrgPosition[]>(`${this.apiUrl}/positions`, { params });
  }

  getPosition(id: string): Observable<OrgPosition> {
    return this.http.get<OrgPosition>(`${this.apiUrl}/positions/${id}`);
  }

  createPosition(organizationId: string, data: Partial<OrgPosition>): Observable<OrgPosition> {
    const params = new HttpParams().set('organization_id', organizationId);
    return this.http.post<OrgPosition>(`${this.apiUrl}/positions`, data, { params });
  }

  updatePosition(id: string, data: Partial<OrgPosition>): Observable<OrgPosition> {
    return this.http.put<OrgPosition>(`${this.apiUrl}/positions/${id}`, data);
  }

  deletePosition(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/positions/${id}`);
  }
}
