"use client";

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { mockListings } from '@/data/mockListings';
import { getListing } from '@/lib/firestore';
import ScrapViewer from '@/components/ScrapViewer';

type DetailData = {
  id: string;
  material: string;
  price: string;
  location: string;
  description: string;
  image: string;
  dimensions: string;
  sellerName: string;
  thickness: string;
};

function ListingDetailContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [data, setData] = useState<DetailData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    // Check mock listings first
    const mock = mockListings.find(l => l.id === id);
    if (mock) {
      setData({
        id: mock.id,
        material: mock.material,
        price: `₹${mock.price_per_kg.toFixed(2)} / kg`,
        location: mock.location,
        description: mock.description,
        image: mock.image,
        dimensions: mock.sheet_dimensions,
        sellerName: mock.seller_name,
        thickness: mock.thickness,
      });
      setLoading(false);
      return;
    }

    // Check firestore
    getListing(id).then(listing => {
      if (listing) {
        setData({
          id: listing.id!,
          material: listing.material,
          price: `₹${listing.price}`,
          location: listing.location,
          description: listing.description || '',
          image: listing.imageURL || '/scrap/scrap-1.svg',
          dimensions: `${listing.width_cm}cm x ${listing.height_cm}cm`,
          sellerName: listing.sellerId || 'Unknown Seller',
          thickness: `${listing.thickness_mm}mm`,
        });
      }
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });

  }, [id]);

  if (!id) return <div className="p-8 text-center">No listing ID provided.</div>;
  if (loading) return <div className="p-8 text-center">Loading detail...</div>;
  if (!data) return <div className="p-8 text-center">Listing not found.</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
      <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
        <div className="md:flex">
          <div className="md:w-1/2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={data.image} 
              alt={data.material} 
              className="w-full h-64 object-cover md:h-full bg-gray-200"
            />
          </div>
          <div className="md:w-1/2 p-6 flex flex-col justify-center">
            <h1 className="text-3xl font-bold mb-2">{data.material}</h1>
            <p className="text-2xl text-green-600 font-semibold mb-4">
              {data.price}
            </p>
            
            <div className="space-y-3 text-gray-700 bg-gray-50 p-4 rounded-lg">
              <p><strong>Thickness:</strong> {data.thickness}</p>
              <p><strong>Dimensions:</strong> {data.dimensions}</p>
              <p><strong>Location:</strong> {data.location}</p>
              <p><strong>Seller:</strong> {data.sellerName}</p>
            </div>
            
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-2">Description</h2>
              <p className="text-gray-600 whitespace-pre-line">{data.description}</p>
            </div>

            <button className="mt-8 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg w-full transition-colors">
              Contact Seller
            </button>
          </div>
        </div>
      </div>
      
      <ScrapViewer material={data.material} />
    </div>
  );
}

export default function ListingDetailPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading detail...</div>}>
      <ListingDetailContent />
    </Suspense>
  );
}
