import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable, tap, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Project {
  name: string;
  price: string;
  location: string;
  area: string;
  type: string;
  image: string;
  featured: boolean;
}

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
}

export interface LeadCard {
  _id?: string;
  customer: string;
  phone: string;
  email?: string;
  property: string;
  budget?: string;
  message?: string;
  source: string;
  status: 'New' | 'Contacted' | 'Site Visit' | 'Negotiation' | 'Booked' | 'Closed';
  createdAt?: string;
}

export interface Booking {
  _id?: string;
  userId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  propertyName: string;
  propertySlug: string;
  preferredDate: string;
  preferredTime: string;
  status: 'Pending' | 'Confirmed' | 'Cancelled';
  createdAt?: string;
}

export interface PropertyListing {
  _id?: string;
  slug: string;
  name: string;
  price: string;
  priceValue: number;
  location: string;
  area: string;
  type: string;
  image: string;
  featured: boolean;
  category: 'Luxury Villas' | 'Premium Plots' | 'Commercial';
  description: string;
  gallery: string[];
  floorPlans: string[];
  amenities: string[];
  nearbyPlaces: string[];
}

export interface BlogPost {
  _id?: string;
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  author: string;
  readTime: string;
  image: string;
  content: string[];
}

export interface FaqItem {
  question: string;
  answer: string;
}

export class PropertyMapper {
  static toClient(apiData: any): PropertyListing {
    let cat: any = apiData.category;
    if (cat === 'Luxury' || cat === 'Luxury Villas') cat = 'Luxury Villas';
    if (cat === 'Plots' || cat === 'Premium Plots') cat = 'Premium Plots';
    return {
      _id: apiData._id,
      slug: apiData.slug || '',
      name: apiData.name || '',
      price: apiData.price || '',
      priceValue: apiData.priceValue || 0,
      location: apiData.location || '',
      area: apiData.area || '',
      type: apiData.type || '',
      image: apiData.image || '',
      featured: !!apiData.featured,
      category: cat,
      description: apiData.description || '',
      gallery: apiData.gallery || [],
      floorPlans: apiData.floorPlans || [],
      amenities: apiData.amenities || [],
      nearbyPlaces: apiData.nearbyPlaces || [],
    };
  }

  static toApi(clientData: Partial<PropertyListing>): any {
    let cat: any = clientData.category;
    if (cat === 'Luxury Villas' || cat === 'Luxury') cat = 'Luxury';
    if (cat === 'Premium Plots' || cat === 'Plots') cat = 'Plots';
    return {
      ...clientData,
      category: cat
    };
  }
}

@Injectable({ providedIn: 'root' })
export class VimahamurService {
  private readonly http = inject(HttpClient);

  // Core Dynamic Signals loaded from DB
  readonly properties = signal<PropertyListing[]>([]);
  readonly blogs = signal<BlogPost[]>([]);
  readonly adminLeads = signal<LeadCard[]>([]);
  readonly adminBookings = signal<Booking[]>([]);
  readonly myBookings = signal<Booking[]>([]);

  // Static UI Signals
  readonly featuredProjects = signal<Project[]>([]);

  readonly testimonials = signal<Testimonial[]>([
    {
      quote: 'The site visit experience felt premium from the very first enquiry. Every detail arrived with clarity and urgency.',
      name: 'Aparna Rao',
      role: 'Homeowner, Bengaluru',
    },
    {
      quote: 'Vimahamur Luxury Property simplified every decision. We compared floor plans, pricing, and amenities in one elegant flow.',
      name: 'Suresh & Deepa Kumar',
      role: 'Investors, Pune',
    },
    {
      quote: 'The platform made our lead response process faster, more polished, and definitely more credible with clients.',
      name: 'Farhan Sheikh',
      role: 'Sales Lead, Chennai',
    },
  ]);

  readonly faqs = signal<FaqItem[]>([
    {
      question: 'How do I book a site visit?',
      answer: 'Use the site visit form on the home page or property detail views and our team will confirm availability.',
    },
    {
      question: 'Can I compare properties before making a decision?',
      answer: 'Yes. The property listing modules are structured to help buyers compare pricing, amenities, and nearby highlights.',
    },
    {
      question: 'Do you support WhatsApp enquiries?',
      answer: 'Yes. Quick-contact actions are present throughout the experience to support fast lead capture.',
    },
  ]);

  readonly services = signal([
    'Buy Property',
    'Sell Property',
    'Rent Property',
    'Luxury Villas',
    'Premium Plots',
    'Commercial',
  ]);

  constructor() {
    // Initial fetch of public assets
    this.loadProperties();
    this.loadBlogs();
  }

  // Properties CRUD & Listing
  loadProperties(filters: any = {}): void {
    let params = new HttpParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        params = params.set(key, String(filters[key]));
      }
    });

    this.http.get<{ data: any[] }>(`${environment.apiUrl}/properties`, { params })
      .subscribe({
        next: (res) => {
          const mapped = res.data.map(p => PropertyMapper.toClient(p));
          this.properties.set(mapped);
        },
        error: (err) => console.error('Failed to load properties', err)
      });
  }

  getPropertyBySlug(slug: string): PropertyListing | undefined {
    // Check locally first
    const found = this.properties().find(p => p.slug === slug);
    if (found) return found;

    // Components can subscribe to api if not in state
    return undefined;
  }

  fetchPropertyBySlug(slug: string): Observable<{ data: PropertyListing }> {
    return this.http.get<{ data: any }>(`${environment.apiUrl}/properties/${slug}`).pipe(
      map(res => ({ data: PropertyMapper.toClient(res.data) }))
    );
  }

  createProperty(property: Omit<PropertyListing, '_id'>): Observable<{ data: PropertyListing }> {
    const payload = PropertyMapper.toApi(property);
    return this.http.post<{ data: any }>(`${environment.apiUrl}/properties`, payload).pipe(
      map(res => ({ data: PropertyMapper.toClient(res.data) })),
      tap(() => this.loadProperties())
    );
  }

  uploadImage(file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ url: string }>(`${environment.apiUrl}/properties/upload`, formData);
  }

  updateProperty(id: string, property: PropertyListing): Observable<{ data: PropertyListing }> {
    const payload = PropertyMapper.toApi(property);
    return this.http.put<{ data: any }>(`${environment.apiUrl}/properties/${id}`, payload).pipe(
      map(res => ({ data: PropertyMapper.toClient(res.data) })),
      tap(() => this.loadProperties())
    );
  }

  deleteProperty(id: string): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/properties/${id}`).pipe(
      tap(() => this.loadProperties())
    );
  }

  // Blogs CRUD & Listing
  loadBlogs(): void {
    this.http.get<{ data: BlogPost[] }>(`${environment.apiUrl}/blogs`)
      .subscribe({
        next: (res) => this.blogs.set(res.data),
        error: (err) => console.error('Failed to load blogs', err)
      });
  }

  getBlogBySlug(slug: string): BlogPost | undefined {
    return this.blogs().find((item) => item.slug === slug);
  }

  fetchBlogBySlug(slug: string): Observable<{ data: BlogPost }> {
    return this.http.get<{ data: BlogPost }>(`${environment.apiUrl}/blogs/${slug}`);
  }

  createBlog(blog: Omit<BlogPost, '_id'>): Observable<{ data: BlogPost }> {
    return this.http.post<{ data: BlogPost }>(`${environment.apiUrl}/blogs`, blog).pipe(
      tap(() => this.loadBlogs())
    );
  }

  updateBlog(id: string, blog: BlogPost): Observable<{ data: BlogPost }> {
    return this.http.put<{ data: BlogPost }>(`${environment.apiUrl}/blogs/${id}`, blog).pipe(
      tap(() => this.loadBlogs())
    );
  }

  deleteBlog(id: string): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/blogs/${id}`).pipe(
      tap(() => this.loadBlogs())
    );
  }

  // Leads CRUD (Admin Dashboard)
  loadLeads(): void {
    this.http.get<{ data: LeadCard[] }>(`${environment.apiUrl}/leads`)
      .subscribe({
        next: (res) => this.adminLeads.set(res.data),
        error: (err) => console.error('Failed to load leads', err)
      });
  }

  addEnquiry(lead: Omit<LeadCard, 'status' | 'createdAt' | '_id'>): Observable<any> {
    const payload = {
      customer: lead.customer,
      phone: lead.phone,
      email: lead.email ?? '',
      property: lead.property,
      budget: lead.budget ?? '',
      message: lead.message ?? '',
      source: lead.source
    };
    return this.http.post(`${environment.apiUrl}/leads`, payload).pipe(
      tap(() => {
        // Reload leads if admin is viewing them
        if (this.adminLeads().length > 0) {
          this.loadLeads();
        }
      })
    );
  }

  updateLeadStatus(id: string, status: string): Observable<any> {
    return this.http.put(`${environment.apiUrl}/leads/${id}`, { status }).pipe(
      tap(() => this.loadLeads())
    );
  }

  deleteLead(id: string): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/leads/${id}`).pipe(
      tap(() => this.loadLeads())
    );
  }

  // Bookings CRUD (Admin & Customer Portal)
  loadBookings(): void {
    this.http.get<{ data: Booking[] }>(`${environment.apiUrl}/bookings`)
      .subscribe({
        next: (res) => this.adminBookings.set(res.data),
        error: (err) => console.error('Failed to load bookings', err)
      });
  }

  loadMyBookings(): void {
    this.http.get<{ data: Booking[] }>(`${environment.apiUrl}/bookings/my-bookings`)
      .subscribe({
        next: (res) => this.myBookings.set(res.data),
        error: (err) => console.error('Failed to load user bookings', err)
      });
  }

  createBooking(booking: Omit<Booking, '_id' | 'status'>): Observable<any> {
    return this.http.post(`${environment.apiUrl}/bookings`, booking).pipe(
      tap(() => {
        this.loadMyBookings();
        if (this.adminBookings().length > 0) {
          this.loadBookings();
        }
      })
    );
  }

  updateBookingStatus(id: string, status: 'Pending' | 'Confirmed' | 'Cancelled'): Observable<any> {
    return this.http.put(`${environment.apiUrl}/bookings/${id}`, { status }).pipe(
      tap(() => {
        this.loadBookings();
        this.loadMyBookings();
      })
    );
  }

  deleteBooking(id: string): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/bookings/${id}`).pipe(
      tap(() => {
        this.loadBookings();
        this.loadMyBookings();
      })
    );
  }
}
