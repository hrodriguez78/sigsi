import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let service: ThemeService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ThemeService],
    });
    service = TestBed.inject(ThemeService);
    document.documentElement.removeAttribute('data-theme');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should default to light theme', () => {
    service.theme$.subscribe((theme) => {
      expect(theme).toBe('light');
    });
  });

  it('should toggle theme', () => {
    service.toggleTheme();
    service.theme$.subscribe((theme) => {
      expect(theme).toBe('dark');
    });
  });

  it('should set theme', () => {
    service.setTheme('dark');
    service.theme$.subscribe((theme) => {
      expect(theme).toBe('dark');
    });
  });
});
