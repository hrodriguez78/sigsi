import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ExportService } from './export.service';
import { ToastService } from './toast.service';
import { ApiService } from './api.service';
import { environment } from '../../../environments/environment';

describe('ExportService', () => {
  let service: ExportService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ExportService,
        ToastService,
        ApiService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(ExportService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call export endpoint with xlsx format by default', () => {
    service.exportModule('risks');

    const req = httpMock.expectOne((r) => r.url.includes('/export/risks'));
    expect(req.request.params.get('format')).toBe('xlsx');
    req.flush(new Blob(['test']));
  });

  it('should call export endpoint with pdf format', () => {
    service.exportModule('risks', undefined, 'pdf');

    const req = httpMock.expectOne((r) => r.url.includes('/export/risks'));
    expect(req.request.params.get('format')).toBe('pdf');
    req.flush(new Blob(['test']));
  });

  it('should include organization_id when provided', () => {
    service.exportModule('incidents', 'org-123');

    const req = httpMock.expectOne((r) => r.url.includes('/export/incidents'));
    expect(req.request.params.get('organization_id')).toBe('org-123');
    req.flush(new Blob(['test']));
  });
});
