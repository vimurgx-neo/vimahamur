import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { MarketingPageComponent } from './pages/marketing-page/marketing-page.component';
import { DetailsPageComponent } from './pages/details-page/details-page.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { LoginComponent } from './pages/login/login.component';
import { AdminLoginComponent } from './pages/admin-login/admin-login.component';
import { AdminComponent } from './pages/admin/admin.component';
import { roleGuard } from './shared/guards/role.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent, data: { title: 'Vimahamur Luxury Property | Luxury Real Estate', description: 'Explore premium properties, investment-ready commercial spaces, and curated real estate experiences.', breadcrumb: 'Home' } },
  { path: 'properties', component: MarketingPageComponent, data: { page: 'properties', title: 'Properties | Vimahamur Luxury Property', description: 'Browse premium residential, commercial, and plot opportunities.', breadcrumb: 'Properties' } },
  { path: 'property/:slug', component: DetailsPageComponent, data: { pageType: 'property', title: 'Property Details | Vimahamur Luxury Property', description: 'Detailed property showcase with amenities, floor plans, location, and enquiry actions.', breadcrumb: 'Property Details' } },
  { path: 'contact', component: MarketingPageComponent, data: { page: 'contact', title: 'Contact Us | Vimahamur Luxury Property', description: 'Reach Vimahamur Luxury Property for premium sales help, site visits, and property enquiries.', breadcrumb: 'Contact' } },
  { path: 'about', component: MarketingPageComponent, data: { page: 'about', title: 'About Us | Vimahamur Luxury Property', description: 'Learn about Vimahamur Luxury Property bespoke land developments and gated community plots.' } },
  { path: 'services', component: MarketingPageComponent, data: { page: 'services', title: 'Services | Vimahamur Luxury Property', description: 'Discover curated real estate services, land acquisition, and portfolio management.' } },
  { path: 'blog', component: MarketingPageComponent, data: { page: 'blog', title: 'Market Insights | Vimahamur Luxury Property', description: 'Read latest real estate market insights and editorial trends.' } },
  { path: 'blogs', redirectTo: 'blog', pathMatch: 'full' },
  { path: 'login', component: LoginComponent, data: { title: 'Login | Vimahamur Luxury Property' } },
  { path: 'signin', redirectTo: 'login', pathMatch: 'full' },
  { path: 'admin', redirectTo: 'admin/login', pathMatch: 'full' },
  { path: 'admin/login', component: AdminLoginComponent, data: { title: 'Admin Security Gateway | Vimahamur Luxury Property' } },
  { path: 'admin-login', redirectTo: 'admin/login', pathMatch: 'full' },
  { path: 'customer/login', redirectTo: 'login', pathMatch: 'full' },
  { path: 'customer/dashboard', redirectTo: '', pathMatch: 'full' },
  { path: 'register', component: LoginComponent, data: { title: 'Sign Up | Vimahamur Luxury Property' } },
  { path: 'signup', component: LoginComponent, data: { title: 'Sign Up | Vimahamur Luxury Property' } },
  { path: 'admin/dashboard', component: AdminComponent, canActivate: [roleGuard], data: { role: 'Admin', title: 'Admin Dashboard | Vimahamur Luxury Property' } },
  { path: '404', component: NotFoundComponent, data: { title: '404 Not Found', description: 'The requested Vimahamur Luxury Property page could not be found.', breadcrumb: '404' } },
  { path: '**', component: NotFoundComponent },
];
