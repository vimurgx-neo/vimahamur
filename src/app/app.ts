import { Component, inject, signal, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Event, NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { AuthService } from './shared/services/auth.service';
import { VimahamurService } from './shared/services/vimahamur.service';
import { NotificationService } from './shared/services/notification.service';
import { LuxuryPopupComponent } from './shared/components/luxury-popup/luxury-popup.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet, RouterLink, RouterLinkActive, LuxuryPopupComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly router = inject(Router);
  private readonly titleService = inject(Title);
  private readonly metaService = inject(Meta);
  private readonly notificationService = inject(NotificationService);
  protected readonly authService = inject(AuthService);
  protected readonly estateService = inject(VimahamurService);

  protected readonly title = signal('Vimahamur Luxury Property');
  protected readonly isAdminRoute = signal(false);
  protected readonly isAuthRoute = signal(false);
  protected readonly isHomeRoute = signal(false);
  protected readonly isScrolled = signal(false);

  protected readonly showSavedModal = signal(false);
  protected readonly showMobileMenu = signal(false);
  protected newsletterEmail = signal('');

  protected readonly currentUser = this.authService.currentUser;
  protected readonly isAuthenticated = this.authService.isAuthenticated;

  protected readonly savedProperties = computed(() => {
    const user = this.currentUser();
    if (!user || !user.savedProperties) return [];
    const allProps = this.estateService.properties();
    return allProps.filter(p => p._id && user.savedProperties?.includes(p._id));
  });

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    const scrollPos = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    this.isScrolled.set(scrollPos > 50);
  }

  constructor() {
    this.syncRouteFlags(this.router.url);
    this.applySeoMetadata(this.router.url);

    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        this.syncRouteFlags(event.urlAfterRedirects);
        this.applySeoMetadata(event.urlAfterRedirects);
        this.showMobileMenu.set(false);
      }
    });
  }

  protected toggleMobileMenu(): void {
    this.showMobileMenu.update(v => !v);
  }

  protected toggleSavedModal(): void {
    this.showSavedModal.update(v => !v);
  }

  protected logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  protected subscribeNewsletter(): void {
    const email = this.newsletterEmail().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      this.notificationService.showError('Invalid Email', 'Please enter a valid email address to subscribe.');
      return;
    }
    this.notificationService.showSuccess('Subscribed Successfully! ✨', 'You are now registered for private pre-launch plot announcements.');
    this.newsletterEmail.set('');
  }

  private syncRouteFlags(url: string): void {
    const cleanUrl = url.split('?')[0];
    this.isHomeRoute.set(cleanUrl === '/' || cleanUrl === '');
    this.isAdminRoute.set(cleanUrl.startsWith('/admin'));
    this.isAuthRoute.set(cleanUrl === '/login' || cleanUrl === '/register' || cleanUrl === '/signup');
  }

  private applySeoMetadata(url: string): void {
    const snapshot = this.router.routerState.snapshot.root;
    const routeData = this.findRouteData(snapshot);
    const pageTitle = (routeData['title'] as string | undefined) ?? 'Vimahamur Luxury Property';
    const description =
      (routeData['description'] as string | undefined) ??
      'Vimahamur Luxury Property offers premium real estate discovery with elegant lead generation and enterprise-ready UX.';

    this.title.set(pageTitle);
    this.titleService.setTitle(pageTitle);
    this.metaService.updateTag({ name: 'description', content: description });
    this.metaService.updateTag({ property: 'og:title', content: pageTitle });
    this.metaService.updateTag({ property: 'og:description', content: description });
    this.metaService.updateTag({ property: 'og:type', content: 'website' });
    this.metaService.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.metaService.updateTag({ name: 'twitter:title', content: pageTitle });
    this.metaService.updateTag({ name: 'twitter:description', content: description });

    const canonicalLink = document.querySelector('link[rel="canonical"]') ?? document.createElement('link');
    canonicalLink.setAttribute('rel', 'canonical');
    canonicalLink.setAttribute('href', `https://vimahamurluxuryproperty.example${url || '/'}`);
    if (!canonicalLink.parentElement) {
      document.head.appendChild(canonicalLink);
    }
  }

  private findRouteData(route: any): Record<string, unknown> {
    if (!route) {
      return {};
    }

    if (route.data && Object.keys(route.data).length > 0) {
      return route.data;
    }

    return this.findRouteData(route.firstChild);
  }
}
