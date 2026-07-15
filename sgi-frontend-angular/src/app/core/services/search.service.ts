import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, debounceTime, distinctUntilChanged, switchMap, of } from 'rxjs';

export interface SearchResult {
  module: string;
  id: string;
  title: string;
  description?: string;
  route: string;
}

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  private searchSubject = new BehaviorSubject<string>('');
  searchResults$: Observable<SearchResult[]> = this.searchSubject.pipe(
    debounceTime(300),
    distinctUntilChanged(),
    switchMap(query => query.length >= 2 ? this.search(query) : of([]))
  );

  constructor(private http: HttpClient) {}

  search(query: string): Observable<SearchResult[]> {
    const params = new HttpParams().set('q', query);
    return this.http.get<SearchResult[]>('/api/v1/search', { params });
  }

  updateQuery(query: string): void {
    this.searchSubject.next(query);
  }

  clear(): void {
    this.searchSubject.next('');
  }
}
