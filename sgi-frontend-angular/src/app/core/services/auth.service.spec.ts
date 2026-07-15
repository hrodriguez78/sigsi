import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should login and store token', () => {
    const mockResponse = {
      access_token: 'test-token-123',
      token_type: 'bearer',
      expires_in: 3600,
    };

    service.login('test@test.com', 'password123').subscribe((res) => {
      expect(res.access_token).toBe('test-token-123');
      expect(localStorage.getItem('sgi_token')).toBe('test-token-123');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('should logout and clear token', () => {
    localStorage.setItem('sgi_token', 'some-token');
    service.logout();
    expect(localStorage.getItem('sgi_token')).toBeNull();
  });

  it('should return currentUser from token', () => {
    const payload = {
      sub: 'user-123',
      email: 'admin@test.com',
      roles: ['admin'],
      exp: Date.now() / 1000 + 3600,
    };
    const token = 'header.' + btoa(JSON.stringify(payload)) + '.sig';
    localStorage.setItem('sgi_token', token);

    const user = service.currentUser;
    expect(user).toBeTruthy();
    expect(user?.email).toBe('admin@test.com');
  });

  it('should return null currentUser when no token', () => {
    localStorage.removeItem('sgi_token');
    expect(service.currentUser).toBeNull();
  });
});
