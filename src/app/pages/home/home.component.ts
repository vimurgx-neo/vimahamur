import { CommonModule } from '@angular/common';
import { Component, inject, signal, computed, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { EstateOsService } from '../../shared/services/estate-os.service';
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
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit, AfterViewInit {
  protected readonly estateOsService = inject(EstateOsService);
  protected readonly authService = inject(AuthService);
  private readonly sanitizer = inject(DomSanitizer);

  @ViewChild('bgVideo', { static: false }) bgVideo!: ElementRef<HTMLVideoElement>;

  protected readonly properties = this.estateOsService.properties;
  protected readonly testimonials = this.estateOsService.testimonials;
  protected readonly services = this.estateOsService.services;
  protected readonly faqs = this.estateOsService.faqs;

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

  protected readonly selectedCategory = signal<string>('All');
  protected readonly activeTestimonialIndex = signal(0);
  protected readonly activeFaqIndex = signal<number | null>(null);

  protected readonly featuredProjects = computed(() => {
    const list = this.properties();
    const cat = this.selectedCategory();
    if (cat === 'All') return list.slice(0, 3);
    return list.filter((p) => p.category === cat).slice(0, 3);
  });

  protected readonly showVisitModal = signal(false);
  protected readonly showThankYou = signal(false);
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
    this.estateOsService.loadProperties();
  }

  ngAfterViewInit(): void {
    const video = this.bgVideo?.nativeElement;
    if (video) {
      video.muted = true;
      video.defaultMuted = true;
      video.volume = 0;
      video.play().catch(err => {
        console.warn('Autoplay blocked. Adding user interaction fallback.', err);
        const playOnInteraction = () => {
          video.muted = true;
          video.defaultMuted = true;
          video.volume = 0;
          video.play().then(() => {
            document.removeEventListener('click', playOnInteraction);
            document.removeEventListener('touchstart', playOnInteraction);
          }).catch(e => console.error(e));
        };
        document.addEventListener('click', playOnInteraction);
        document.addEventListener('touchstart', playOnInteraction);
      });
    }
  }

  protected openVisitModal(): void {
    this.showVisitModal.set(true);
    this.showThankYou.set(false);
  }

  protected closeVisitModal(): void {
    this.showVisitModal.set(false);
  }

  protected toggleFaq(index: number): void {
    this.activeFaqIndex.update((current) => (current === index ? null : index));
  }

  protected prevTestimonial(): void {
    const total = this.testimonials().length;
    this.activeTestimonialIndex.update((current) => (current === 0 ? total - 1 : current - 1));
  }

  protected nextTestimonial(): void {
    const total = this.testimonials().length;
    this.activeTestimonialIndex.update((current) => (current === total - 1 ? 0 : current + 1));
  }

  protected submitVisit(): void {
    if (!this.visit.name || !this.visit.phone) return;
    this.isSubmitting.set(true);
    this.estateOsService.addEnquiry({
      customer: this.visit.name,
      phone: this.visit.phone,
      property: this.visit.property,
      source: 'Site visit',
    }).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.showVisitModal.set(false);
        this.showThankYou.set(true);
        window.setTimeout(() => this.showThankYou.set(false), 4000);
      },
      error: () => {
        this.isSubmitting.set(false);
      }
    });
  }

  protected submitEnquiry(): void {
    if (!this.enquiry.name || !this.enquiry.phone) return;
    this.isSubmitting.set(true);
    this.estateOsService.addEnquiry({
      customer: this.enquiry.name,
      phone: this.enquiry.phone,
      email: this.enquiry.email,
      property: this.enquiry.property,
      budget: this.enquiry.budget,
      message: this.enquiry.message,
      source: 'Website',
    }).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.showThankYou.set(true);
        this.enquiry = {
          name: '',
          phone: '',
          email: '',
          city: '',
          property: 'Meridian Heights',
          budget: '₹1 Cr - ₹2 Cr',
          message: '',
        };
        window.setTimeout(() => this.showThankYou.set(false), 4000);
      },
      error: () => {
        this.isSubmitting.set(false);
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
