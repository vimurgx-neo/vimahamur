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

  // File Upload Handlers
  protected onMainImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    
    const file = input.files[0];
    this.isUploadingMain.set(true);
    
    this.estateService.uploadImage(file).subscribe({
      next: (res) => {
        this.isUploadingMain.set(false);
        this.formModel.image = res.url;
      },
      error: (err) => {
        this.isUploadingMain.set(false);
        alert(err.error?.message ?? 'Image upload failed. Please try again.');
      }
    });
  }

  protected onGalleryImagesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    
    this.isUploadingGallery.set(true);
    const files = Array.from(input.files);
    
    let uploadedCount = 0;
    files.forEach(file => {
      this.estateService.uploadImage(file).subscribe({
        next: (res) => {
          this.formModel.gallery.push(res.url);
          uploadedCount++;
          if (uploadedCount === files.length) {
            this.isUploadingGallery.set(false);
          }
        },
        error: (err) => {
          uploadedCount++;
          if (uploadedCount === files.length) {
            this.isUploadingGallery.set(false);
          }
          console.error('Gallery file upload failed', err);
        }
      });
    });
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
    if (!this.formModel.name || !this.formModel.price || !this.formModel.image) {
      alert('Please fill out all required fields (Name, Price, Primary Image)');
      return;
    }

    this.isSubmitting.set(true);

    // Prepare payload matching property model categories
    const payload: any = {
      ...this.formModel,
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
          alert(err.error?.message ?? 'Failed to create property.');
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
          alert(err.error?.message ?? 'Failed to update property.');
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
