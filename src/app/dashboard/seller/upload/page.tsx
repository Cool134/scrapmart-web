"use client";

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createListing } from '@/lib/firestore';
import { Camera, Loader2, UploadCloud, ChevronLeft, Sparkles, CheckCircle2 } from 'lucide-react';

export default function SellerUploadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
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
  const [analyzing, setAnalyzing] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<{ prediction?: string, material?: string, confidence?: number, description?: string, [key: string]: unknown } | null>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Immediate preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreviewImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
    
    // Trigger AI analysis
    setAnalyzing(true);
    setAnalysisResult(null);

    try {
      const uploadData = new FormData();
      uploadData.append('file', file);

      const response = await fetch('/api/analyze-scrap', {
        method: 'POST',
        body: uploadData, // no Content-Type so browser sets boundary automatically
      });
      const result = await response.json();
      
      if (result.success && result.data) {
        const data = result.data;
        setAnalysisResult(data);
        
        // Auto-fill fields
        setFormData((prev) => ({
          ...prev,
          material: data.prediction || data.material || prev.material,
          thickness_mm: data.estimated_thickness_mm?.toString() || prev.thickness_mm,
          description: data.description || prev.description,
          imageURL: '/scrap/scrap-1.svg',
        }));
      }
    } catch (err) {
      console.error("Failed to analyze image:", err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createListing({
        title: `${formData.material} - ${formData.thickness_mm || 0}mm`,
        material: formData.material,
        thickness_mm: Number(formData.thickness_mm || 0),
        price: Number(formData.price || 0),
        location: formData.location,
        description: formData.description,
        imageURL: formData.imageURL || '/scrap/scrap-1.svg',
        width_cm: Number(formData.width_cm || 100),
        height_cm: Number(formData.height_cm || 100),
        status: 'active',
        sellerId: 'mock-seller-id',
        estimated_weight_kg: 10,
        surface_area_cm2: 10000,
        confidence: analysisResult?.confidence || 0.95,
        suggested_price_inr: Number(formData.price || 0),
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
    <div className="min-h-screen bg-[#F4F7FC] pb-24 text-gray-900 font-sans">
      <style>{`
        @keyframes scan-line {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-scan {
          animation: scan-line 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
      `}</style>
      
      {/* Google-style App Bar */}
      <div className="sticky top-0 z-40 bg-white shadow-sm px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-700 transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-medium text-gray-800 tracking-tight">New Scrap Listing</h1>
      </div>

      <div className="max-w-xl mx-auto p-4 space-y-6 mt-2">
        {/* AI Upload Section */}
        <div className="bg-white rounded-[24px] shadow-sm p-5 overflow-hidden transition-all duration-300">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <h2 className="text-sm font-semibold text-gray-800">AI Scrap Analysis</h2>
          </div>
          
          <div 
            className="relative border-2 border-dashed border-gray-200 bg-[#F8FAFF] rounded-2xl flex flex-col items-center justify-center min-h-[200px] text-center cursor-pointer hover:bg-blue-50/50 transition-colors overflow-hidden"
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              accept="image/*" 
              capture="environment" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
            />
            
            {previewImage ? (
              <div className="absolute inset-0 w-full h-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={previewImage} alt="Scrap preview" className="w-full h-full object-cover" />
                
                {analyzing && (
                  <div className="absolute inset-0 bg-black/20 z-10">
                    <div className="absolute left-0 right-0 h-1 bg-white shadow-[0_0_15px_3px_rgba(255,255,255,0.8)] animate-scan z-20" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center backdrop-blur-[1px]">
                      <div className="bg-white/90 p-3 rounded-full shadow-lg mb-3">
                        <Sparkles className="w-6 h-6 text-blue-600 animate-pulse" />
                      </div>
                      <span className="text-sm font-medium text-white drop-shadow-md">Scanning material...</span>
                    </div>
                  </div>
                )}
                
                {!analyzing && (
                  <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                    <span className="text-white font-medium flex items-center gap-2 bg-black/40 px-4 py-2 rounded-full backdrop-blur-sm">
                      <Camera className="w-5 h-5" /> Retake Photo
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 flex flex-col items-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Camera className="w-8 h-8 text-blue-600" />
                </div>
                <p className="text-base font-medium text-gray-800 mb-1">Take a photo of the metal scrap</p>
                <p className="text-sm text-gray-500 max-w-xs">Our custom AI will instantly detect material, condition, and specs.</p>
              </div>
            )}
          </div>
          
          {/* AI Result Card */}
          {analysisResult && !analyzing && (
            <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-2xl p-4 flex items-start gap-3 mt-4 animate-in fade-in slide-in-from-top-4 duration-500">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
              <div>
                <h3 className="text-sm font-semibold text-green-900">
                  AI Analysis: {analysisResult.prediction || analysisResult.material || 'Material Detected'} 
                  {analysisResult.confidence && ` (${Math.round(analysisResult.confidence * 100)}% match)`}
                </h3>
                <p className="text-xs text-green-700 mt-1">Fields have been auto-filled based on the analysis.</p>
              </div>
            </div>
          )}
        </div>

        {/* Details Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-[24px] shadow-sm p-6 space-y-5">
          <h2 className="text-lg font-medium text-gray-800 mb-2">Listing Details</h2>
          
          <div className="space-y-4">
            <div className="relative">
              <input 
                required 
                name="material" 
                value={formData.material} 
                onChange={handleChange} 
                placeholder=" "
                className="peer w-full bg-gray-50 text-gray-900 border-none rounded-2xl px-4 pt-6 pb-2 focus:ring-2 focus:ring-blue-500 focus:bg-blue-50/50 outline-none transition-all" 
              />
              <label className="absolute left-4 top-4 text-sm font-medium text-gray-500 peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-xs peer-focus:text-blue-600 transition-all cursor-text pointer-events-none">
                Material Detected
              </label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <input 
                  type="number" 
                  step="0.1" 
                  name="thickness_mm" 
                  value={formData.thickness_mm} 
                  onChange={handleChange} 
                  placeholder=" "
                  className="peer w-full bg-gray-50 text-gray-900 border-none rounded-2xl px-4 pt-6 pb-2 focus:ring-2 focus:ring-blue-500 focus:bg-blue-50/50 outline-none transition-all" 
                />
                <label className="absolute left-4 top-4 text-sm font-medium text-gray-500 peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-xs peer-focus:text-blue-600 transition-all cursor-text pointer-events-none">
                  Thickness (mm)
                </label>
              </div>
              <div className="relative">
                <input 
                  required 
                  type="number" 
                  step="0.01" 
                  name="price" 
                  value={formData.price} 
                  onChange={handleChange} 
                  placeholder=" "
                  className="peer w-full bg-gray-50 text-gray-900 border-none rounded-2xl px-4 pt-6 pb-2 focus:ring-2 focus:ring-blue-500 focus:bg-blue-50/50 outline-none transition-all" 
                />
                <label className="absolute left-4 top-4 text-sm font-medium text-gray-500 peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-xs peer-focus:text-blue-600 transition-all cursor-text pointer-events-none">
                  Price per Kg (₹)
                </label>
              </div>
            </div>

            <div className="relative">
              <input 
                required 
                name="location" 
                value={formData.location} 
                onChange={handleChange} 
                placeholder=" "
                className="peer w-full bg-gray-50 text-gray-900 border-none rounded-2xl px-4 pt-6 pb-2 focus:ring-2 focus:ring-blue-500 focus:bg-blue-50/50 outline-none transition-all" 
              />
              <label className="absolute left-4 top-4 text-sm font-medium text-gray-500 peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-xs peer-focus:text-blue-600 transition-all cursor-text pointer-events-none">
                Location
              </label>
            </div>

            <div className="relative">
              <textarea 
                required 
                name="description" 
                value={formData.description} 
                onChange={handleChange} 
                rows={3} 
                placeholder=" "
                className="peer w-full bg-gray-50 text-gray-900 border-none rounded-2xl px-4 pt-6 pb-2 focus:ring-2 focus:ring-blue-500 focus:bg-blue-50/50 outline-none transition-all resize-none" 
              />
              <label className="absolute left-4 top-4 text-sm font-medium text-gray-500 peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-xs peer-focus:text-blue-600 transition-all cursor-text pointer-events-none">
                Description & Condition
              </label>
            </div>
          </div>

          <button 
            disabled={loading || analyzing} 
            type="submit" 
            className="w-full mt-6 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium text-base py-4 rounded-full shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] transition-all disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UploadCloud className="w-5 h-5" />}
            {loading ? 'Publishing...' : 'Publish Listing'}
          </button>
        </form>
      </div>
    </div>
  );
}
