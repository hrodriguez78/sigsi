import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { DashboardComponent } from './dashboard.component';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let store: MockStore;

  const initialState = {
    dashboard: { stats: null, kpis: null, trends: null, loading: false },
    widgets: { layout: null, loading: false, error: null },
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DashboardComponent],
      providers: [provideMockStore({ initialState })],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have widgets$ observable', () => {
    expect(component.widgets$).toBeTruthy();
  });

  it('should have columns$ observable', () => {
    expect(component.columns$).toBeTruthy();
  });

  it('should toggle settings', () => {
    component.settingsOpen = false;
    component.toggleSettings();
    expect(component.settingsOpen).toBe(true);
    component.toggleSettings();
    expect(component.settingsOpen).toBe(false);
  });

  it('should toggle edit mode', () => {
    component.editMode = false;
    component.toggleEditMode();
    expect(component.editMode).toBe(true);
  });

  it('should return correct grid class', () => {
    expect(component.getGridClass(2)).toBe('grid-2');
    expect(component.getGridClass(3)).toBe('grid-3');
    expect(component.getGridClass(4)).toBe('grid-4');
    expect(component.getGridClass(5)).toBe('grid-4');
  });

  it('should track by widget id', () => {
    const widget = { id: 'w1', type: 'stat_card', title: 'Test', size: 'small' as const, enabled: true, order: 0 };
    expect(component.trackByWidgetId(0, widget)).toBe('w1');
  });
});
