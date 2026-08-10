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
export class EstateOsService {
  private readonly http = inject(HttpClient);

  // Core Dynamic Signals loaded from DB
  readonly properties = signal<PropertyListing[]>([
    {
      slug: 'meridian-heights',
      name: 'Meridian Heights',
      price: '₹1.85 Cr',
      priceValue: 185,
      location: 'Whitefield, Bengaluru',
      area: '2,340 sq ft',
      type: 'Luxury Villas',
      image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=80',
      featured: true,
      category: 'Luxury Villas',
      description: 'A premium villa enclave with panoramic gardens, private lounge decks, and concierge support.',
      gallery: [
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80',
      ],
      floorPlans: ['Ground Floor • 4 BHK • 2,340 sq ft', 'Upper Floor • 3 BHK • 1,620 sq ft'],
      amenities: ['Infinity Pool', 'Clubhouse', 'Smart Security', 'Gymnasium'],
      nearbyPlaces: ['Whitefield Metro', 'ITPL', 'Phoenix Marketcity'],
    },
    {
      slug: 'aria-residences',
      name: 'The Aria Residences',
      price: '₹92 Lakh',
      priceValue: 92,
      location: 'Kharadi, Pune',
      area: '1,820 sq ft',
      type: 'Premium Apartments',
      image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=900&q=80',
      featured: true,
      category: 'Luxury Villas',
      description: 'Modern apartments with green balconies, robust community amenities, and quick commute access.',
      gallery: [
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=900&q=80',
      ],
      floorPlans: ['2 BHK • 1,820 sq ft', '3 BHK • 2,240 sq ft'],
      amenities: ['Rooftop Lounge', 'Spa', 'Children’s Play Area', 'EV Charging'],
      nearbyPlaces: ['EON Free Zone', 'Kharadi IT Park', 'Airport Road'],
    },
    {
      slug: 'azure-corporate-hub',
      name: 'Azure Corporate Hub',
      price: '₹4.6 Cr',
      priceValue: 460,
      location: 'Guindy, Chennai',
      area: '3,600 sq ft',
      type: 'Commercial Space',
      image: 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80',
      featured: true,
      category: 'Commercial',
      description: 'A strategic mixed-use commercial development built to serve high-growth businesses and premium tenants.',
      gallery: [
        'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80',
      ],
      floorPlans: ['Executive Floor • 1,900 sq ft', 'Office Suite • 2,300 sq ft'],
      amenities: ['Business Lounge', 'Parking', 'Power Backup', 'Café'],
      nearbyPlaces: ['Guindy Industrial Estate', 'Chennai Central', 'IIT Madras'],
    },
    {
      slug: 'sunset-plot-vista',
      name: 'Sunset Plot Vista',
      price: '₹68 Lakh',
      priceValue: 68,
      location: 'Nandi Hills, Bengaluru',
      area: '2,800 sq ft',
      type: 'Plots',
      image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=900&q=80',
      featured: false,
      category: 'Premium Plots',
      description: 'Prime development-ready plots near scenic growth corridors with road frontage and utility access.',
      gallery: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=900&q=80'],
      floorPlans: ['Plot Layout • 2,800 sq ft'],
      amenities: ['Road Access', 'Water Line', 'Gated Entry', 'Community Park'],
      nearbyPlaces: ['Nandi Hills', 'Devanahalli Airport', 'Kempegowda Expressway'],
    },
    {
      slug: 'greenwood-meadows',
      name: 'Greenwood Meadows',
      price: '₹1.15 Cr',
      priceValue: 115,
      location: 'Sarjapur Road, Bengaluru',
      area: '2,100 sq ft',
      type: 'Luxury Villas',
      image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=900&q=80',
      featured: false,
      category: 'Luxury Villas',
      description: 'Spacious villas surrounded by organic greens, walking trails, and modern lifestyle clubhouses.',
      gallery: ['https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=900&q=80'],
      floorPlans: ['3 BHK Villa • 2,100 sq ft'],
      amenities: ['Tennis Court', 'Clubhouse', 'Rainwater Harvesting', 'Yoga Deck'],
      nearbyPlaces: ['Sarjapur Metro', 'Decathlon Sarjapur', 'Wipro Office'],
    },
    {
      slug: 'vantage-suites',
      name: 'Vantage Suites',
      price: '₹75 Lakh',
      priceValue: 75,
      location: 'Gachibowli, Hyderabad',
      area: '1,200 sq ft',
      type: 'Premium Apartments',
      image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=900&q=80',
      featured: false,
      category: 'Luxury Villas',
      description: 'Executive suites situated perfectly in Hyderabad IT corridor, delivering high yield for investors.',
      gallery: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=900&q=80'],
      floorPlans: ['1 BHK Suite • 750 sq ft', '2 BHK Suite • 1,200 sq ft'],
      amenities: ['Rooftop Pool', 'Concierge Desk', 'Gym', 'Business Center'],
      nearbyPlaces: ['Gachibowli Stadium', 'DLF Cybercity', 'Outer Ring Road'],
    },
    {
      slug: 'grand-plaza-mall',
      name: 'Grand Plaza Mall',
      price: '₹12.5 Cr',
      priceValue: 1250,
      location: 'Andheri West, Mumbai',
      area: '8,500 sq ft',
      type: 'Commercial Space',
      image: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=900&q=80',
      featured: true,
      category: 'Commercial',
      description: 'Prime retail space located in Mumbai high-footfall business zone, featuring double height showroom spaces.',
      gallery: ['https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=900&q=80'],
      floorPlans: ['Ground Floor Showroom • 5,000 sq ft', 'First Floor Retail • 3,500 sq ft'],
      amenities: ['Escalators', 'Central AC', 'Security Cameras', 'Valet Parking'],
      nearbyPlaces: ['Andheri Railway Station', 'Link Road', 'Infinity Mall'],
    },
    {
      slug: 'emerald-haven-plots',
      name: 'Emerald Haven Plots',
      price: '₹45 Lakh',
      priceValue: 45,
      location: 'Bypass Road, Salem',
      area: '1,500 sq ft',
      type: 'Premium Plots',
      image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80',
      featured: true,
      category: 'Premium Plots',
      description: 'Modern gated plot development in high-growth bypass corridor with excellent highway connectivity.',
      gallery: ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80'],
      floorPlans: ['Standard Plot Layout • 1,500 sq ft'],
      amenities: ['Blacktop Roads', 'Water Supply', 'Solar Street Lights', 'Gated Community'],
      nearbyPlaces: ['Salem Bypass', 'Central Bus Stand', 'Grand Mall'],
    },
    {
      slug: 'cauvery-vista-residences',
      name: 'Cauvery Vista Residences',
      price: '₹1.25 Cr',
      priceValue: 125,
      location: 'Cantonment Area, Trichy',
      area: '2,200 sq ft',
      type: 'Luxury Villas',
      image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=600&q=80',
      featured: true,
      category: 'Luxury Villas',
      description: 'Premium independent luxury villas featuring contemporary layouts and serene landscape views.',
      gallery: ['https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=600&q=80'],
      floorPlans: ['3 BHK Villa • 2,200 sq ft'],
      amenities: ['Clubhouse', 'Children Play Area', '24/7 Security', 'Jogging Track'],
      nearbyPlaces: ['Cauvery River Promenade', 'NIT Trichy', 'Srirangam Temple'],
    },
    {
      slug: 'western-ghats-enclave',
      name: 'Western Ghats Enclave',
      price: '₹2.1 Cr',
      priceValue: 210,
      location: 'Avinashi Road, Coimbatore',
      area: '3,100 sq ft',
      type: 'Luxury Villas',
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80',
      featured: true,
      category: 'Luxury Villas',
      description: 'Stunning luxury villa enclave located in Coimbatore foothills with custom design plans.',
      gallery: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80'],
      floorPlans: ['4 BHK Villa • 3,100 sq ft'],
      amenities: ['Private Swimming Pool', 'Gymnasium', 'Landscaped Gardens', 'EV Charging'],
      nearbyPlaces: ['Peelamedu IT Hub', 'KG Hospital', 'Coimbatore Junction'],
    },
    {
      slug: 'tranquil-greens',
      name: 'Tranquil Greens',
      price: '₹35 Lakh',
      priceValue: 35,
      location: 'Paramathi Road, Namakkal',
      area: '1,200 sq ft',
      type: 'Premium Plots',
      image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80',
      featured: false,
      category: 'Premium Plots',
      description: 'Scenic gated residential plots in peaceful Namakkal surroundings with complete utility connections.',
      gallery: ['https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80'],
      floorPlans: ['Standard Plot Layout • 1,200 sq ft'],
      amenities: ['Water Connection', 'Solar Lighting', 'Compound Wall', 'Blacktop Roads'],
      nearbyPlaces: ['Namakkal Fort', 'Paramathi Road Bypass', 'Government Hospital'],
    },
    {
      slug: 'west-salem-meadows',
      name: 'West Salem Meadows',
      price: '₹28 Lakh',
      priceValue: 28,
      location: 'Main Road, Edapadi',
      area: '1,000 sq ft',
      type: 'Premium Plots',
      image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=80',
      featured: false,
      category: 'Premium Plots',
      description: 'Budget-friendly secure plots in expanding West Salem corridor with clear documentation.',
      gallery: ['https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=80'],
      floorPlans: ['Plot Layout • 1,000 sq ft'],
      amenities: ['Security Post', 'Rainwater Harvesting', 'Internal Roads', 'Park Area'],
      nearbyPlaces: ['Edappadi Bus Stand', 'Government School', 'Salem Highway'],
    }
  ]);
  readonly blogs = signal<BlogPost[]>([]);
  readonly adminLeads = signal<LeadCard[]>([]);
  readonly adminBookings = signal<Booking[]>([]);
  readonly myBookings = signal<Booking[]>([]);

  // Static UI Signals
  readonly featuredProjects = signal<Project[]>([
    {
      name: 'Meridian Heights',
      price: '₹1.85 Cr',
      location: 'Whitefield, Bengaluru',
      area: '2,340 sq ft',
      type: 'Luxury Villas',
      image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=80',
      featured: true,
    },
    {
      name: 'The Aria Residences',
      price: '₹92 Lakh',
      location: 'Kharadi, Pune',
      area: '1,820 sq ft',
      type: 'Premium Apartments',
      image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=900&q=80',
      featured: true,
    },
    {
      name: 'Azure Corporate Hub',
      price: '₹4.6 Cr',
      location: 'Guindy, Chennai',
      area: '3,600 sq ft',
      type: 'Commercial',
      image: 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80',
      featured: true,
    },
  ]);

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
