import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface OCRResult {
  text: string;
  word_count: number;
  language: string;
  filename: string;
  pages?: number;
  image_size?: string;
}

@Injectable({ providedIn: 'root' })
export class OCRService {
  private apiUrl = `${environment.apiUrl}/ocr`;

  constructor(private http: HttpClient) {}

  extractText(file: File, language: string = 'spa+eng'): Observable<OCRResult> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<OCRResult>(
      `${this.apiUrl}/extract?language=${language}`,
      formData
    );
  }
}
