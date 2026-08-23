import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, ToastNotification } from '../../services/notification.service';

@Component({
  selector: 'app-luxury-popup',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './luxury-popup.component.html',
  styleUrl: './luxury-popup.component.scss'
})
export class LuxuryPopupComponent {
  protected readonly notificationService = inject(NotificationService);
  protected readonly notifications = this.notificationService.notifications;

  protected close(id: string): void {
    this.notificationService.remove(id);
  }

  protected getIcon(type: string): string {
    switch (type) {
      case 'success': return '✓';
      case 'error': return '✕';
      case 'warning': return '⚠️';
      default: return 'ℹ️';
    }
  }
}
