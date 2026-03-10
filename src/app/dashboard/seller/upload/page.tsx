"use client";
import { useState, useRef } from "react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { UploadZone } from "@/components/shared/UploadZone";
import { AIOutlineOverlay } from "@/components/shared/AIOutlineOverlay";
import { useAuthState } from "@/lib/auth";
import { uploadScrapImage } from "@/lib/storage";
import { createListing } from "@/lib/firestore";
import { AIAnalysisResult } from "@/types";
import { useRouter } from "next/navigation";
import { Sparkles, CheckCircle2, ArrowRight } from "lucide-react";
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
        
        if (!res.ok) throw new Error("Analysis failed");
        
        const data: AIAnalysisResult = await res.json();
        setAiData(data);
        setTitle(`Premium ${data.material} Offset`);
        setPrice(data.suggested_price_usd);
        setDescription(data.description);
      };
    } catch (e: any) {
      toast.error(e.message || "Failed to analyze image");
      setStep(1);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !file || !aiData || !title || !price || !location) return toast.error("Please fill all fields");

    setIsPublishing(true);
    try {
      // 1. Upload Image to Storage
      toast.loading("Uploading image...", { id: "publish" });
      const imageURL = await uploadScrapImage(user.uid, file, setUploadProgress);
      
      // 2. Save Listing to Firestore
      toast.loading("Creating listing...", { id: "publish" });
      await createListing({
        sellerId: user.uid,
        title, price, location,
        status: "active",
        imageURL,
        ...aiData
      });

      toast.success("Listing published successfully!", { id: "publish" });
      router.push("/dashboard/seller");
    } catch (e: any) {
      toast.error(e.message || "Failed to publish listing", { id: "publish" });
      setIsPublishing(false);
    }
  };

  return (
    <AuthGuard role="seller">
      <div className="max-w-4xl mx-auto px-4 py-10 w-full flex-1">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-black text-primary mb-2 tracking-tight">List an Offset</h1>
          <div className="flex items-center justify-center space-x-2 text-sm font-bold">
            <span className={step >= 1 ? "text-accent-DEFAULT" : "text-gray-300"}>1. Upload</span>
            <ArrowRight className="w-4 h-4 text-gray-300" />
            <span className={step >= 2 ? "text-accent-DEFAULT" : "text-gray-300"}>2. AI Analysis</span>
            <ArrowRight className="w-4 h-4 text-gray-300" />
            <span className={step === 3 ? "text-accent-DEFAULT" : "text-gray-300"}>3. Publish</span>
          </div>
        </div>

        <motion.div layout className="bg-white rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.06)] border border-gray-100 p-8">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: UPLOAD */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <h2 className="text-xl font-bold text-gray-900 mb-6">Upload High-Quality Photo</h2>
                <UploadZone file={file} onFileSelect={setFile} />
                <button 
                  disabled={!file} onClick={handleAnalyze}
                  className="w-full mt-8 bg-primary text-white font-bold py-4 rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20 transition-all flex items-center justify-center space-x-2"
                >
                  <Sparkles className="w-5 h-5 text-accent-DEFAULT" />
                  <span>Analyze with Gemini Vision</span>
                </button>
              </motion.div>
            )}

            {/* STEP 2: AI ANALYSIS */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                {isAnalyzing ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <motion.div animate={{ rotate: 360, scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
                      <Sparkles className="w-16 h-16 text-accent-DEFAULT mb-6" />
                    </motion.div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Extracting Geometry...</h3>
                    <p className="text-gray-500 font-medium">Gemini Pro Vision is calculating dimensions and material properties.</p>
                  </div>
                ) : aiData && (
                  <div className="space-y-8">
                    <div className="flex items-center text-emerald-600 font-bold bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                      <CheckCircle2 className="w-6 h-6 mr-3" />
                      AI Analysis Complete ({(aiData.confidence * 100).toFixed(0)}% Confidence)
                    </div>

                    <div className="flex flex-col md:flex-row gap-8">
                      <div className="w-full md:w-1/2 relative rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-gray-50">
                        {file && <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-auto" />}
                        <AIOutlineOverlay points={aiData.outline_points} />
                      </div>
                      
                      <div className="w-full md:w-1/2 grid grid-cols-2 gap-4">
                        {[
                          { l: "Material", v: aiData.material.toUpperCase(), c: "text-blue-600 bg-blue-50" },
                          { l: "Thickness", v: `${aiData.thickness_mm} mm`, c: "text-gray-900 bg-gray-50" },
                          { l: "Dimensions", v: `${aiData.width_cm}x${aiData.height_cm} cm`, c: "text-gray-900 bg-gray-50" },
                          { l: "Est. Weight", v: `${aiData.estimated_weight_kg.toFixed(2)} kg`, c: "text-gray-900 bg-gray-50" },
                          { l: "Surface", v: aiData.surface_condition, c: "text-gray-900 bg-gray-50" },
                          { l: "Suggested Price", v: `$${aiData.suggested_price_usd}`, c: "text-accent-DEFAULT bg-accent-DEFAULT/10 border border-accent-DEFAULT/20 shadow-inner" }
                        ].map((s, i) => (
                          <div key={i} className={`p-4 rounded-xl ${s.c}`}>
                            <p className="text-xs font-bold uppercase tracking-wider mb-1 opacity-60">{s.l}</p>
                            <p className="text-lg font-black">{s.v}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <button onClick={() => { setFile(null); setStep(1); }} className="flex-1 py-4 font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition">Re-upload</button>
                      <button onClick={() => setStep(3)} className="flex-1 py-4 font-bold text-white bg-primary hover:bg-primary/90 rounded-xl transition shadow-lg shadow-primary/20">Looks good, continue</button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* STEP 3: PUBLISH */}
            {step === 3 && aiData && (
              <motion.div key="step3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <h2 className="text-2xl font-bold text-primary mb-6">Review & Publish</h2>
                <form onSubmit={handlePublish} className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Listing Title</label>
                    <input required type="text" value={title} onChange={e=>setTitle(e.target.value)} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent-DEFAULT/50 outline-none font-medium" />
                  </div>
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Final Price (USD)</label>
                      <input required type="number" value={price} onChange={e=>setPrice(Number(e.target.value))} className="w-full p-4 bg-accent-DEFAULT/5 border border-accent-DEFAULT/20 text-accent-DEFAULT rounded-xl focus:ring-2 focus:ring-accent-DEFAULT/50 outline-none font-black text-xl" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Pickup Location</label>
                      <input required type="text" value={location} onChange={e=>setLocation(e.target.value)} placeholder="e.g. Factory Zip 10001" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent-DEFAULT/50 outline-none font-medium" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                    <textarea required rows={4} value={description} onChange={e=>setDescription(e.target.value)} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent-DEFAULT/50 outline-none font-medium" />
                  </div>

                  <button disabled={isPublishing} type="submit" className="w-full mt-8 bg-emerald-500 text-white font-black text-lg py-4 rounded-xl hover:bg-emerald-600 transition shadow-lg shadow-emerald-500/30 flex items-center justify-center">
                    {isPublishing ? `Publishing... (${uploadProgress.toFixed(0)}%)` : "Publish Listing to ScrapMart"}
                  </button>
                </form>
              </motion.div>
            )}

          </AnimatePresence>
        </motion.div>
      </div>
    </AuthGuard>
  );
}
