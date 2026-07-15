import { Component } from '@angular/core';
import { OCRService, OCRResult } from '../../../core/services/ocr.service';

@Component({
  selector: 'app-ocr-extractor',
  template: `
    <div class="ocr-panel">
      <div class="ocr-header">
        <span class="material-icons">document_scanner</span>
        <h3>Extractor de Texto (OCR)</h3>
      </div>

      <div class="ocr-upload"
           [class.dragging]="isDragging"
           (dragover)="onDragOver($event)"
           (dragleave)="isDragging = false"
           (drop)="onDrop($event)"
           (click)="fileInput.click()">
        <input #fileInput type="file" accept="image/*,.pdf"
               (change)="onFileSelect($event)" hidden>
        <span class="material-icons upload-icon">cloud_upload</span>
        <p>Arrastra un archivo aquí o haz clic para seleccionar</p>
        <span class="hint">Imágenes (PNG, JPG, TIFF) o PDF — máx 50MB</span>
      </div>

      <div class="ocr-options">
        <label>Idioma:</label>
        <select [(ngModel)]="language">
          <option value="spa+eng">Español + Inglés</option>
          <option value="spa">Solo Español</option>
          <option value="eng">Solo Inglés</option>
          <option value="por">Portugués</option>
          <option value="fra">Francés</option>
          <option value="deu">Alemán</option>
        </select>
      </div>

      <div class="ocr-loading" *ngIf="loading">
        <span class="material-icons spinning">hourglass_top</span>
        <span>Procesando OCR...</span>
      </div>

      <div class="ocr-result" *ngIf="result">
        <div class="result-meta">
          <span class="meta-item">
            <span class="material-icons">text_fields</span>
            {{ result.word_count }} palabras
          </span>
          <span class="meta-item" *ngIf="result.pages">
            <span class="material-icons">description</span>
            {{ result.pages }} páginas
          </span>
          <span class="meta-item" *ngIf="result.image_size">
            <span class="material-icons">aspect_ratio</span>
            {{ result.image_size }}
          </span>
        </div>
        <div class="result-actions">
          <button class="btn-sm" (click)="copyText()">
            <span class="material-icons">content_copy</span> Copiar
          </button>
        </div>
        <textarea class="result-text" [(ngModel)]="result.text" readonly rows="12"></textarea>
      </div>

      <div class="ocr-error" *ngIf="error">
        <span class="material-icons">error</span>
        {{ error }}
      </div>
    </div>
  `,
  styles: [`
    .ocr-panel {
      background: var(--bg-primary);
      border: 1px solid var(--border-color);
      border-radius: 10px;
      padding: 1.25rem;
    }
    .ocr-header {
      display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem;
      .material-icons { color: var(--primary-color); }
      h3 { margin: 0; font-size: 1rem; color: var(--text-primary); }
    }
    .ocr-upload {
      border: 2px dashed var(--border-color); border-radius: 10px;
      padding: 2rem; text-align: center; cursor: pointer;
      transition: all 0.15s; margin-bottom: 1rem;
      &:hover, &.dragging { border-color: var(--primary-color); background: var(--primary-color)08; }
      .upload-icon { font-size: 2.5rem; color: var(--text-muted); margin-bottom: 0.5rem; display: block; }
      p { margin: 0 0 0.25rem; color: var(--text-primary); font-size: 0.875rem; }
      .hint { font-size: 0.75rem; color: var(--text-muted); }
    }
    .ocr-options {
      display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem;
      label { font-size: 0.875rem; font-weight: 600; color: var(--text-primary); }
      select {
        padding: 0.375rem 0.75rem; border: 1px solid var(--border-color);
        border-radius: 6px; background: var(--bg-secondary); color: var(--text-primary);
        font-size: 0.875rem;
      }
    }
    .ocr-loading {
      display: flex; align-items: center; gap: 0.5rem;
      padding: 1rem; color: var(--primary-color); font-size: 0.875rem;
      .spinning { animation: spin 1s linear infinite; }
    }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    .ocr-result {
      .result-meta {
        display: flex; gap: 1rem; margin-bottom: 0.75rem; flex-wrap: wrap;
      }
      .meta-item {
        display: flex; align-items: center; gap: 0.25rem;
        font-size: 0.8125rem; color: var(--text-muted);
        .material-icons { font-size: 0.875rem; }
      }
      .result-actions { margin-bottom: 0.5rem; }
      .result-text {
        width: 100%; padding: 0.75rem; border: 1px solid var(--border-color);
        border-radius: 6px; background: var(--bg-secondary); color: var(--text-primary);
        font-size: 0.8125rem; font-family: monospace; resize: vertical; box-sizing: border-box;
      }
    }
    .ocr-error {
      display: flex; align-items: center; gap: 0.5rem;
      padding: 0.75rem; color: var(--danger, #EF4444); font-size: 0.875rem;
      background: var(--danger, #EF4444)10; border-radius: 6px;
    }
    .btn-sm {
      display: inline-flex; align-items: center; gap: 0.25rem;
      padding: 0.375rem 0.75rem; border: 1px solid var(--border-color);
      border-radius: 6px; background: var(--bg-secondary); color: var(--text-primary);
      cursor: pointer; font-size: 0.8125rem;
      &:hover { background: var(--bg-hover); }
      .material-icons { font-size: 0.875rem; }
    }
  `]
})
export class OcrExtractorComponent {
  isDragging = false;
  loading = false;
  result: OCRResult | null = null;
  error = '';
  language = 'spa+eng';

  constructor(private ocrService: OCRService) {}

  onDragOver(e: DragEvent) {
    e.preventDefault();
    this.isDragging = true;
  }

  onDrop(e: DragEvent) {
    e.preventDefault();
    this.isDragging = false;
    const file = e.dataTransfer?.files?.[0];
    if (file) this.processFile(file);
  }

  onFileSelect(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) this.processFile(file);
    input.value = '';
  }

  private processFile(file: File) {
    this.result = null;
    this.error = '';
    this.loading = true;

    this.ocrService.extractText(file, this.language).subscribe({
      next: (res) => { this.result = res; this.loading = false; },
      error: (err) => { this.error = err.error?.detail || 'Error al procesar el archivo'; this.loading = false; },
    });
  }

  copyText() {
    if (this.result?.text) {
      navigator.clipboard.writeText(this.result.text);
    }
  }
}
