import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService, Theme } from '../../../core/services/theme.service';
import { User, Organization } from '../../../core/models';
import { Store } from '@ngrx/store';
import { AppState } from '../../../store/app.reducer';
import {
  selectOrganizations,
  selectSelectedOrganization,
} from '../../../store/organizations/organizations.selectors';
import * as OrgActions from '../../../store/organizations/organizations.actions';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  roles?: string[];
}

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
})
export class LayoutComponent implements OnInit, OnDestroy {
  sidebarCollapsed = false;
  mobileMenuOpen = false;
  currentUser$: Observable<User | null> = this.authService.user$;
  theme$: Observable<Theme> = this.themeService.theme$;
  organizations$: Observable<Organization[]> = this.store.select(selectOrganizations);
  selectedOrg$: Observable<Organization | null> = this.store.select(selectSelectedOrganization);

  private destroy$ = new Subject<void>();

  allNavItems: NavItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
    { label: 'Órdenes de Trabajo', icon: 'assignment', route: '/work-orders' },
    { label: 'Reportes Diarios', icon: 'description', route: '/daily-reports' },
    { label: 'Inspecciones', icon: 'fact_check', route: '/inspections' },
    { label: 'Procesos', icon: 'account_tree', route: '/processes' },
    { label: 'Activos', icon: 'inventory_2', route: '/assets' },
    { label: 'Documentos', icon: 'description', route: '/documents' },
    { label: 'Riesgos', icon: 'gpp_maybe', route: '/risks' },
    { label: 'Controles', icon: 'security', route: '/controls' },
    { label: 'Incidentes', icon: 'warning', route: '/incidents' },
    { label: 'Auditorías', icon: 'fact_check', route: '/audits' },
    { label: 'Capacitación', icon: 'school', route: '/training' },
    { label: 'Candidatos', icon: 'people', route: '/candidates' },
    { label: 'Gestión Humana', icon: 'groups', route: '/gestion-humana' },
    { label: 'Usuarios', icon: 'supervisor_account', route: '/users', roles: ['admin'] },
    { label: 'Roles', icon: 'admin_panel_settings', route: '/roles', roles: ['admin'] },
    { label: 'IA', icon: 'smart_toy', route: '/ai' },
  ];

  navItems$ = this.currentUser$.pipe(
    map((user: User | null) => {
      const userRoles = user?.roles || [];
      return this.allNavItems.filter(item =>
        !item.roles || item.roles.some(r => userRoles.includes(r))
      );
    })
  );

  constructor(
    private authService: AuthService,
    private themeService: ThemeService,
    private router: Router,
    private store: Store<AppState>
  ) {}

  ngOnInit(): void {
    this.store.dispatch(OrgActions.loadOrganizations({ page: 1, pageSize: 50 }));

    this.organizations$.pipe(takeUntil(this.destroy$)).subscribe(orgs => {
      if (orgs.length > 0) {
        this.store.select(selectSelectedOrganization).pipe(takeUntil(this.destroy$)).subscribe(sel => {
          if (!sel) {
            this.store.dispatch(OrgActions.setSelectedOrganization({ id: orgs[0].id }));
          }
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onOrgChange(orgId: string): void {
    this.store.dispatch(OrgActions.setSelectedOrganization({ id: orgId }));
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  isActive(route: string): boolean {
    return this.router.url.startsWith(route);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
