import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { VimahamurService, PropertyListing } from '../../shared/services/vimahamur.service';
import { AuthService } from '../../shared/services/auth.service';
import { NotificationService } from '../../shared/services/notification.service';

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

  private readonly notificationService = inject(NotificationService);

  private validatePhone(phone: string): boolean {
    const cleaned = phone.replace(/[\s\-()]/g, '');
    return /^[+]?[0-9]{10,15}$/.test(cleaned);
  }

  private validateEmail(email: string): boolean {
    if (!email) return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  protected submitSiteVisit(): void {
    const name = this.visit.name.trim();
    const phone = this.visit.phone.trim();

    if (!name || name.length < 2) {
      this.notificationService.showError('Validation Failed', 'Please enter your full name (at least 2 characters).');
      return;
    }

    if (!this.validatePhone(phone)) {
      this.notificationService.showError('Invalid Phone Number', 'Please enter a valid 10-digit mobile number.');
      return;
    }

    if (!this.visit.date) {
      this.notificationService.showError('Date Required', 'Please select a preferred date for your private tour.');
      return;
    }

    this.isSubmitting.set(true);
    this.vimahamurService.createBooking({
      customerName: name,
      customerPhone: phone,
      customerEmail: 'visitor@vimahamurluxuryproperty.local',
      propertyName: this.visit.property || this.property()?.name || 'Vimahamur Luxury Property',
      propertySlug: this.slug,
      preferredDate: this.visit.date,
      preferredTime: this.visit.time
    }).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.notificationService.showSuccess(
          'Private Site Tour Requested! ✨',
          `Thank you ${name}. Our layout specialist will coordinate with you for ${this.property()?.name || 'this property'}.`
        );
        this.visit.name = '';
        this.visit.phone = '';
        this.visit.date = '';
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.notificationService.showError('Booking Error', err.error?.message ?? 'Could not schedule tour. Please try again.');
      }
    });
  }

  protected submitEnquiry(): void {
    const name = this.enquiry.name.trim();
    const phone = this.enquiry.phone.trim();
    const email = this.enquiry.email.trim();

    if (!name || name.length < 2) {
      this.notificationService.showError('Validation Failed', 'Please enter your name.');
      return;
    }

    if (!this.validatePhone(phone)) {
      this.notificationService.showError('Invalid Phone Number', 'Please enter a valid 10-digit mobile phone number.');
      return;
    }

    if (email && !this.validateEmail(email)) {
      this.notificationService.showError('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    this.isSubmitting.set(true);
    this.vimahamurService.addEnquiry({
      customer: name,
      phone: phone,
      email: email,
      property: this.property()?.name || 'Vimahamur Luxury Property',
      message: this.enquiry.message,
      source: 'Property Details Page'
    }).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.notificationService.showSuccess(
          'Enquiry Received! 🌟',
          `Thank you ${name}! Our senior property consultant will send complete layout brochures and pricing details.`
        );
        this.enquiry.name = '';
        this.enquiry.phone = '';
        this.enquiry.email = '';
        this.enquiry.message = '';
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.notificationService.showError('Submission Error', err.error?.message ?? 'Failed to send enquiry. Please try again.');
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
      this.notificationService.showWarning('Sign In Required', 'Please sign in to bookmark this property to your account.');
      return;
    }
    if (this.isSaved(propertyId)) {
      this.authService.removeFromSavedProperties(propertyId).subscribe({
        next: () => this.notificationService.showInfo('Property Removed', 'Listing removed from your saved bookmarks.')
      });
    } else {
      this.authService.addToSavedProperties(propertyId).subscribe({
        next: () => this.notificationService.showSuccess('Property Saved! ❤️', 'Listing added to your saved collection.')
      });
    }
  }
}
