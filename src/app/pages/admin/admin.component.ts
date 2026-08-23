import { CommonModule } from '@angular/common';
import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { VimahamurService, PropertyListing, LeadCard, Booking, PropertyMapper } from '../../shared/services/vimahamur.service';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss',
})
export class AdminComponent implements OnInit {
  private readonly estateService = inject(VimahamurService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly properties = this.estateService.properties;
  protected readonly leads = this.estateService.adminLeads;
  protected readonly bookings = this.estateService.adminBookings;

  protected activeTab = signal<'properties' | 'leads' | 'bookings'>('properties');
  
  // Sidebar State Signals
  protected isSidebarCollapsed = signal(false);
  protected isMobileSidebarOpen = signal(false);

  // User Profile Metadata Computeds
  protected userName = computed(() => this.authService.currentUser()?.userName ?? 'Admin');
  protected userRole = computed(() => this.authService.currentUser()?.role ?? 'Administrator');
  protected userInitials = computed(() => {
    const name = this.userName();
    if (!name) return 'AD';
    return name
      .split(' ')
      .filter(n => n.length > 0)
      .map(n => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  });

  protected activeTabTitle = computed(() => {
    switch (this.activeTab()) {
      case 'properties': return 'Properties Inventory';
      case 'leads': return 'Leads & Enquiries';
      case 'bookings': return 'Site Visit Tours';
      default: return 'Dashboard';
    }
  });

  protected toggleSidebar(): void {
    this.isSidebarCollapsed.update((collapsed) => !collapsed);
  }

  protected toggleMobileSidebar(): void {
    this.isMobileSidebarOpen.update((open) => !open);
  }
  
  protected showModal = signal(false);
  protected modalMode = signal<'create' | 'edit'>('create');
  protected isSubmitting = signal(false);
  protected editingPropertyId = signal<string | null>(null);

  protected isUploadingMain = signal(false);
  protected isUploadingGallery = signal(false);

  // Form State
  protected formModel = {
    name: '',
    price: '',
    priceValue: 0,
    location: '',
    area: '',
    type: 'Premium Plots',
    category: 'Plots' as 'Luxury' | 'Luxury Villas' | 'Plots' | 'Premium Plots' | 'Commercial',
    description: '',
    image: '',
    featured: false,
    gallery: [] as string[],
    amenities: [] as string[],
    nearbyPlaces: [] as string[],
    floorPlans: [] as string[]
  };

  protected newAmenity = '';
  protected newNearby = '';
  protected newFloorPlan = '';

  ngOnInit(): void {
    this.estateService.loadProperties();
    this.estateService.loadLeads();
    this.estateService.loadBookings();
  }

  protected isClearingDb = signal(false);

  protected clearDummyData(): void {
    if (!confirm('Are you sure you want to clear all dummy seed data? This will delete all properties, blogs, leads, and bookings (Admin accounts will be preserved). This action cannot be undone.')) {
      return;
    }
    
    this.isClearingDb.set(true);
    this.authService.clearDummyData().subscribe({
      next: (res) => {
        this.isClearingDb.set(false);
        alert(res.message);
        window.location.reload();
      },
      error: (err) => {
        this.isClearingDb.set(false);
        alert(err.error?.message ?? 'Failed to clear dummy data.');
      }
    });
  }

  protected logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  protected openAddModal(): void {
    this.modalMode.set('create');
    this.editingPropertyId.set(null);
    this.formModel = {
      name: '',
      price: '₹50 Lakh',
      priceValue: 50,
      location: 'Salem, Tamil Nadu',
      area: '1,500 sq ft',
      type: 'Premium Plots',
      category: 'Plots',
      description: '',
      image: '',
      featured: false,
      gallery: [],
      amenities: ['Water Supply', 'Gated Community', 'Blacktop Roads'],
      nearbyPlaces: ['Bypass Road', 'Main Junction'],
      floorPlans: ['Ground Floor • 2 BHK • 1,500 sq ft']
    };
    this.newAmenity = '';
    this.newNearby = '';
    this.newFloorPlan = '';
    this.showModal.set(true);
  }

  protected openEditModal(property: PropertyListing): void {
    this.modalMode.set('edit');
    this.editingPropertyId.set(property._id ?? null);
    
    // Abstracted API data format conversion
    const apiProperty = PropertyMapper.toApi(property);

    this.formModel = {
      name: property.name,
      price: property.price,
      priceValue: property.priceValue,
      location: property.location,
      area: property.area,
      type: property.type,
      category: apiProperty.category,
      description: property.description,
      image: property.image,
      featured: !!property.featured,
      gallery: [...(property.gallery ?? [])],
      amenities: [...(property.amenities ?? [])],
      nearbyPlaces: [...(property.nearbyPlaces ?? [])],
      floorPlans: [...(property.floorPlans ?? [])]
    };
    this.newAmenity = '';
    this.newNearby = '';
    this.newFloorPlan = '';
    this.showModal.set(true);
  }

  protected closeModal(): void {
    this.showModal.set(false);
  }

  // Image Compression & Processing Helper
  private compressImage(file: File, maxWidth = 1600, quality = 0.85): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let { width, height } = img;
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(e.target?.result as string);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = () => resolve(e.target?.result as string);
        img.src = e.target?.result as string;
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  }

  // File Upload Handlers
  protected async onMainImageSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    
    const file = input.files[0];
    this.isUploadingMain.set(true);

    try {
      // Create high-speed compressed Data URL for instant, 100% reliable preview & persistence
      const compressedDataUrl = await this.compressImage(file, 1600, 0.88);
      if (compressedDataUrl) {
        this.formModel.image = compressedDataUrl;
      }
      this.isUploadingMain.set(false);
    } catch {
      this.isUploadingMain.set(false);
    }
  }

  protected async onGalleryImagesSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    
    this.isUploadingGallery.set(true);
    const files = Array.from(input.files);
    
    for (const file of files) {
      try {
        const compressedDataUrl = await this.compressImage(file, 1400, 0.85);
        if (compressedDataUrl) {
          this.formModel.gallery.push(compressedDataUrl);
        }
      } catch (err) {
        console.error('Failed to process gallery image', err);
      }
    }
    this.isUploadingGallery.set(false);
  }

  protected removeGalleryImage(index: number): void {
    this.formModel.gallery.splice(index, 1);
  }

  // Array Helper Methods
  protected addAmenity(): void {
    if (this.newAmenity.trim()) {
      this.formModel.amenities.push(this.newAmenity.trim());
      this.newAmenity = '';
    }
  }

  protected removeAmenity(index: number): void {
    this.formModel.amenities.splice(index, 1);
  }

  protected addNearbyPlace(): void {
    if (this.newNearby.trim()) {
      this.formModel.nearbyPlaces.push(this.newNearby.trim());
      this.newNearby = '';
    }
  }

  protected removeNearbyPlace(index: number): void {
    this.formModel.nearbyPlaces.splice(index, 1);
  }

  protected addFloorPlan(): void {
    if (this.newFloorPlan.trim()) {
      this.formModel.floorPlans.push(this.newFloorPlan.trim());
      this.newFloorPlan = '';
    }
  }

  protected removeFloorPlan(index: number): void {
    this.formModel.floorPlans.splice(index, 1);
  }

  // CRUD Operations
  protected saveProperty(): void {
    const trimmedName = this.formModel.name?.trim();
    if (!trimmedName) {
      alert('Please enter a Property Name.');
      return;
    }

    this.isSubmitting.set(true);

    // Prepare payload with default fallbacks for optional fields
    const defaultCover = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80';
    const numPrice = Number(this.formModel.priceValue);

    const payload: any = {
      ...this.formModel,
      name: trimmedName,
      price: this.formModel.price?.trim() || (numPrice > 0 ? `₹${numPrice} Lakh` : 'Price on Request'),
      priceValue: !isNaN(numPrice) && numPrice >= 0 ? numPrice : 0,
      location: this.formModel.location?.trim() || 'Tamil Nadu, India',
      area: this.formModel.area?.trim() || 'N/A',
      type: this.formModel.type?.trim() || 'Premium Plots',
      category: this.formModel.category || 'Plots',
      description: this.formModel.description?.trim() || `${trimmedName} - Premium property listing by ViMahaMur Luxury Properties.`,
      image: this.formModel.image?.trim() || defaultCover,
      gallery: this.formModel.gallery?.length ? this.formModel.gallery : [this.formModel.image?.trim() || defaultCover],
      amenities: this.formModel.amenities ?? [],
      nearbyPlaces: this.formModel.nearbyPlaces ?? [],
      floorPlans: this.formModel.floorPlans ?? []
    };

    if (this.modalMode() === 'create') {
      this.estateService.createProperty(payload).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.showModal.set(false);
          alert('Property created successfully.');
        },
        error: (err) => {
          this.isSubmitting.set(false);
          const detail = err.error?.errors?.map((e: any) => `• ${e.msg}`).join('\n') || err.error?.message || 'Failed to create property.';
          alert(`Failed to create property:\n${detail}`);
        }
      });
    } else {
      const id = this.editingPropertyId();
      if (!id) return;
      this.estateService.updateProperty(id, payload).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.showModal.set(false);
          alert('Property updated successfully.');
        },
        error: (err) => {
          this.isSubmitting.set(false);
          const detail = err.error?.errors?.map((e: any) => `• ${e.msg}`).join('\n') || err.error?.message || 'Failed to update property.';
          alert(`Failed to update property:\n${detail}`);
        }
      });
    }
  }

  protected deleteProperty(id: string | undefined): void {
    if (!id) return;
    if (confirm('Are you sure you want to delete this property listing? This action cannot be undone.')) {
      this.estateService.deleteProperty(id).subscribe({
        next: () => {
          alert('Property deleted.');
        },
        error: (err) => {
          alert(err.error?.message ?? 'Failed to delete property.');
        }
      });
    }
  }

  protected updateLeadStatus(id: string | undefined, status: string): void {
    if (!id) return;
    this.estateService.updateLeadStatus(id, status).subscribe({
      next: () => {
        alert('Lead status updated.');
      },
      error: (err) => {
        alert(err.error?.message ?? 'Failed to update status.');
      }
    });
  }

  protected deleteLead(id: string | undefined): void {
    if (!id) return;
    if (confirm('Delete this lead record?')) {
      this.estateService.deleteLead(id).subscribe({
        next: () => alert('Lead deleted.'),
        error: () => alert('Failed to delete lead.')
      });
    }
  }

  protected updateBookingStatus(id: string | undefined, status: 'Pending' | 'Confirmed' | 'Cancelled'): void {
    if (!id) return;
    this.estateService.updateBookingStatus(id, status).subscribe({
      next: () => {
        alert('Booking status updated.');
      },
      error: (err) => {
        alert(err.error?.message ?? 'Failed to update booking.');
      }
    });
  }

  protected deleteBooking(id: string | undefined): void {
    if (!id) return;
    if (confirm('Delete this site visit booking?')) {
      this.estateService.deleteBooking(id).subscribe({
        next: () => alert('Booking deleted.'),
        error: () => alert('Failed to delete booking.')
      });
    }
  }
}
