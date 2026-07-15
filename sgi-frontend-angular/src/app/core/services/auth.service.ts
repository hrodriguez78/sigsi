import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { User, TokenResponse } from '../models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private userSubject = new BehaviorSubject<User | null>(null);
  private tokenSubject = new BehaviorSubject<string | null>(
    localStorage.getItem('token')
  );

  user$: Observable<User | null> = this.userSubject.asObservable();
  token$: Observable<string | null> = this.tokenSubject.asObservable();

  constructor(private api: ApiService, private router: Router) {
    if (this.tokenSubject.value) {
      this.loadUser();
    }
  }

  get isLoggedIn(): boolean {
    return !!this.tokenSubject.value;
  }

  get currentUser(): User | null {
    return this.userSubject.value;
  }

  login(email: string, password: string): Observable<TokenResponse> {
    return this.api
      .post<TokenResponse>('/auth/login', { email, password })
      .pipe(
        tap((res) => {
          localStorage.setItem('token', res.access_token);
          this.tokenSubject.next(res.access_token);
          this.loadUser();
        })
      );
  }

  register(data: {
    email: string;
    password: string;
    full_name: string;
  }): Observable<User> {
    return this.api.post<User>('/auth/register', data);
  }

  logout(): void {
    localStorage.removeItem('token');
    this.tokenSubject.next(null);
    this.userSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  private loadUser(): void {
    this.api.get<User>('/auth/me').subscribe({
      next: (user) => this.userSubject.next(user),
      error: () => this.logout(),
    });
  }
}
