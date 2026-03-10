"use client";
import { useState } from "react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { UploadZone } from "@/components/shared/UploadZone";
import { AIOutlineOverlay } from "@/components/shared/AIOutlineOverlay";
import { useAuthState } from "@/lib/auth";
import { uploadScrapImage } from "@/lib/storage";
import { createListing } from "@/lib/firestore";
import { AIAnalysisResult } from "@/types";
import { useRouter } from "next/navigation";
import { Sparkles, CheckCircle2, ArrowRight, Save, Image as ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

export default function UploadPage() {
  const { user } = useAuthState();
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiData, setAiData] = useState<AIAnalysisResult | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Form State for Step 3
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);

  const handleAnalyze = async () => {
    if (!file) return;
    setIsAnalyzing(true);
    setStep(2);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        const base64data = reader.result;
        const res = await fetch("/api/analyze-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: base64data, mimeType: file.type })
        });
        
        if (!res.ok) throw new Error("AI analysis API returned an error");
        
        const data: AIAnalysisResult = await res.json();
        setAiData(data);
        setTitle(`Premium ${data.material.charAt(0).toUpperCase() + data.material.slice(1)} Offset`);
        setPrice(data.suggested_price_usd);
        setDescription(data.description);
      };
    } catch (e: unknown) {
      toast.error((e as Error).message || "Failed to analyze image. Please try again.");
      setStep(1);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !file || !aiData || !title || !price || !location) {
      return toast.error("Please fill all required fields");
    }

    setIsPublishing(true);
    try {
      const toastId = toast.loading("Uploading high-res image...");
      
      const imageURL = await uploadScrapImage(user.uid, file, (progress) => {
        setUploadProgress(progress);
      });
      
      toast.loading("Writing listing to blockchain...", { id: toastId });
      
      await createListing({
        sellerId: user.uid,
        title, 
        price, 
        location,
        status: "active",
        imageURL,
        ...aiData,
        // Override with user edits
        description 
      });

      toast.success("Listing published successfully!", { id: toastId });
      router.push("/dashboard/seller");
    } catch (e: unknown) {
      toast.error((e as Error).message || "Failed to publish listing");
      setIsPublishing(false);
    }
  };

  return (
    <AuthGuard role="seller">
      <div className="max-w-5xl mx-auto px-4 py-10 w-full flex-1">
        
        {/* Header & Breadcrumbs */}
        <div className="mb-10 flex flex-col items-center">
          <h1 className="text-4xl font-black text-primary mb-6 tracking-tight">AI Snap-to-List</h1>
          <div className="flex items-center justify-center space-x-4 bg-white px-6 py-3 rounded-full border border-gray-100 shadow-sm">
            <div className={`flex items-center ${step >= 1 ? "text-accent-DEFAULT font-bold" : "text-gray-400 font-medium"}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2 ${step >= 1 ? 'bg-accent-DEFAULT text-white' : 'bg-gray-100'}`}>1</span>
              Upload
            </div>
            <div className={`w-12 h-0.5 ${step >= 2 ? 'bg-accent-DEFAULT' : 'bg-gray-200'}`} />
            <div className={`flex items-center ${step >= 2 ? "text-accent-DEFAULT font-bold" : "text-gray-400 font-medium"}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2 ${step >= 2 ? 'bg-accent-DEFAULT text-white' : 'bg-gray-100'}`}>2</span>
              AI Scan
            </div>
            <div className={`w-12 h-0.5 ${step === 3 ? 'bg-accent-DEFAULT' : 'bg-gray-200'}`} />
            <div className={`flex items-center ${step === 3 ? "text-accent-DEFAULT font-bold" : "text-gray-400 font-medium"}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2 ${step === 3 ? 'bg-accent-DEFAULT text-white' : 'bg-gray-100'}`}>3</span>
              Publish
            </div>
          </div>
        </div>

        <motion.div layout className="bg-white rounded-[2rem] shadow-[0_8px_40px_rgba(0,0,0,0.06)] border border-gray-100 p-8 min-h-[500px]">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: UPLOAD */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900">Upload High-Quality Photo</h2>
                  <p className="text-gray-500 mt-2">Ensure the metal piece is well-lit and placed flat.</p>
                </div>
                
                <div className="max-w-2xl mx-auto">
                  <UploadZone file={file} onFileSelect={setFile} />
                  
                  <button 
                    disabled={!file} 
                    onClick={handleAnalyze}
                    className="w-full mt-8 bg-primary text-white font-black text-lg py-5 rounded-2xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20 transition-all flex items-center justify-center space-x-3 transform active:scale-95"
                  >
                    <Sparkles className="w-6 h-6 text-accent-DEFAULT" />
                    <span>Run Gemini Vision Analysis</span>
                    <ArrowRight className="w-5 h-5 ml-2 opacity-50" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: AI ANALYSIS */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                {isAnalyzing ? (
                  <div className="flex flex-col items-center justify-center py-32">
                    <div className="relative w-24 h-24 mb-8">
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} className="absolute inset-0 rounded-full border-t-4 border-accent-DEFAULT border-opacity-50" />
                      <motion.div animate={{ rotate: -360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} className="absolute inset-2 rounded-full border-b-4 border-primary border-opacity-30" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Sparkles className="w-10 h-10 text-accent-DEFAULT animate-pulse" />
                      </div>
                    </div>
                    <h3 className="text-3xl font-black text-primary mb-3">Extracting Geometry...</h3>
                    <p className="text-gray-500 font-medium text-lg">Running multi-modal analysis on material density and contour lines.</p>
                  </div>
                ) : aiData && (
                  <div className="space-y-8">
                    <div className="flex items-center justify-between text-emerald-700 bg-emerald-50 px-6 py-4 rounded-2xl border border-emerald-100 shadow-sm">
                      <div className="flex items-center font-bold text-lg">
                        <CheckCircle2 className="w-6 h-6 mr-3" />
                        AI Analysis Complete
                      </div>
                      <div className="bg-white px-3 py-1 rounded-lg shadow-sm text-sm font-black border border-emerald-100">
                        CONFIDENCE: {(aiData.confidence * 100).toFixed(0)}%
                      </div>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-8">
                      {/* Image + Overlay Preview */}
                      <div className="w-full lg:w-5/12">
                        <div className="relative rounded-3xl overflow-hidden border border-gray-200 shadow-inner bg-gray-100 aspect-square flex items-center justify-center">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          {file && <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-contain p-4" />}
                          <AIOutlineOverlay points={aiData.outline_points} />
                        </div>
                      </div>
                      
                      {/* Extracted Data Grid */}
                      <div className="w-full lg:w-7/12">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Extracted Parameters</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          {[
                            { l: "Material", v: aiData.material, c: "col-span-2 sm:col-span-1" },
                            { l: "Thickness", v: `${aiData.thickness_mm} mm` },
                            { l: "Dimensions", v: `${aiData.width_cm}x${aiData.height_cm} cm` },
                            { l: "Usable Area", v: `${aiData.surface_area_cm2} cm²` },
                            { l: "Est. Weight", v: `${aiData.estimated_weight_kg.toFixed(2)} kg` },
                            { l: "Surface", v: aiData.surface_condition }
                          ].map((s, i) => (
                            <div key={i} className={`bg-gray-50 border border-gray-100 p-4 rounded-2xl ${s.c || ''}`}>
                              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">{s.l}</p>
                              <p className="text-lg font-black text-gray-900 capitalize">{s.v}</p>
                            </div>
                          ))}
                        </div>
                        
                        <div className="mt-4 bg-accent-DEFAULT/5 border border-accent-DEFAULT/20 p-5 rounded-2xl flex items-center justify-between">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-accent-DEFAULT mb-1">Market Value Estimation</p>
                            <p className="text-3xl font-black text-primary">${aiData.suggested_price_usd}</p>
                          </div>
                          <Sparkles className="w-8 h-8 text-accent-DEFAULT/40" />
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4 pt-4 border-t border-gray-100">
                      <button onClick={() => { setFile(null); setStep(1); }} className="flex-1 py-4 font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition flex items-center justify-center">
                        <ImageIcon className="w-5 h-5 mr-2" /> Retake Photo
                      </button>
                      <button onClick={() => setStep(3)} className="flex-[2] py-4 font-bold text-white bg-primary hover:bg-primary/90 rounded-xl transition shadow-lg shadow-primary/20 flex items-center justify-center">
                        Verify Details & Continue <ArrowRight className="w-5 h-5 ml-2" />
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* STEP 3: PUBLISH */}
            {step === 3 && aiData && (
              <motion.div key="step3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <div className="flex justify-between items-end mb-8 border-b border-gray-100 pb-4">
                  <div>
                    <h2 className="text-3xl font-black text-primary">Finalize Listing</h2>
                    <p className="text-gray-500 font-medium mt-1">Review the AI-generated data and add pickup logistics.</p>
                  </div>
                  <button onClick={()=>setStep(2)} className="text-sm font-bold text-accent-DEFAULT hover:underline">&larr; Back to Analysis</button>
                </div>

                <form onSubmit={handlePublish} className="flex flex-col lg:flex-row gap-10">
                  
                  {/* Form Left */}
                  <div className="w-full lg:w-2/3 space-y-6">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Listing Title</label>
                      <input required type="text" value={title} onChange={e=>setTitle(e.target.value)} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent-DEFAULT/50 outline-none font-bold text-gray-900 transition-all" />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Pickup Location / ZIP Code</label>
                      <input required type="text" value={location} onChange={e=>setLocation(e.target.value)} placeholder="e.g. Factory Warehouse, Area 51" className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent-DEFAULT/50 outline-none font-medium transition-all" />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Description</label>
                      <textarea required rows={5} value={description} onChange={e=>setDescription(e.target.value)} className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent-DEFAULT/50 outline-none font-medium transition-all resize-none leading-relaxed" />
                    </div>
                  </div>

                  {/* Form Right (Pricing & Submit) */}
                  <div className="w-full lg:w-1/3 flex flex-col space-y-6">
                    <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                      <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Selling Price (USD)</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-gray-400">$</span>
                        <input required type="number" min="1" value={price} onChange={e=>setPrice(Number(e.target.value))} className="w-full p-4 pl-10 bg-white border-2 border-accent-DEFAULT/20 text-accent-DEFAULT rounded-2xl focus:ring-4 focus:ring-accent-DEFAULT/20 outline-none font-black text-3xl transition-all" />
                      </div>
                      <p className="text-xs text-gray-500 mt-3 font-medium flex items-center">
                        <Sparkles className="w-3 h-3 mr-1 text-accent-DEFAULT" /> AI Suggested: ${aiData.suggested_price_usd}
                      </p>
                    </div>

                    <button 
                      disabled={isPublishing} 
                      type="submit" 
                      className="w-full mt-auto bg-emerald-500 text-white font-black text-xl py-6 rounded-3xl hover:bg-emerald-600 disabled:opacity-70 transition-all shadow-[0_8px_30px_rgba(16,185,129,0.3)] hover:shadow-[0_12px_40px_rgba(16,185,129,0.4)] transform hover:-translate-y-1 active:scale-95 flex flex-col items-center justify-center relative overflow-hidden"
                    >
                      {isPublishing ? (
                        <>
                          <span className="relative z-10">Publishing...</span>
                          <span className="text-xs font-bold opacity-80 mt-1 relative z-10">Uploading Image {uploadProgress}%</span>
                          <motion.div 
                            className="absolute left-0 bottom-0 top-0 bg-emerald-600 z-0" 
                            initial={{ width: 0 }} 
                            animate={{ width: `${uploadProgress}%` }} 
                          />
                        </>
                      ) : (
                        <>
                          <div className="flex items-center">
                            <Save className="w-6 h-6 mr-2" />
                            Publish to Marketplace
                          </div>
                          <span className="text-[11px] uppercase tracking-widest opacity-80 mt-1">Make Listing Live</span>
                        </>
                      )}
                    </button>
                  </div>

                </form>
              </motion.div>
            )}

          </AnimatePresence>
        </motion.div>
      </div>
    </AuthGuard>
  );
}
