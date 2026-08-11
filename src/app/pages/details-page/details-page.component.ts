import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { VimahamurService, PropertyListing } from '../../shared/services/vimahamur.service';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-details-page',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './details-page.component.html',
  styleUrl: './details-page.component.scss',
})
export class DetailsPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly sanitizer = inject(DomSanitizer);
  protected readonly vimahamurService = inject(VimahamurService);
  protected readonly authService = inject(AuthService);

  protected readonly slug = this.route.snapshot.paramMap.get('slug') ?? '';
  
  protected readonly propertySignal = signal<PropertyListing | null>(null);
  protected readonly property = computed(() => this.propertySignal());
  protected readonly mapUrl = computed(() => {
    const loc = this.property()?.location ?? 'Tamil Nadu, India';
    return this.sanitizer.bypassSecurityTrustResourceUrl(`https://maps.google.com/maps?q=${encodeURIComponent(loc)}&t=&z=13&ie=UTF8&iwloc=&output=embed`);
  });
  protected readonly relatedProperties = computed(() => this.vimahamurService.properties().slice(0, 3));

  // Interactive Gallery Preview Popup
  protected readonly galleryPreviewImage = signal<string | null>(null);

  // Floor Plan Switcher
  protected readonly activeFloorPlanIndex = signal(0);

  // Mortgage Calculator Inputs
  protected readonly priceInput = signal(0);
  protected readonly downPaymentInput = signal(0);
  protected readonly interestRateInput = signal(8.5);
  protected readonly tenureInput = signal(20);

  // Mortgage Calculator Computations
  protected readonly loanAmount = computed(() => Math.max(0, this.priceInput() - this.downPaymentInput()));
  protected readonly monthlyEmi = computed(() => {
    const P = this.loanAmount();
    const annualRate = this.interestRateInput();
    const years = this.tenureInput();
    if (P <= 0 || annualRate <= 0 || years <= 0) return 0;
    
    const r = (annualRate / 12) / 100;
    const n = years * 12;
    
    const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    return Math.round(emi);
  });

  protected readonly showConfirmation = signal(false);
  protected readonly showVisitConfirmation = signal(false);
  protected readonly isSubmitting = signal(false);

  protected readonly visit = {
    name: '',
    phone: '',
    property: '',
    date: '',
    time: '11:00 AM',
  };

  protected readonly enquiry = {
    name: '',
    phone: '',
    email: '',
    message: '',
  };

  constructor() {
    // Try to load property locally first, then fallback to API
    const localProp = this.vimahamurService.properties().find(p => p.slug === this.slug);
    if (localProp) {
      this.initializeProperty(localProp);
    } else {
      this.vimahamurService.fetchPropertyBySlug(this.slug).subscribe({
        next: (res) => this.initializeProperty(res.data),
        error: (err) => console.error('Failed to fetch property details', err)
      });
    }
  }

  private initializeProperty(prop: PropertyListing): void {
    this.propertySignal.set(prop);
    this.visit.property = prop.name;
    
    // Parse numeric price from format (e.g. ₹1.85 Cr -> 185 Lakhs, ₹92 Lakh -> 92 Lakhs)
    let lakhs = 0;
    const cleanPrice = prop.price.replace(/[^\d.]/g, '');
    const val = Number.parseFloat(cleanPrice);
    if (!Number.isNaN(val)) {
      if (prop.price.includes('Cr')) {
        lakhs = val * 100;
      } else {
        lakhs = val;
      }
    }
    const rupees = lakhs * 100000;
    this.priceInput.set(rupees);
    // Set 20% default down payment
    this.downPaymentInput.set(Math.round(rupees * 0.20));
  }

  protected submitSiteVisit(): void {
    if (!this.visit.name || !this.visit.phone) return;
    this.isSubmitting.set(true);
    this.vimahamurService.createBooking({
      customerName: this.visit.name,
      customerPhone: this.visit.phone,
      customerEmail: 'visitor@vimahamurluxuryproperty.local', // default
      propertyName: this.visit.property,
      propertySlug: this.slug,
      preferredDate: this.visit.date || new Date().toISOString(),
      preferredTime: this.visit.time
    }).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.showVisitConfirmation.set(true);
        this.visit.name = '';
        this.visit.phone = '';
        window.setTimeout(() => this.showVisitConfirmation.set(false), 4000);
      },
      error: () => {
        this.isSubmitting.set(false);
      }
    });
  }

  protected submitEnquiry(): void {
    if (!this.enquiry.name || !this.enquiry.phone) return;
    this.isSubmitting.set(true);
    this.vimahamurService.addEnquiry({
      customer: this.enquiry.name,
      phone: this.enquiry.phone,
      email: this.enquiry.email,
      property: this.property()?.name || 'Vimahamur Luxury Property',
      message: this.enquiry.message,
      source: 'Property Details Page'
    }).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.showConfirmation.set(true);
        this.enquiry.name = '';
        this.enquiry.phone = '';
        this.enquiry.email = '';
        this.enquiry.message = '';
        window.setTimeout(() => this.showConfirmation.set(false), 4000);
      },
      error: () => {
        this.isSubmitting.set(false);
      }
    });
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
