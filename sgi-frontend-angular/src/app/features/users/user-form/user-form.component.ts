import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { User } from '../../../core/models';
import { ApiService } from '../../../core/services/api.service';
import { Role } from '../../../core/models';

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss'],
})
export class UserFormComponent implements OnInit {
  @Input() user: User | null = null;
  @Output() close = new EventEmitter<void>();

  email = '';
  password = '';
  full_name = '';
  organization_id = '';
  roles: string[] = [];
  availableRoles: Role[] = [];

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.get<Role[]>('/roles').subscribe(r => this.availableRoles = r);
    if (this.user) {
      this.email = this.user.email;
      this.full_name = this.user.full_name;
      this.organization_id = this.user.organization_id || '';
      this.roles = [...this.user.roles];
    }
  }

  toggleRole(roleName: string): void {
    const idx = this.roles.indexOf(roleName);
    if (idx >= 0) this.roles.splice(idx, 1);
    else this.roles.push(roleName);
  }

  save(): void {
    if (this.user) {
      this.api.put(`/roles/users/${this.user.id}`, { role_names: this.roles }).subscribe(() => {
        this.close.emit();
      });
    } else {
      this.api.post('/auth/register', {
        email: this.email,
        password: this.password,
        full_name: this.full_name,
        organization_id: this.organization_id || null,
      }).subscribe((created: any) => {
        this.api.put(`/roles/users/${created.id}`, { role_names: this.roles }).subscribe(() => {
          this.close.emit();
        });
      });
    }
  }
}
