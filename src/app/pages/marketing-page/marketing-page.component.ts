import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal, effect } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { map } from 'rxjs';
import { VimahamurService, PropertyListing } from '../../shared/services/vimahamur.service';
import { AuthService } from '../../shared/services/auth.service';

interface CityLocation {
  id: string;
  name: string;
  badge: string;
  description: string;
  embedUrl: string;
  directionUrl: string;
  officeAddress: string;
  phone: string;
  highlights: string[];
}

@Component({
  selector: 'app-marketing-page',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './marketing-page.component.html',
  styleUrl: './marketing-page.component.scss',
})
export class MarketingPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly vimahamurService = inject(VimahamurService);
  protected readonly authService = inject(AuthService);
  private readonly sanitizer = inject(DomSanitizer);

  protected readonly page = toSignal(
    this.route.data.pipe(map(data => (data['page'] as string | undefined) ?? 'properties')),
    { initialValue: (this.route.snapshot.data['page'] as string | undefined) ?? 'properties' }
  );
  protected readonly properties = this.vimahamurService.properties;
  protected readonly blogs = this.vimahamurService.blogs;
  protected readonly faqs = this.vimahamurService.faqs;
  protected readonly featuredProjects = computed(() => this.properties().filter((p) => p.featured));
  protected readonly compareProperties = this.vimahamurService.properties;

  protected readonly cities: CityLocation[] = [
    {
      id: 'salem',
      name: 'Salem',
      badge: 'High Growth Corridor',
      description: 'Strategic residential and villa plots with excellent national highway access and scenic hill surroundings.',
      embedUrl: 'https://maps.google.com/maps?q=Salem,%20Tamil%20Nadu&t=&z=12&ie=UTF8&iwloc=&output=embed',
      directionUrl: 'https://www.google.com/maps?q=Salem,+Tamil+Nadu',
      officeAddress: '12 Bypass Road, Near Junction, Salem, Tamil Nadu - 636004',
      phone: '+91 90953 92629',
      highlights: ['Premium Hill Vista Plots', 'NH-44 Proximity', 'Rapid Capital Appreciation']
    },
    {
      id: 'trichy',
      name: 'Trichy',
      badge: 'Transit Hub Zone',
      description: 'High-growth zones near major transit lanes, industrial corridors, and elite educational landmarks.',
      embedUrl: 'https://maps.google.com/maps?q=Tiruchirappalli,%20Tamil%20Nadu&t=&z=12&ie=UTF8&iwloc=&output=embed',
      directionUrl: 'https://www.google.com/maps?q=Tiruchirappalli,+Tamil+Nadu',
      officeAddress: '55 Cantonment Area, Shastri Road, Trichy, Tamil Nadu - 620001',
      phone: '+91 90953 92629',
      highlights: ['Elite Educational Belt', 'Upcoming IT Park', 'Airport Ring Road Access']
    },
    {
      id: 'coimbatore',
      name: 'Coimbatore',
      badge: 'Premier IT & Villa Hub',
      description: 'Ultra-premium luxury villa developments set in scenic foothills with complete urban infrastructure.',
      embedUrl: 'https://maps.google.com/maps?q=Coimbatore,%20Tamil%20Nadu&t=&z=12&ie=UTF8&iwloc=&output=embed',
      directionUrl: 'https://www.google.com/maps?q=Coimbatore,+Tamil+Nadu',
      officeAddress: '104 Avinashi Road, Peelamedu, Coimbatore, Tamil Nadu - 641004',
      phone: '+91 90953 92629',
      highlights: ['Western Ghats Climate', 'IT & Smart City Hub', 'Premium Wellness Gated Communities']
    },
    {
      id: 'namakkal',
      name: 'Namakkal',
      badge: 'Tranquil Meadows',
      description: 'Gated plot developments featuring modern internal roads, solar lighting, and clear water connections.',
      embedUrl: 'https://maps.google.com/maps?q=Namakkal,%20Tamil%20Nadu&t=&z=12&ie=UTF8&iwloc=&output=embed',
      directionUrl: 'https://www.google.com/maps?q=Namakkal,+Tamil+Nadu',
      officeAddress: '88 Paramathi Road, Namakkal, Tamil Nadu - 637001',
      phone: '+91 90953 92629',
      highlights: ['Solar-Lit Internal Roads', 'High Water Security', 'Clear Title Gated Layouts']
    },
    {
      id: 'edapadi',
      name: 'Edapadi',
      badge: 'Expansion Zone',
      description: 'New residential plots in expanding corridors with premium layout design and high investment potential.',
      embedUrl: 'https://maps.google.com/maps?q=Edappadi,%20Salem,%20Tamil%20Nadu&t=&z=13&ie=UTF8&iwloc=&output=embed',
      directionUrl: 'https://www.google.com/maps?q=Edappadi,+Salem,+Tamil+Nadu',
      officeAddress: '32 Main Road, Near Bus Stand, Edappadi, Tamil Nadu - 637101',
      phone: '+91 90953 92629',
      highlights: ['High ROI Development', 'Upcoming Bypass Junction', '24/7 Security & Compound Wall']
    }
  ];

  protected readonly selectedCityId = signal<string>('salem');

  protected readonly activeCity = computed(() => {
    return this.cities.find(c => c.id === this.selectedCityId()) || this.cities[0];
  });

  protected readonly sanitizedMapUrl = computed(() => {
    return this.sanitizer.bypassSecurityTrustResourceUrl(this.activeCity().embedUrl);
  });
  
  protected readonly showConfirmation = signal(false);
  protected readonly isSubmitting = signal(false);
  protected readonly isLoading = signal(true);

  protected readonly locationFilter = signal('');
  protected readonly typeFilter = signal('All');
  protected readonly budgetFilter = signal('All');
  protected readonly sortBy = signal('featured');
  protected readonly currentPage = signal(1);
  protected readonly pageSize = 6;

  protected readonly filteredProperties = computed(() => {
    const location = this.locationFilter().trim().toLowerCase();
    const type = this.typeFilter();
    const budget = this.budgetFilter();
    let results = this.properties();

    if (location) {
      results = results.filter(
        (item) =>
          item.location.toLowerCase().includes(location) ||
          item.name.toLowerCase().includes(location)
      );
    }

    if (type !== 'All') {
      results = results.filter((item) => item.category === type);
    }

    if (budget !== 'All') {
      results = results.filter((item) => {
        if (budget === 'Under 1 Cr') return item.priceValue < 100;
        if (budget === '1-2 Cr' || budget === '1–2 Cr' || budget === '1-2Cr') return item.priceValue >= 100 && item.priceValue <= 200;
        if (budget === 'Above 2 Cr') return item.priceValue > 200;
        return true;
      });
    }

    const sorted = [...results];
    if (this.sortBy() === 'price-low') {
      sorted.sort((a, b) => a.priceValue - b.priceValue);
    } else if (this.sortBy() === 'price-high') {
      sorted.sort((a, b) => b.priceValue - a.priceValue);
    } else {
      sorted.sort((a, b) => Number(b.featured) - Number(a.featured));
    }

    return sorted;
  });

  protected readonly totalPages = computed(() => Math.max(1, Math.ceil(this.filteredProperties().length / this.pageSize)));
  protected readonly pagedProperties = computed(() => {
    const start = (Math.min(this.currentPage(), this.totalPages()) - 1) * this.pageSize;
    return this.filteredProperties().slice(start, start + this.pageSize);
  });

  protected readonly enquiry = {
    name: '',
    phone: '',
    email: '',
    city: '',
    property: 'Meridian Heights',
    message: '',
  };

  constructor() {
    this.route.queryParams.subscribe(params => {
      const search = params['search'];
      if (search !== undefined) {
        this.locationFilter.set(search);
      }
    });

    effect(() => {
      // Track page changes to trigger a skeleton loading animation
      const currentPage = this.page();
      this.isLoading.set(true);
      window.setTimeout(() => {
        this.isLoading.set(false);
      }, 600);
    });
  }

  protected getProjectSlug(name: string): string {
    return name.toLowerCase().replaceAll(' ', '-');
  }

  protected submitEnquiry(): void {
    if (!this.enquiry.name || !this.enquiry.phone) return;
    this.isSubmitting.set(true);
    this.vimahamurService.addEnquiry({
      customer: this.enquiry.name,
      phone: this.enquiry.phone,
      email: this.enquiry.email,
      property: this.enquiry.property || 'General Enquiry',
      message: this.enquiry.city ? `Location: ${this.enquiry.city}. ${this.enquiry.message}` : this.enquiry.message,
      source: this.page() === 'contact' ? 'Contact Page Enquiry' : `Marketing page (${this.page()})`
    }).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.showConfirmation.set(true);
        this.enquiry.name = '';
        this.enquiry.phone = '';
        this.enquiry.email = '';
        this.enquiry.city = '';
        this.enquiry.property = 'Meridian Heights';
        this.enquiry.message = '';
        window.setTimeout(() => this.showConfirmation.set(false), 4000);
      },
      error: () => {
        this.isSubmitting.set(false);
      }
    });
  }

  protected applyFilters(): void {
    this.currentPage.set(1);
  }

  protected setPage(page: number): void {
    this.currentPage.set(Math.max(1, Math.min(page, this.totalPages())));
  }

  protected isSaved(propertyId: string | undefined): boolean {
    if (!propertyId) return false;
    return !!this.authService.currentUser()?.savedProperties?.includes(propertyId);
  }

  protected toggleSaveProperty(event: Event, propertyId: string | undefined): void {
    event.stopPropagation();
    event.preventDefault();
    if (!propertyId) return;
    if (!this.authService.isAuthenticated()) {
      alert('Please sign in to save properties to your account.');
      return;
    }
    if (this.isSaved(propertyId)) {
      this.authService.removeFromSavedProperties(propertyId).subscribe();
    } else {
      this.authService.addToSavedProperties(propertyId).subscribe();
    }
  }
}
