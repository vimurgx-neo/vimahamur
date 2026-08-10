import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { PropertyModel } from '../models/property.model.js';
import { BlogModel } from '../models/blog.model.js';
import { BookingModel } from '../models/booking.model.js';
import { LeadModel } from '../models/lead.model.js';
import { UserModel } from '../models/user.model.js';

const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL ?? 'superadmin@vimahamur.local';
const SUPER_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD ?? 'ChangeMe!12345';
const CUSTOMER_EMAIL = 'customer@vimahamur.local';
const CUSTOMER_PASSWORD = 'ChangeMe!12345';

async function seed() {
  console.info('Connecting to MongoDB...');
  await mongoose.connect(env.mongoUri);

  console.info('Clearing database tables...');
  await UserModel.deleteMany({ role: { $in: ['Admin', 'SuperAdmin', 'Customer'] } });
  await PropertyModel.deleteMany({});
  await BlogModel.deleteMany({});
  await BookingModel.deleteMany({});
  await LeadModel.deleteMany({});

  console.info('Seeding Users...');
  const passwordHash = await bcrypt.hash(CUSTOMER_PASSWORD, 12);
  const customerUser = await UserModel.create({
    name: 'Aparna Rao',
    email: CUSTOMER_EMAIL,
    phone: '+91 98765 43210',
    passwordHash,
    role: 'Customer',
  });

  const adminPasswordHash = await bcrypt.hash(SUPER_ADMIN_PASSWORD, 12);
  const adminUser = await UserModel.create({
    name: 'ViMahaMur Luxury Properties Super Admin',
    email: SUPER_ADMIN_EMAIL,
    phone: '+91 99999 88888',
    passwordHash: adminPasswordHash,
    role: 'SuperAdmin',
  });

  await UserModel.create({
    name: 'ViMahaMur Luxury Properties Admin',
    email: 'admin@vimahamur.local',
    phone: '+91 99999 77777',
    passwordHash: adminPasswordHash,
    role: 'Admin',
  });

  console.info('Seeding Properties...');
  const propertiesData = [
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
      category: 'Plots',
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
      category: 'Luxury',
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
      category: 'Luxury',
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
      category: 'Plots',
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
      category: 'Plots',
      description: 'Budget-friendly secure plots in expanding West Salem corridor with clear documentation.',
      gallery: ['https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=80'],
      floorPlans: ['Plot Layout • 1,000 sq ft'],
      amenities: ['Security Post', 'Rainwater Harvesting', 'Internal Roads', 'Park Area'],
      nearbyPlaces: ['Edappadi Bus Stand', 'Government School', 'Salem Highway'],
    }
  ];

  const properties = await PropertyModel.insertMany(propertiesData);
  console.info(`Seeded ${properties.length} Properties.`);

  // Link some saved properties to the customer
  customerUser.savedProperties.push(properties[0]._id as any, properties[1]._id as any);
  await customerUser.save();

  console.info('Seeding Blogs...');
  const blogsData = [
    {
      slug: 'luxury-market-trends-2026',
      title: 'Luxury market trends shaping premium home purchasing in 2026',
      category: 'Market Insights',
      excerpt: 'Discover how buyers are prioritizing smart amenities, location resilience, and trusted sales journeys.',
      author: 'ViMahaMur Luxury Properties Editorial',
      readTime: '4 min read',
      image: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=900&q=80',
      content: [
        'The luxury market is moving toward certainty, curated design, and frictionless discovery. Buyers want high-trust digital journeys before they ever speak to an agent.',
        'ViMahaMur Luxury Properties bridges that gap with premium presentation, smooth lead capture, and location-led storytelling.',
        'As environmental and infrastructure resilience becomes a priority, secondary market values in well-planned suburban micro-markets continue to outpace congested city cores.'
      ],
    },
    {
      slug: 'commercial-investment-checklist',
      title: 'Commercial investment checklist for fast-moving business buyers',
      category: 'Investment',
      excerpt: 'A concise checklist for reviewing infrastructure, footfall, and operational readiness before a deal.',
      author: 'Sales Strategy Team',
      readTime: '5 min read',
      image: 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80',
      content: [
        'High-performing commercial assets balance land value, location, and day-to-day usability.',
        'Review utility backup, parking, and nearby demand sources before committing to the next office or retail opportunity.',
        'Modern investors are also seeking properties with pre-installed EV charging zones and fiber-backed high-speed digital pathways.'
      ],
    },
  ];
  const blogs = await BlogModel.insertMany(blogsData);
  console.info(`Seeded ${blogs.length} Blogs.`);

  console.info('Seeding Leads...');
  const leadsData = [
    { customer: 'Nisha Patel', phone: '+91 98123 45678', email: 'nisha@example.com', property: 'Meridian Heights', budget: '₹1.5 Cr - ₹2 Cr', message: 'Looking for a 4 BHK villa. Please share site visit slot options for this Saturday.', source: 'Website', status: 'New' },
    { customer: 'Ravikumar', phone: '+91 90000 11111', email: 'ravi@example.com', property: 'Azure Corporate Hub', budget: '₹4 Cr - ₹5 Cr', message: 'Interested in retail showroom lease options.', source: 'WhatsApp', status: 'Contacted' },
    { customer: 'Kavya Menon', phone: '+91 98888 77777', email: 'kavya@example.com', property: 'The Aria Residences', budget: '₹90 Lakh - ₹1.2 Cr', message: 'Requesting site tour. Can you confirm the afternoon slot?', source: 'Instagram', status: 'Site Visit' },
    { customer: 'Harish Bhat', phone: '+91 97777 66666', email: 'harish@example.com', property: 'Sunset Plot Vista', budget: '₹60 Lakh - ₹80 Lakh', message: 'Need plot layout map and loan eligibility documents.', source: 'Email', status: 'Negotiation' },
  ];
  const leads = await LeadModel.insertMany(leadsData);
  console.info(`Seeded ${leads.length} Leads.`);

  console.info('Seeding Bookings...');
  const bookingsData = [
    {
      userId: customerUser._id,
      customerName: 'Aparna Rao',
      customerPhone: '+91 98765 43210',
      customerEmail: CUSTOMER_EMAIL,
      propertyName: 'Meridian Heights',
      propertySlug: 'meridian-heights',
      preferredDate: new Date(Date.now() + 86400000 * 2), // 2 days from now
      preferredTime: '11:00 AM',
      status: 'Confirmed'
    },
    {
      userId: customerUser._id,
      customerName: 'Aparna Rao',
      customerPhone: '+91 98765 43210',
      customerEmail: CUSTOMER_EMAIL,
      propertyName: 'The Aria Residences',
      propertySlug: 'aria-residences',
      preferredDate: new Date(Date.now() + 86400000 * 4), // 4 days from now
      preferredTime: '03:00 PM',
      status: 'Pending'
    }
  ];
  const bookings = await BookingModel.insertMany(bookingsData);
  console.info(`Seeded ${bookings.length} Bookings.`);

  console.info('Database seeding completed successfully!');
  await mongoose.disconnect();
}

seed().catch((error) => {
  console.error('Seeding failed', error);
  process.exit(1);
});
