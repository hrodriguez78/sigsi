import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Organization } from '../../core/models';
import { AppState } from '../../store/app.reducer';
import {
  selectOrganizations,
  selectOrganizationsLoading,
  selectOrganizationsTotal,
} from '../../store/organizations/organizations.selectors';
import * as OrgActions from '../../store/organizations/organizations.actions';

@Component({
  selector: 'app-organizations',
  templateUrl: './organizations.component.html',
  styleUrls: ['./organizations.component.scss'],
})
export class OrganizationsComponent implements OnInit {
  organizations$: Observable<Organization[]>;
  loading$: Observable<boolean>;
  total$: Observable<number>;

  constructor(private store: Store<AppState>) {
    this.organizations$ = this.store.select(selectOrganizations);
    this.loading$ = this.store.select(selectOrganizationsLoading);
    this.total$ = this.store.select(selectOrganizationsTotal);
  }

  ngOnInit(): void {
    this.store.dispatch(OrgActions.loadOrganizations({ page: 1, pageSize: 50 }));
  }

  selectOrganization(org: Organization): void {
    this.store.dispatch(OrgActions.setSelectedOrganization({ id: org.id }));
  }
}
