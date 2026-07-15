import { TestBed } from '@angular/core/testing';
import { ToastService } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ToastService],
    });
    service = TestBed.inject(ToastService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should add toast', (done) => {
    service.toasts$.subscribe((toasts) => {
      if (toasts.length > 0) {
        expect(toasts[0].type).toBe('success');
        expect(toasts[0].message).toBe('Test message');
        done();
      }
    });
    service.show('success', 'Test message');
  });

  it('should dismiss toast', () => {
    service.show('info', 'Test');
    const toasts = (service as any).toastsSubject.getValue();
    expect(toasts.length).toBeGreaterThan(0);
    const id = toasts[0].id;
    service.dismiss(id);
    expect((service as any).toastsSubject.getValue().length).toBe(0);
  });
});
