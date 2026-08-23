import { CommonModule } from '@angular/common';
import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { VimahamurService, PropertyListing, LeadCard, Booking, PropertyMapper } from '../../shared/services/vimahamur.service';
import { AuthService } from '../../shared/services/auth.service';
import { NotificationService } from '../../shared/services/notification.service';

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
  private readonly notificationService = inject(NotificationService);

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
        this.notificationService.showError('Error', err.error?.message ?? 'Failed to clear dummy data.');
      }
    });
  }

  protected logout(): void {
    this.authService.logout();
    this.notificationService.showInfo('Signed Out', 'Admin session ended.');
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

  protected async onMainImageSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    
    const file = input.files[0];
    this.isUploadingMain.set(true);

    try {
      const compressedDataUrl = await this.compressImage(file, 1600, 0.88);
      if (compressedDataUrl) {
        this.formModel.image = compressedDataUrl;
        this.notificationService.showSuccess('Image Uploaded', 'Cover image processed successfully.');
      }
      this.isUploadingMain.set(false);
      input.value = '';
    } catch {
      this.isUploadingMain.set(false);
      input.value = '';
      this.notificationService.showError('Upload Error', 'Failed to process image.');
    }
  }

  protected onImgError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80';
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
    this.notificationService.showSuccess('Gallery Updated', `${files.length} image(s) added.`);
  }

  protected removeGalleryImage(index: number): void {
    this.formModel.gallery.splice(index, 1);
  }

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

  protected saveProperty(): void {
    const trimmedName = this.formModel.name?.trim();
    if (!trimmedName) {
      this.notificationService.showError('Validation', 'Please enter a Property Name.');
      return;
    }

    this.isSubmitting.set(true);

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
      description: this.formModel.description?.trim() || `${trimmedName} - Premium property listing.`,
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
          this.notificationService.showSuccess('Property Created', 'Listing added successfully.');
        },
        error: (err) => {
          this.isSubmitting.set(false);
          const detail = err.error?.message || 'Failed to create property.';
          this.notificationService.showError('Creation Failed', detail);
        }
      });
    } else {
      const id = this.editingPropertyId();
      if (!id) return;
      this.estateService.updateProperty(id, payload).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.showModal.set(false);
          this.notificationService.showSuccess('Property Updated', 'Listing updated successfully.');
        },
        error: (err) => {
          this.isSubmitting.set(false);
          const detail = err.error?.message || 'Failed to update property.';
          this.notificationService.showError('Update Failed', detail);
        }
      });
    }
  }

  protected deleteProperty(id: string | undefined): void {
    if (!id) return;
    if (confirm('Delete this property?')) {
      this.estateService.deleteProperty(id).subscribe({
        next: () => this.notificationService.showSuccess('Property Deleted', 'Listing removed.'),
        error: (err) => this.notificationService.showError('Delete Failed', err.error?.message ?? 'Failed to delete.')
      });
    }
  }

  protected updateLeadStatus(id: string | undefined, status: string): void {
    if (!id) return;
    this.estateService.updateLeadStatus(id, status).subscribe({
      next: () => this.notificationService.showSuccess('Status Updated', 'Lead status changed.'),
      error: (err) => this.notificationService.showError('Update Failed', err.error?.message ?? 'Failed to update.')
    });
  }

  protected deleteLead(id: string | undefined): void {
    if (!id) return;
    if (confirm('Delete this lead?')) {
      this.estateService.deleteLead(id).subscribe({
        next: () => this.notificationService.showSuccess('Lead Deleted', 'Lead removed.'),
        error: (err) => this.notificationService.showError('Delete Failed', err.error?.message ?? 'Failed to delete.')
      });
    }
  }

  protected updateBookingStatus(id: string | undefined, status: 'Pending' | 'Confirmed' | 'Cancelled'): void {
    if (!id) return;
    this.estateService.updateBookingStatus(id, status).subscribe({
      next: () => this.notificationService.showSuccess('Booking Updated', 'Booking status changed.'),
      error: (err) => this.notificationService.showError('Update Failed', err.error?.message ?? 'Failed to update.')
    });
  }

  protected deleteBooking(id: string | undefined): void {
    if (!id) return;
    if (confirm('Delete this booking?')) {
      this.estateService.deleteBooking(id).subscribe({
        next: () => this.notificationService.showSuccess('Booking Deleted', 'Booking removed.'),
        error: (err) => this.notificationService.showError('Delete Failed', err.error?.message ?? 'Failed to delete.')
      });
    }
  }
}
