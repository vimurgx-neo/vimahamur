import { Injectable, signal } from '@angular/core';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface ToastNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration: number;
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  readonly notifications = signal<ToastNotification[]>([]);

  showSuccess(title: string, message: string, duration = 4500): void {
    this.addNotification('success', title, message, duration);
  }

  showError(title: string, message: string, duration = 5500): void {
    this.addNotification('error', title, message, duration);
  }

  showWarning(title: string, message: string, duration = 4500): void {
    this.addNotification('warning', title, message, duration);
  }

  showInfo(title: string, message: string, duration = 4000): void {
    this.addNotification('info', title, message, duration);
  }

  private addNotification(type: NotificationType, title: string, message: string, duration: number): void {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const notification: ToastNotification = {
      id,
      type,
      title,
      message,
      duration,
      timestamp: Date.now()
    };

    this.notifications.update(current => [notification, ...current.slice(0, 3)]);

    if (duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, duration);
    }
  }

  remove(id: string): void {
    this.notifications.update(current => current.filter(n => n.id !== id));
  }

  clearAll(): void {
    this.notifications.set([]);
  }
}
