import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { SearchService, SearchResult } from '../../../core/services/search.service';

@Component({
  selector: 'app-search',
  template: `
    <div class="search-wrapper" [class.active]="isOpen">
      <div class="search-input-wrapper">
        <span class="material-icons search-icon">search</span>
        <input
          type="text"
          class="search-input"
          placeholder="Buscar... (Ctrl+K)"
          [(ngModel)]="query"
          (input)="onSearch()"
          (focus)="isOpen = true"
          #searchInput>
        <span class="material-icons close-icon" *ngIf="query" (click)="clear()">close</span>
      </div>

      <div class="search-results" *ngIf="isOpen && results.length > 0">
        <a *ngFor="let result of results"
           class="search-result"
           (click)="navigate(result)">
          <span class="result-module">{{ result.module }}</span>
          <span class="result-title">{{ result.title }}</span>
          <span class="result-desc" *ngIf="result.description">{{ result.description }}</span>
        </a>
      </div>

      <div class="search-empty" *ngIf="isOpen && query.length >= 2 && results.length === 0">
        No se encontraron resultados
      </div>
    </div>
  `,
  styles: [`
    .search-wrapper { position: relative; }
    .search-input-wrapper {
      display: flex; align-items: center; gap: 0.5rem;
      background: var(--bg-secondary); border: 1px solid var(--border-color);
      border-radius: 8px; padding: 0.375rem 0.75rem; transition: all 0.2s;
    }
    .search-wrapper.active .search-input-wrapper { border-color: var(--primary-color); box-shadow: 0 0 0 2px rgba(233,69,96,0.15); }
    .search-icon { color: var(--text-muted); font-size: 1.1rem; }
    .search-input {
      border: none; background: none; outline: none; flex: 1;
      font-size: 0.875rem; color: var(--text-primary); min-width: 200px;
    }
    .search-input::placeholder { color: var(--text-muted); }
    .close-icon { color: var(--text-muted); cursor: pointer; font-size: 1rem; padding: 0.25rem; border-radius: 4px; }
    .close-icon:hover { background: var(--bg-tertiary); }
    .search-results {
      position: absolute; top: 100%; left: 0; right: 0; margin-top: 0.25rem;
      background: var(--bg-primary); border: 1px solid var(--border-color);
      border-radius: 8px; box-shadow: 0 8px 24px rgba(0,0,0,0.12);
      max-height: 400px; overflow-y: auto; z-index: 100;
    }
    .search-result {
      display: flex; flex-direction: column; padding: 0.75rem 1rem;
      cursor: pointer; text-decoration: none; color: var(--text-primary);
      border-bottom: 1px solid var(--border-color); transition: background 0.15s;
    }
    .search-result:hover { background: var(--bg-secondary); }
    .search-result:last-child { border-bottom: none; }
    .result-module { font-size: 0.65rem; text-transform: uppercase; color: var(--primary-color); font-weight: 600; letter-spacing: 0.5px; }
    .result-title { font-size: 0.875rem; font-weight: 500; }
    .result-desc { font-size: 0.75rem; color: var(--text-muted); margin-top: 0.125rem; }
    .search-empty { padding: 1rem; text-align: center; color: var(--text-muted); font-size: 0.875rem; }
  `]
})
export class SearchComponent implements OnInit, OnDestroy {
  query = '';
  results: SearchResult[] = [];
  isOpen = false;
  private sub?: Subscription;

  constructor(private searchService: SearchService, private router: Router) {}

  ngOnInit(): void {
    this.sub = this.searchService.searchResults$.subscribe(results => {
      this.results = results;
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(e: KeyboardEvent): void {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      this.isOpen = true;
      setTimeout(() => document.querySelector<HTMLInputElement>('.search-input')?.focus(), 0);
    }
    if (e.key === 'Escape') {
      this.isOpen = false;
    }
  }

  @HostListener('document:click', ['$event'])
  onDocClick(e: Event): void {
    if (!(e.target as HTMLElement).closest('.search-wrapper')) {
      this.isOpen = false;
    }
  }

  onSearch(): void {
    this.searchService.updateQuery(this.query);
  }

  clear(): void {
    this.query = '';
    this.results = [];
    this.searchService.clear();
  }

  navigate(result: SearchResult): void {
    this.router.navigate([result.route]);
    this.isOpen = false;
    this.clear();
  }
}
