"use client";

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createListing, addListingImage, getUserProfile, updateUserProfile } from '@/lib/firestore';
import { uploadScrapImage } from '@/lib/storage'; // Firebase Storage upload
import { useAuthState } from '@/lib/auth';
import { Camera, Loader2, UploadCloud, ChevronLeft, Sparkles, CheckCircle2, TrendingUp, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Listing, User } from '@/types';
import { GoogleGenerativeAI } from "@google/generative-ai"; // For Gemini Vision API

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");

const CreateListingPage = () => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuthState();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<Omit<Listing, 'id' | 'sellerId' | 'createdAt' | 'status' | 'aiConfidence' | 'dimensions' | 'thickness' | 'weight' | 'pricePerKg'>>({
    title: '',
    materialType: '',
    description: '',
    location: '',
  });
  const [numericalData, setNumericalData] = useState({
    weight: '',
    thickness: '',
    pricePerKg: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiConfidence, setAiConfidence] = useState<number | null>(null);
  const [aiDetectedMaterial, setAiDetectedMaterial] = useState<string | null>(null);
  const [aiDetectedDescription, setAiDetectedDescription] = useState<string | null>(null);
  const [aiDetectedThickness, setAiDetectedThickness] = useState<number | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
    }
  }, [user, authLoading, router]);

  const handleFileSelect = (file: File | null) => {
    setSelectedFile(file);
    if (file) {
      setPreviewImage(URL.createObjectURL(file));
      triggerAIAnalysis(file);
    } else {
      setPreviewImage(null);
      setAnalysisResult(null);
      setAiConfidence(null);
      setAiDetectedMaterial(null);
      setAiDetectedDescription(null);
      setAiDetectedThickness(null);
    }
  };

  const triggerAIAnalysis = async (file: File) => {
    if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
      toast.error("Gemini API key is not configured.");
      return;
    }
    setAnalyzing(true);
    setAiConfidence(null);
    setAiDetectedMaterial(null);
    setAiDetectedDescription(null);
    setAiDetectedThickness(null);
    toast.loading("AI scanning image...", { id: 'ai-analysis' });

    try {
      const base64Image = await fileToBase64(file);
      const imagePart = {
        inlineData: {
          data: base64Image,
          mimeType: file.type,
        },
      };

      const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

      const prompt = `You are an expert industrial metallurgist. Analyze this image of metal scrap.
      Extract the following information:
      - materialType (e.g., steel, aluminum, copper, brass, iron, or 'unknown')
      - approximate thickness in mm (number, e.g., 2.5)
      - a brief condition estimate (string, e.g., 'clean with straight edges', 'rusty and bent', 'mixed lot')
      - overall AI confidence score (number between 0 and 1)

      Return ONLY a JSON object with these fields, no markdown, no extra text. Example: 
      {
        "materialType": "steel",
        "thickness": 3.2,
        "conditionEstimate": "clean with minor surface rust",
        "aiConfidence": 0.85
      }`;

      const result = await model.generateContent([prompt, imagePart]);
      const response = await result.response;
      const text = response.text();
      
      const jsonString = text.replace(/```json\n|```/g, '').trim();
      const parsedResult = JSON.parse(jsonString);

      if (parsedResult.materialType) {
        setAiDetectedMaterial(parsedResult.materialType);
        setFormData(prev => ({ ...prev, materialType: parsedResult.materialType }));
      }
      if (parsedResult.thickness) {
        setAiDetectedThickness(parsedResult.thickness);
        setNumericalData(prev => ({ ...prev, thickness: parsedResult.thickness.toString() }));
      }
      if (parsedResult.conditionEstimate) {
        setAiDetectedDescription(parsedResult.conditionEstimate);
        setFormData(prev => ({ ...prev, description: parsedResult.conditionEstimate }));
      }
      if (parsedResult.aiConfidence) {
        setAiConfidence(parsedResult.aiConfidence);
      }
      toast.success("AI analysis complete!", { id: 'ai-analysis' });

    } catch (error) {
      console.error("Gemini Vision API Error:", error);
      toast.error("AI analysis failed.", { id: 'ai-analysis' });
    } finally {
      setAnalyzing(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1]; // Remove data:image/jpeg;base64,
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("You must be logged in to create a listing.");
      return;
    }
    if (!selectedFile) {
      toast.error("Please upload an image for your listing.");
      return;
    }

    setLoading(true);
    toast.loading("Creating listing...", { id: 'create-listing' });

    try {
      // Upload image to Firebase Storage
      const imageUrl = await uploadScrapImage(user.uid, selectedFile);

      // Create listing in Firestore
      const newListing: Omit<Listing, 'id' | 'sellerId' | 'createdAt' | 'status'> = {
        title: `${formData.materialType} - ${numericalData.thickness || 0}mm`,
        materialType: formData.materialType,
        weight: Number(numericalData.weight || 0),
        thickness: Number(numericalData.thickness || 0),
        pricePerKg: Number(numericalData.pricePerKg || 0),
        location: formData.location,
        description: formData.description,
        aiConfidence: aiConfidence || 0, // Use AI confidence
        // Dimensions and other fields like status are handled by default or derived.
      };
      const listingId = await createListing({ ...newListing, sellerId: user.uid });

      // Add image reference to listing_images collection
      await addListingImage({
        listingId: listingId!,
        imageUrl: imageUrl,
        order: 1,
      });

      toast.success("Listing created successfully!", { id: 'create-listing' });
      router.push('/dashboard/seller');
    } catch (error) {
      console.error("Error creating listing:", error);
      toast.error(`Failed to create listing: ${error instanceof Error ? error.message : 'Unknown error'}`, { id: 'create-listing' });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="mt-3 text-lg text-gray-600">Loading user session...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthGuard role="seller">
      <div className="min-h-screen bg-[#F4F7FC] pb-24 text-gray-900 font-sans">
        {/* Google-style App Bar */}
        <div className="sticky top-0 z-40 bg-white shadow-sm px-4 py-3 flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-700 transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-medium text-gray-800 tracking-tight">Create New Scrap Listing</h1>
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
                onChange={(e) => handleFileSelect(e.target.files?.[0] || null)} 
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
                  <p className="text-sm text-gray-500 max-w-xs">Our AI will instantly detect material, thickness, and condition.</p>
                </div>
              )}
            </div>
            
            {/* AI Result Card */}
            {aiConfidence !== null && !analyzing && (
              <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-2xl p-4 flex items-start gap-3 mt-4 animate-in fade-in slide-in-from-top-4 duration-500">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                <div>
                  <h3 className="text-sm font-semibold text-green-900">
                    AI Analysis: {aiDetectedMaterial || 'Material Detected'} 
                    {aiConfidence !== null && ` (${Math.round(aiConfidence * 100)}% confidence)`}
                  </h3>
                  <p className="text-xs text-green-700 mt-1">Fields below have been auto-filled based on the analysis.</p>
                </div>
              </div>
            )}
          </div>

          {/* Details Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-[24px] shadow-sm p-6 space-y-5">
            <h2 className="text-lg font-medium text-gray-800 mb-2">Listing Details</h2>
            
            <div className="space-y-4">
              {/* Material Type */}
              <div className="relative">
                <select 
                  required 
                  name="materialType" 
                  value={formData.materialType} 
                  onChange={(e) => setFormData({ ...formData, materialType: e.target.value })} 
                  className="peer w-full bg-gray-50 text-gray-900 border-none rounded-2xl px-4 pt-6 pb-2 focus:ring-2 focus:ring-blue-500 focus:bg-blue-50/50 outline-none transition-all appearance-none" 
                >
                  <option value="" disabled>Select Material</option>
                  <option value="steel">Steel</option>
                  <option value="aluminum">Aluminum</option>
                  <option value="copper">Copper</option>
                  <option value="brass">Brass</option>
                  <option value="iron">Iron</option>
                  <option value="other">Other</option>
                </select>
                <label className="absolute left-4 top-4 text-sm font-medium text-gray-500 peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-xs peer-focus:text-blue-600 transition-all cursor-text pointer-events-none">
                  Material Type
                </label>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"><ChevronLeft className="w-4 h-4 rotate-[-90deg]" /></div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Weight */}
                <div className="relative">
                  <input 
                    required 
                    type="number" 
                    step="0.1" 
                    name="weight" 
                    value={numericalData.weight} 
                    onChange={(e) => setNumericalData({ ...numericalData, weight: e.target.value })} 
                    placeholder=" "
                    className="peer w-full bg-gray-50 text-gray-900 border-none rounded-2xl px-4 pt-6 pb-2 focus:ring-2 focus:ring-blue-500 focus:bg-blue-50/50 outline-none transition-all" 
                  />
                  <label className="absolute left-4 top-4 text-sm font-medium text-gray-500 peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-xs peer-focus:text-blue-600 transition-all cursor-text pointer-events-none">
                    Weight (kg)
                  </label>
                </div>
                {/* Thickness */}
                <div className="relative">
                  <input 
                    required 
                    type="number" 
                    step="0.1" 
                    name="thickness" 
                    value={numericalData.thickness} 
                    onChange={(e) => setNumericalData({ ...numericalData, thickness: e.target.value })} 
                    placeholder=" "
                    className="peer w-full bg-gray-50 text-gray-900 border-none rounded-2xl px-4 pt-6 pb-2 focus:ring-2 focus:ring-blue-500 focus:bg-blue-50/50 outline-none transition-all" 
                  />
                  <label className="absolute left-4 top-4 text-sm font-medium text-gray-500 peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-xs peer-focus:text-blue-600 transition-all cursor-text pointer-events-none">
                    Thickness (mm)
                  </label>
                </div>
              </div>
              
              {/* Price per Kg */}
              <div className="relative">
                <input 
                  required 
                  type="number" 
                  step="0.01" 
                  name="pricePerKg" 
                  value={numericalData.pricePerKg} 
                  onChange={(e) => setNumericalData({ ...numericalData, pricePerKg: e.target.value })} 
                  placeholder=" "
                  className="peer w-full bg-gray-50 text-gray-900 border-none rounded-2xl px-4 pt-6 pb-2 focus:ring-2 focus:ring-blue-500 focus:bg-blue-50/50 outline-none transition-all" 
                />
                <label className="absolute left-4 top-4 text-sm font-medium text-gray-500 peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-xs peer-focus:text-blue-600 transition-all cursor-text pointer-events-none">
                  Price per Kg (₹)
                </label>
              </div>

              {/* Location */}
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

              {/* Description */}
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
              disabled={loading || analyzing || !user} 
              type="submit" 
              className="w-full mt-6 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium text-base py-4 rounded-full shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] transition-all disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UploadCloud className="w-5 h-5" />}
              {loading ? 'Publishing...' : 'Publish Listing'}
            </button>
          </form>
        </div>
      </div>
    </AuthGuard>
  );
};

export default CreateListingPage;

