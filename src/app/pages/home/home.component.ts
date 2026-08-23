import { CommonModule } from '@angular/common';
import { Component, inject, signal, computed, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { VimahamurService } from '../../shared/services/vimahamur.service';
import { AuthService } from '../../shared/services/auth.service';
import { NotificationService } from '../../shared/services/notification.service';

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
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit, AfterViewInit {
  @ViewChild('bgVideo') bgVideo!: ElementRef<HTMLVideoElement>;

  protected readonly vimahamurService = inject(VimahamurService);
  protected readonly authService = inject(AuthService);
  protected readonly sanitizer = inject(DomSanitizer);
  private readonly notificationService = inject(NotificationService);

  protected readonly properties = this.vimahamurService.properties;

  protected readonly cities: CityLocation[] = [
    {
      id: 'salem',
      name: 'Salem',
      badge: 'Main Operational Hub',
      description: 'Strategic junction connecting Bangalore & Coimbatore express corridors with high-growth residential plots.',
      embedUrl: 'https://maps.google.com/maps?q=Salem,%20Tamil%20Nadu&t=&z=13&ie=UTF8&iwloc=&output=embed',
      directionUrl: 'https://www.google.com/maps?q=Salem,+Tamil+Nadu',
      officeAddress: '124 Junction Main Road, Five Roads, Salem, Tamil Nadu - 636004',
      phone: '+91 90953 92629',
      highlights: ['DTCP Clear Titles', '100 ft Arterial Access', 'Underground Drainage Ready']
    },
    {
      id: 'trichy',
      name: 'Trichy',
      badge: 'Educational & Aviation Core',
      description: 'Central Tamil Nadu transit & international aviation hub ideal for high-yield long-term land investment.',
      embedUrl: 'https://maps.google.com/maps?q=Tiruchirappalli,%20Tamil%20Nadu&t=&z=13&ie=UTF8&iwloc=&output=embed',
      directionUrl: 'https://www.google.com/maps?q=Tiruchirappalli,+Tamil+Nadu',
      officeAddress: '45 Cantonment Promenade, Near Central Bus Stand, Trichy, Tamil Nadu - 620001',
      phone: '+91 90953 92629',
      highlights: ['International Airport Link', 'Tier-1 IT Park Proximity', 'RERA Compliant Enclaves']
    },
    {
      id: 'namakkal',
      name: 'Namakkal',
      badge: 'Agro & Industrial Belt',
      description: 'Rapidly emerging transport and logistics corridor offering peaceful, scenic, and gated plot developments.',
      embedUrl: 'https://maps.google.com/maps?q=Namakkal,%20Tamil%20Nadu&t=&z=13&ie=UTF8&iwloc=&output=embed',
      directionUrl: 'https://www.google.com/maps?q=Namakkal,+Tamil+Nadu',
      officeAddress: '78 Mohanur Road, Collectorate Junction, Namakkal, Tamil Nadu - 637001',
      phone: '+91 90953 92629',
      highlights: ['Gated Gated Security', 'Abundant Potable Water', 'Wide Blacktop Avenues']
    },
    {
      id: 'coimbatore',
      name: 'Coimbatore',
      badge: 'Western Industrial Hub',
      description: 'The Manchester of South India offering premium hill-view gated villa plots with state-of-the-art club amenities.',
      embedUrl: 'https://maps.google.com/maps?q=Coimbatore,%20Tamil%20Nadu&t=&z=13&ie=UTF8&iwloc=&output=embed',
      directionUrl: 'https://www.google.com/maps?q=Coimbatore,+Tamil+Nadu',
      officeAddress: '512 Avinashi Road, Peelamedu, Coimbatore, Tamil Nadu - 641004',
      phone: '+91 90953 92629',
      highlights: ['Lush Foothill Microclimate', 'Smart City Smart Infrastructure', 'Clubhouse & Parks']
    },
    {
      id: 'edapadi',
      name: 'Edapadi',
      badge: 'Prime Residential Layout',
      description: 'Scenic high-yield plot development on the Edappadi corridor with immediate registry and complete blacktop road network.',
      embedUrl: 'https://maps.google.com/maps?q=Edappadi,%20Salem,%20Tamil%20Nadu&t=&z=13&ie=UTF8&iwloc=&output=embed',
      directionUrl: 'https://www.google.com/maps?q=Edappadi,+Salem,+Tamil+Nadu',
      officeAddress: '32 Main Road, Near Bus Stand, Edapadi, Tamil Nadu - 637101',
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

  protected readonly selectedCategory = signal<string>('All');
  protected readonly activeTestimonialIndex = signal(0);
  protected readonly activeFaqIndex = signal<number | null>(null);

  protected readonly allPropertiesCount = computed(() => this.properties().length);
  protected readonly villasCount = computed(() => this.properties().filter(p => p.category === 'Luxury Villas').length);
  protected readonly plotsCount = computed(() => this.properties().filter(p => p.category === 'Premium Plots').length);
  protected readonly commercialCount = computed(() => this.properties().filter(p => p.category === 'Commercial').length);

  protected readonly featuredProjects = computed(() => {
    const list = this.properties();
    const cat = this.selectedCategory();
    let filtered = list;
    if (cat !== 'All') {
      filtered = list.filter((p) => p.category === cat);
    }
    const featured = filtered.filter(p => p.featured);
    const nonFeatured = filtered.filter(p => !p.featured);
    return [...featured, ...nonFeatured].slice(0, 6);
  });

  protected readonly testimonials = signal([
    {
      quote: 'Vimahamur helped us identify a clear-title residential enclave in Salem. The legal verification and on-site support made the investment seamless.',
      name: 'Dr. Anand Ramanathan',
      role: 'Property Investor & Consultant',
    },
    {
      quote: 'Exceptional transparency and layout infrastructure. The blacktop roads, water utilities, and gated security were exactly as promised.',
      name: 'Kavitha Sundaram',
      role: 'Homeowner, Trichy Enclave',
    },
    {
      quote: 'As an NRI investor, acquiring gated plots remotely felt daunting until I worked with Vimahamur. Highly recommended.',
      name: 'Rajesh Venkat',
      role: 'NRI Investor (Dubai)',
    },
  ]);

  protected readonly faqs = signal([
    {
      q: 'Are all listed plots DTCP & RERA approved?',
      a: 'Yes, 100% of our properties come with clear legal titles, approved layout schematics from DTCP/CMDA, and necessary regulatory filings.',
    },
    {
      q: 'Can I schedule a guided private site visit?',
      a: 'Absolutely. We provide door-to-layout site visits with our senior land consultants on any day of the week, including weekends.',
    },
    {
      q: 'What basic infrastructure is included with residential plots?',
      a: 'All gated enclaves feature wide blacktop tar roads, compound perimeter walls, 24/7 solar/LED streetlights, individual water connections, and 24/7 security.',
    },
    {
      q: 'Do you offer bank loan facilitation?',
      a: 'Yes, our projects are pre-approved by leading financial institutions including SBI, HDFC, ICICI, and Axis Bank with expedited approvals.',
    },
  ]);

  protected readonly showVisitModal = signal(false);
  protected readonly isSubmitting = signal(false);

  protected enquiry = {
    name: '',
    phone: '',
    email: '',
    city: '',
    property: 'Meridian Heights',
    budget: '₹1 Cr - ₹2 Cr',
    message: '',
  };

  protected visit = {
    name: '',
    phone: '',
    property: 'Meridian Heights',
    date: '',
    time: '12:00 PM',
  };

  ngOnInit(): void {
    this.vimahamurService.loadProperties();
  }

  ngAfterViewInit(): void {
    const video = this.bgVideo?.nativeElement;
    if (video) {
      video.muted = true;
      video.defaultMuted = true;
      video.volume = 0;
      video.play().catch(() => {});
    }
  }

  protected nextTestimonial(): void {
    this.activeTestimonialIndex.update(i => (i + 1) % this.testimonials().length);
  }

  protected prevTestimonial(): void {
    this.activeTestimonialIndex.update(i => (i - 1 + this.testimonials().length) % this.testimonials().length);
  }

  protected toggleFaq(index: number): void {
    this.activeFaqIndex.update(cur => cur === index ? null : index);
  }

  protected openVisitModal(): void {
    this.showVisitModal.set(true);
  }

  protected closeVisitModal(): void {
    this.showVisitModal.set(false);
  }

  private validatePhone(phone: string): boolean {
    const cleaned = phone.replace(/[\s\-()]/g, '');
    return /^[+]?[0-9]{10,15}$/.test(cleaned);
  }

  private validateEmail(email: string): boolean {
    if (!email) return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  protected submitVisit(): void {
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
      this.notificationService.showError('Date Required', 'Please select a preferred date for your site visit.');
      return;
    }

    this.isSubmitting.set(true);
    this.vimahamurService.addEnquiry({
      customer: name,
      phone: phone,
      property: this.visit.property,
      source: 'Site visit',
    }).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.showVisitModal.set(false);
        this.notificationService.showSuccess(
          'VIP Site Tour Scheduled! ✨',
          `Thank you ${name}. Our luxury land consultant will call you at ${phone} to confirm your private tour.`
        );
        this.visit = {
          name: '',
          phone: '',
          property: 'Meridian Heights',
          date: '',
          time: '12:00 PM',
        };
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.notificationService.showError('Booking Error', err.error?.message ?? 'Could not schedule visit. Please try again or call +91 90953 92629.');
      }
    });
  }

  protected submitEnquiry(): void {
    const name = this.enquiry.name.trim();
    const phone = this.enquiry.phone.trim();
    const email = this.enquiry.email.trim();

    if (!name || name.length < 2) {
      this.notificationService.showError('Validation Failed', 'Please enter your full name (at least 2 characters).');
      return;
    }

    if (!this.validatePhone(phone)) {
      this.notificationService.showError('Invalid Phone Number', 'Please enter a valid 10-digit mobile phone number.');
      return;
    }

    if (email && !this.validateEmail(email)) {
      this.notificationService.showError('Invalid Email Address', 'Please provide a valid email format (e.g. name@domain.com).');
      return;
    }

    this.isSubmitting.set(true);
    this.vimahamurService.addEnquiry({
      customer: name,
      phone: phone,
      email: email,
      property: this.enquiry.property,
      budget: this.enquiry.budget,
      message: this.enquiry.message,
      source: 'Website Enquiry Form',
    }).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.notificationService.showSuccess(
          'Enquiry Submitted Successfully! 🌟',
          `Thank you ${name}! Our senior property advisory team has received your enquiry and will connect with you promptly.`
        );
        this.enquiry = {
          name: '',
          phone: '',
          email: '',
          city: '',
          property: 'Meridian Heights',
          budget: '₹1 Cr - ₹2 Cr',
          message: '',
        };
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.notificationService.showError('Submission Error', err.error?.message ?? 'Failed to submit enquiry. Please try again.');
      }
    });
  }

  protected getPropertySlug(name: string): string {
    return this.properties().find((property) => property.name === name)?.slug ?? name.toLowerCase().replaceAll(' ', '-');
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
      this.notificationService.showWarning('Sign In Required', 'Please sign in to bookmark luxury properties to your account.');
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
