export interface MockListing {
  id: string;
  material: string;
  thickness: string;
  price_per_kg: number;
  location: string;
  description: string;
  image: string;
  sheet_dimensions: string;
  seller_name: string;
}

export const mockListings: MockListing[] = [
  {
    id: 'l-001',
    material: 'Stainless Steel 304',
    thickness: '2mm',
    price_per_kg: 2.50,
    location: 'Mumbai, MH',
    description: 'High quality SS 304 offcuts from laser cutting operation. Minimal rust, straight edges.',
    image: '/scrap/scrap-1.jpg',
    sheet_dimensions: '1200mm x 800mm (irregular)',
    seller_name: 'MetalWorks India'
  },
  {
    id: 'l-002',
    material: 'Aluminum 6061',
    thickness: '5mm',
    price_per_kg: 3.20,
    location: 'Pune, MH',
    description: 'Aircraft grade aluminum scrap. Perfect for CNC machining projects.',
    image: '/scrap/scrap-2.jpg',
    sheet_dimensions: '500mm x 500mm',
    seller_name: 'AeroScrap Ltd'
  },
  {
    id: 'l-003',
    material: 'Mild Steel',
    thickness: '1.5mm',
    price_per_kg: 0.80,
    location: 'Delhi, DL',
    description: 'Cold rolled mild steel sheets. Surface rust present but structurally sound.',
    image: '/scrap/scrap-3.jpg',
    sheet_dimensions: '2000mm x 1000mm',
    seller_name: 'Delhi Steel Traders'
  },
  {
    id: 'l-004',
    material: 'Copper',
    thickness: '1mm',
    price_per_kg: 8.50,
    location: 'Bangalore, KA',
    description: 'Clean copper roofing offcuts. No solder or attachments.',
    image: '/scrap/scrap-4.jpg',
    sheet_dimensions: '300mm x 2000mm (strips)',
    seller_name: 'Southern Metals'
  },
  {
    id: 'l-005',
    material: 'Brass',
    thickness: '3mm',
    price_per_kg: 5.40,
    location: 'Chennai, TN',
    description: 'Yellow brass plates from dismantled machinery. Heavy and clean.',
    image: '/scrap/scrap-5.jpg',
    sheet_dimensions: '400mm x 600mm',
    seller_name: 'Industrial Salvage Co.'
  },
  {
    id: 'l-006',
    material: 'Titanium Grade 5',
    thickness: '4mm',
    price_per_kg: 25.00,
    location: 'Hyderabad, TG',
    description: 'Aerospace surplus titanium plate. Rare find.',
    image: '/scrap/scrap-6.jpg',
    sheet_dimensions: '250mm x 250mm',
    seller_name: 'Hi-Tech Alloys'
  },
  {
    id: 'l-007',
    material: 'Galvanized Iron (GI)',
    thickness: '0.8mm',
    price_per_kg: 1.10,
    location: 'Ahmedabad, GJ',
    description: 'Leftover GI sheets from ducting project.',
    image: '/scrap/scrap-1.jpg',
    sheet_dimensions: '1000mm x 1500mm',
    seller_name: 'Gujarat Ducting'
  },
  {
    id: 'l-008',
    material: 'Stainless Steel 316',
    thickness: '6mm',
    price_per_kg: 3.80,
    location: 'Kolkata, WB',
    description: 'Marine grade stainless steel plates. Very heavy duty.',
    image: '/scrap/scrap-2.jpg',
    sheet_dimensions: '800mm x 800mm',
    seller_name: 'Marine Salvage WB'
  }
];
