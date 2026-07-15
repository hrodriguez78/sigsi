import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Toast } from '../models';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  toasts$: Observable<Toast[]> = this.toastsSubject.asObservable();

  show(type: Toast['type'], message: string, duration = 5000): void {
    const toast: Toast = {
      id: crypto.randomUUID(),
      type,
      message,
      duration,
    };

    const current = this.toastsSubject.value;
    this.toastsSubject.next([...current, toast]);

    if (duration > 0) {
      setTimeout(() => this.dismiss(toast.id), duration);
    }
  }

  success(message: string): void {
    this.show('success', message);
  }

  error(message: string): void {
    this.show('error', message, 8000);
  }

  warning(message: string): void {
    this.show('warning', message, 6000);
  }

  info(message: string): void {
    this.show('info', message);
  }

  dismiss(id: string): void {
    const current = this.toastsSubject.value.filter((t) => t.id !== id);
    this.toastsSubject.next(current);
  }
}
