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
      name: 'The Meridian Crest Villas',
      price: '₹1.85 Cr',
      priceValue: 185,
      location: 'Whitefield, Bengaluru',
      area: '2,340 sq ft',
      type: 'Luxury Villas',
      image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=900&q=80',
      featured: true,
      category: 'Luxury Villas',
      description: 'An ultra-premium enclave of modern 4-BHK architectural villas featuring expansive double-height ceilings, private terrace gardens, home automation, and an exclusive residents-only wellness clubhouse.',
      gallery: [
        'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80',
      ],
      floorPlans: ['Ground Floor • 4 BHK • 2,340 sq ft', 'Upper Floor • 3 BHK • 1,620 sq ft'],
      amenities: ['Private Pool', 'Savant Smart Automation', 'Residents Clubhouse', 'Double-Height Living', '24/7 Concierge'],
      nearbyPlaces: ['Whitefield Metro Station', 'ITPL Main Gate', 'Phoenix Marketcity Mall'],
    },
    {
      slug: 'aria-residences',
      name: 'Aria Royal Residences',
      price: '₹92 Lakh',
      priceValue: 92,
      location: 'Kharadi, Pune',
      area: '1,820 sq ft',
      type: 'Premium Apartments',
      image: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=900&q=80',
      featured: true,
      category: 'Luxury Villas',
      description: 'Exquisite high-rise penthouses and premium apartments boasting panoramic city skylines, wrap-around green balconies, private elevator access, a sky lounge, and state-of-the-art spa facilities.',
      gallery: [
        'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=900&q=80',
      ],
      floorPlans: ['2 BHK Suite • 1,820 sq ft', '3 BHK Penthouse • 2,240 sq ft'],
      amenities: ['Infinity Sky Lounge', 'Private Elevators', 'Lush Wellness Spa', 'Gymnasium', 'EV Charging Bays'],
      nearbyPlaces: ['EON Free Zone', 'Kharadi IT Park', 'Pune Airport Road'],
    },
    {
      slug: 'azure-corporate-hub',
      name: 'The Azure Sovereign Plaza',
      price: '₹4.6 Cr',
      priceValue: 460,
      location: 'Guindy, Chennai',
      area: '3,600 sq ft',
      type: 'Commercial Space',
      image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=900&q=80',
      featured: true,
      category: 'Commercial',
      description: 'A Grade-A corporate tower featuring architectural curtain glass walls, premium executive suites, collaborative open-sky business terraces, high-speed fiber backbones, and smart climate control systems.',
      gallery: [
        'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=900&q=80',
      ],
      floorPlans: ['Executive Floor Suite • 1,900 sq ft', 'Premium Office Suite • 2,300 sq ft'],
      amenities: ['Grade-A Glass Facade', 'Smart Executive Lounge', 'Valet Parking', 'High-Speed Fiber Network', 'Solar Power Grid'],
      nearbyPlaces: ['Guindy Industrial Estate', 'Chennai Central', 'IIT Madras Research Park'],
    },
    {
      slug: 'sunset-plot-vista',
      name: 'Nandi Crest Foothill Estates',
      price: '₹68 Lakh',
      priceValue: 68,
      location: 'Nandi Hills, Bengaluru',
      area: '2,800 sq ft',
      type: 'Plots',
      image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=900&q=80',
      featured: false,
      category: 'Premium Plots',
      description: 'A curated selection of luxury estate plots situated at the pristine foothills of Nandi Hills, offering breathtaking panoramic vistas, gated security, wide blacktop avenue roads, and underground utility connections.',
      gallery: ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=900&q=80'],
      floorPlans: ['Plot Layout Plan • 2,800 sq ft'],
      amenities: ['Panoramas of Nandi Hills', 'Underground Utility Lines', 'Gated Access Control', 'Landscaped Parks', 'Avenue Tree Planting'],
      nearbyPlaces: ['Nandi Hills Reserve', 'Kempegowda International Airport', 'Kempegowda Expressway'],
    },
    {
      slug: 'greenwood-meadows',
      name: 'The Greenwood Pavilions',
      price: '₹1.15 Cr',
      priceValue: 115,
      location: 'Sarjapur Road, Bengaluru',
      area: '2,100 sq ft',
      type: 'Luxury Villas',
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80',
      featured: false,
      category: 'Luxury Villas',
      description: 'Exclusive eco-luxury villas integrating natural stone finishes, private infinity plunge pools, sunlit reading corridors, and access to a premium organic club farm.',
      gallery: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80'],
      floorPlans: ['3 BHK Villa • 2,100 sq ft'],
      amenities: ['Eco-friendly Solar Energy', 'Organic Club Farm', 'Infinity Plunge Pool', 'Premium Wellness Spa', 'Jogging Track'],
      nearbyPlaces: ['Sarjapur Metro', 'Decathlon Sarjapur', 'Wipro Corporate Office'],
    },
    {
      slug: 'vantage-suites',
      name: 'Vantage Executive Penthouses',
      price: '₹75 Lakh',
      priceValue: 75,
      location: 'Gachibowli, Hyderabad',
      area: '1,200 sq ft',
      type: 'Premium Apartments',
      image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=900&q=80',
      featured: false,
      category: 'Luxury Villas',
      description: 'Sophisticated high-ceiling suites designed for corporate leaders, situated in the heart of Hyderabad\'s financial district, complete with a rooftop infinity pool and a fully serviced business center.',
      gallery: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=900&q=80'],
      floorPlans: ['1 BHK Suite • 750 sq ft', '2 BHK Penthouse • 1,200 sq ft'],
      amenities: ['Rooftop Infinity Pool', 'Serviced Business Hub', '24/7 Valet & Concierge', 'Smart Home Systems', 'Private Dining Room'],
      nearbyPlaces: ['Gachibowli Stadium', 'DLF Cybercity', 'Outer Ring Road Bypass'],
    },
    {
      slug: 'grand-plaza-mall',
      name: 'The Andheri Grand Arcade',
      price: '₹12.5 Cr',
      priceValue: 1250,
      location: 'Andheri West, Mumbai',
      area: '8,500 sq ft',
      type: 'Commercial Space',
      image: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=900&q=80',
      featured: true,
      category: 'Commercial',
      description: 'Ultra-premium flagship retail spaces and commercial offices in Andheri\'s primary business node, featuring double-height storefront glass, central HVAC, and maximum footfall exposure.',
      gallery: ['https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=900&q=80'],
      floorPlans: ['Ground Floor Showroom • 5,000 sq ft', 'First Floor Retail • 3,500 sq ft'],
      amenities: ['Double-height Glass Storefronts', 'Central HVAC Air Purification', 'Multi-tier Parking', '24/7 Security & Fire Protection', 'Helipad Access'],
      nearbyPlaces: ['Andheri Railway Station', 'Link Road Junction', 'Infinity Mall Andheri'],
    },
    {
      slug: 'emerald-haven-plots',
      name: 'Salem Vista Premium Estates',
      price: '₹45 Lakh',
      priceValue: 45,
      location: 'Bypass Road, Salem',
      area: '1,500 sq ft',
      type: 'Premium Plots',
      image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80',
      featured: true,
      category: 'Plots',
      description: 'A master-planned gated residential plot development located along the prominent Salem Bypass, offering ready-to-construct villa plots with underground storm drains, water connection, and landscaped walking trails.',
      gallery: ['https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80'],
      floorPlans: ['Standard Plot Layout • 1,500 sq ft'],
      amenities: ['Underground Utilities', 'Premium Blacktop Roads', 'Solar Street Lighting', 'Landscaped Jogging Trails', 'Children\'s Play Park'],
      nearbyPlaces: ['Salem Bypass Highway', 'Central Bus Stand Salem', 'Grand Mall Salem'],
    },
    {
      slug: 'cauvery-vista-residences',
      name: 'Cauvery Sovereign Villas',
      price: '₹1.25 Cr',
      priceValue: 125,
      location: 'Cantonment Area, Trichy',
      area: '2,200 sq ft',
      type: 'Luxury Villas',
      image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80',
      featured: true,
      category: 'Luxury',
      description: 'Individually customized luxury independent villas designed in contemporary tropical architecture, offering scenic riverside views, private courtyards, and elite private club membership.',
      gallery: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80'],
      floorPlans: ['3 BHK Courtyard Villa • 2,200 sq ft'],
      amenities: ['Riverside Promenade Access', 'Elite Private Club', 'Courtyard Gardens', 'Premium Modular Kitchen', '24/7 Smart Surveillance'],
      nearbyPlaces: ['Cauvery River Promenade', 'NIT Trichy', 'Srirangam Temple Complex'],
    },
    {
      slug: 'western-ghats-enclave',
      name: 'Western Ghats Majesty Estates',
      price: '₹2.1 Cr',
      priceValue: 210,
      location: 'Avinashi Road, Coimbatore',
      area: '3,100 sq ft',
      type: 'Luxury Villas',
      image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=600&q=80',
      featured: true,
      category: 'Luxury',
      description: 'Ultra-luxury villas nestled against the majestic Western Ghats backdrop, incorporating smart energy management, private swimming pools, wrap-around terraces, and custom-crafted hardwood finishes.',
      gallery: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=600&q=80'],
      floorPlans: ['4 BHK Luxury Villa • 3,100 sq ft'],
      amenities: ['Scenic Mountain Foothills', 'Private Heated Pool', 'Smart Energy Management', 'Wrap-around Balconies', 'Home Theater Lounge'],
      nearbyPlaces: ['Peelamedu IT Hub', 'PSG College of Technology', 'Coimbatore International Airport'],
    },
    {
      slug: 'tranquil-greens',
      name: 'Namakkal Royal Meadows',
      price: '₹35 Lakh',
      priceValue: 35,
      location: 'Paramathi Road, Namakkal',
      area: '1,200 sq ft',
      type: 'Premium Plots',
      image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80',
      featured: false,
      category: 'Plots',
      description: 'Premium development-ready villa plots in Namakkal\'s most peaceful residential corridor, featuring clear title deeds, perimeter security, landscaped parks, and wide internal roads.',
      gallery: ['https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80'],
      floorPlans: ['Standard Villa Plot Layout • 1,200 sq ft'],
      amenities: ['Avenue Plantations', 'Wide Tarred Roads', 'Water Connection to Every Plot', 'Gated Perimeter Security', 'Kids Play Area'],
      nearbyPlaces: ['Namakkal Fort Complex', 'Paramathi Road Bypass', 'Namakkal Bypass Highway'],
    },
    {
      slug: 'west-salem-meadows',
      name: 'The Edapadi Crest Plots',
      price: '₹28 Lakh',
      priceValue: 28,
      location: 'Main Road, Edapadi',
      area: '1,000 sq ft',
      type: 'Premium Plots',
      image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80',
      featured: false,
      category: 'Plots',
      description: 'Highly secure gated plot layout in the rapidly developing Salem west extension corridor, presenting perfect road access, drainage lines, and high-value investment appreciation.',
      gallery: ['https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80'],
      floorPlans: ['Standard Plot Layout • 1,000 sq ft'],
      amenities: ['Storm Water Drainage', 'Overhead Water Tank', 'Wide Avenue Roads', '24/7 Gated Security', 'Community Green Park'],
      nearbyPlaces: ['Edappadi Bus Stand', 'Salem-Edappadi Highway', 'Govt Higher Secondary School'],
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
      title: 'The Evolution of Luxury Real Estate in South India: Trends to Watch',
      category: 'Market Insights',
      excerpt: 'From eco-conscious smart home designs to high-security private enclaves, discover what today\'s ultra-high-net-worth buyers expect.',
      author: 'ViMahaMur Luxury Properties Editorial',
      readTime: '4 min read',
      image: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=900&q=80',
      content: [
        'Modern luxury real estate is undergoing a structural shift. Today\'s premium homebuyers are no longer satisfied with just large square footage. Instead, they seek wellness integration, location-led privacy, and seamless technological design.',
        'At ViMahaMur Luxury Properties, we see rising demand for gated communities that offer high-speed connectivity, off-grid water independence, and private recreational infrastructure like heated infinity pools and landscaped walking trails.',
        'Suburban micro-markets are outperforming city centers. As connectivity improves via rapid transit and expressways, discerning buyers are opting for cleaner air and larger estate sizes, particularly in corridors like Salem Bypass and Coimbatore Foothills.'
      ],
    },
    {
      slug: 'commercial-investment-checklist',
      title: 'Maximizing ROI: A Comprehensive Checklist for Commercial Real Estate Investors',
      category: 'Investment',
      excerpt: 'A detailed guide on evaluating Grade-A corporate assets, footfall projections, and regulatory compliance before committing capital.',
      author: 'Sales Strategy Team',
      readTime: '5 min read',
      image: 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80',
      content: [
        'Commercial real estate investing requires a balance between initial capital yield and long-term tenant stability. High-performing assets are characterized by premium locations, robust structural designs, and state-of-the-art building management systems.',
        'Before securing a commercial office or retail arcade, check for key facilities such as central HVAC air filtration, dedicated multi-tier parking grids, solar energy offset options, and double-glazed facades for optimal temperature control.',
        'Modern tenants prioritize spaces that promote employee productivity and sustainability. Look for structures built with green building credentials (like LEED certifications) and pre-installed EV charging stations.'
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
