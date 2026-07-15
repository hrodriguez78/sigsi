import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppState } from '../../../store/app.reducer';
import { User } from '../../../core/models';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-users-list',
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersListComponent implements OnInit {
  users$: Observable<User[]>;
  showCreateDialog = false;
  userToEdit: User | null = null;
  loading = false;

  constructor(private store: Store<AppState>, private api: ApiService) {
    this.users$ = this.api.get<User[]>('/users');
  }

  ngOnInit(): void {}

  openCreate(): void {
    this.userToEdit = null;
    this.showCreateDialog = true;
  }

  editUser(user: User): void {
    this.userToEdit = user;
    this.showCreateDialog = true;
  }

  closeDialog(): void {
    this.showCreateDialog = false;
    this.userToEdit = null;
  }
}
