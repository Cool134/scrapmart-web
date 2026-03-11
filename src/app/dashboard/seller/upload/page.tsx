"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createListing } from '@/lib/firestore';

export default function SellerUploadPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    material: '',
    thickness_mm: '',
    price: '',
    location: '',
    description: '',
    imageURL: '',
    width_cm: '',
    height_cm: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createListing({
        title: `${formData.material} - ${formData.thickness_mm}mm`,
        material: formData.material,
        thickness_mm: Number(formData.thickness_mm),
        price: Number(formData.price),
        location: formData.location,
        description: formData.description,
        imageURL: formData.imageURL || '/scrap/scrap-1.svg',
        width_cm: Number(formData.width_cm || 100),
        height_cm: Number(formData.height_cm || 100),
        status: 'active',
        sellerId: 'mock-seller-id',
        estimated_weight_kg: 10,
        surface_area_cm2: 10000,
        confidence: 0.95,
        suggested_price_usd: Number(formData.price),
        outline_points: [],
        surface_condition: 'Good'
      });
      alert('Listing created successfully!');
      router.push('/search');
    } catch (err) {
      console.error(err);
      alert('Error creating listing.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-2xl mx-auto p-6 md:p-10 bg-white shadow-sm border border-gray-100 rounded-xl my-10">
      <h1 className="text-3xl font-black mb-6">Upload Scrap Material</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Material</label>
          <input required name="material" value={formData.material} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Stainless Steel 304" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Thickness (mm)</label>
            <input required type="number" step="0.1" name="thickness_mm" value={formData.thickness_mm} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. 2.5" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Price per Kg ($)</label>
            <input required type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. 1.50" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Location</label>
          <input required name="location" value={formData.location} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Mumbai, MH" />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Image URL</label>
          <input name="imageURL" value={formData.imageURL} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="/scrap/scrap-1.svg (Optional)" />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
          <textarea required name="description" value={formData.description} onChange={handleChange} rows={4} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Describe the condition, edge quality, etc." />
        </div>

        <button disabled={loading} type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-lg shadow-md transition-colors disabled:opacity-50">
          {loading ? 'Uploading...' : 'Publish Listing'}
        </button>
      </form>
    </div>
  );
}
