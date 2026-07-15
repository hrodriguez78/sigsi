import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { WidgetService } from './widget.service';
import { environment } from '../../../environments/environment';

describe('WidgetService', () => {
  let service: WidgetService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [WidgetService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(WidgetService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should GET layout', () => {
    service.getLayout().subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/widgets/layout`);
    expect(req.request.method).toBe('GET');
    req.flush({ user_id: '1', widgets: [], columns: 4 });
  });

  it('should PUT layout', () => {
    service.updateLayout({ columns: 3 }).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/widgets/layout`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ columns: 3 });
    req.flush({ user_id: '1', widgets: [], columns: 3 });
  });

  it('should POST reset layout', () => {
    service.resetLayout().subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/widgets/layout/reset`);
    expect(req.request.method).toBe('POST');
    req.flush({ user_id: '1', widgets: [], columns: 4 });
  });
});
