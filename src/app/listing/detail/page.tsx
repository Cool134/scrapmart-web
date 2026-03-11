"use client";
import { useEffect, useState, Suspense } from "react";
import { getListing, createOrder } from "@/lib/firestore";
import { useAuthState } from "@/lib/auth";
import { Listing } from "@/types";
import { MaterialBadge } from "@/components/shared/MaterialBadge";
import { AIOutlineOverlay } from "@/components/shared/AIOutlineOverlay";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { MapPin, Scale, Ruler, Layers, BadgeCheck, X, FileText, Calendar, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

function ListingDetailContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const { user, role, loading: authLoading } = useAuthState();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState("");
  const [ordering, setOrdering] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (id) {
      getListing(id).then(l => {
        setListing(l);
        setLoading(false);
      }).catch(() => {
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [id]);

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || role !== 'buyer' || !listing) return;
    
    if (!message.trim()) {
      toast.error("Please add a message for the seller.");
      return;
    }

    setOrdering(true);
    try {
      await createOrder({
        buyerId: user.uid,
        sellerId: listing.sellerId,
        listingId: listing.id!,
        status: 'pending',
        message: message.trim()
      });
      toast.success("Purchase request sent successfully!");
      setShowModal(false);
      router.push("/dashboard/buyer");
    } catch (err: unknown) {
      toast.error((err as Error).message || "Failed to send purchase request.");
    } finally {
      setOrdering(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[80vh]">
        <LoadingSpinner size="lg" label="Loading Listing Details..." />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <FileText className="w-10 h-10 text-gray-400" />
        </div>
        <h1 className="text-3xl font-black text-gray-900 mb-2">Listing Not Found</h1>
        <p className="text-gray-500 font-medium mb-8 max-w-md">This material may have been removed by the factory or the URL is incorrect.</p>
        <Link href="/search" className="bg-primary text-white px-8 py-3 rounded-full font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
          Browse Inventory
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1">
      <div className="flex flex-col lg:flex-row gap-12">
        <div className="w-full lg:w-[55%]">
          <div className="sticky top-24">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="relative rounded-[2rem] overflow-hidden border border-gray-200/60 shadow-[0_8px_40px_rgba(0,0,0,0.06)] bg-gray-50 group aspect-square md:aspect-[4/3] flex items-center justify-center"
            >
              <Image 
                src={listing.imageURL} 
                alt={listing.title} 
                fill
                className="object-contain p-4" 
              />
              {listing.outline_points && <AIOutlineOverlay points={listing.outline_points} />}
              <div className="absolute top-6 left-6 bg-black/70 backdrop-blur-xl px-4 py-2 rounded-full flex items-center text-white text-sm font-bold shadow-lg border border-white/10">
                <BadgeCheck className="w-4 h-4 text-emerald-400 mr-2" />
                AI Verified Geometry
              </div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="absolute bottom-6 right-6 bg-white/90 backdrop-blur-md px-5 py-3 rounded-2xl shadow-xl border border-gray-200 flex items-center space-x-4">
                <div className="bg-accent-DEFAULT/10 p-2.5 rounded-xl"><Ruler className="w-6 h-6 text-accent-DEFAULT" /></div>
                <div><p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Est. Usable Area</p><p className="text-xl font-black text-primary">{listing.surface_area_cm2} cm²</p></div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        <div className="w-full lg:w-[45%] flex flex-col">
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <MaterialBadge material={listing.material} size="lg" />
              <span className={`px-4 py-1.5 text-xs font-bold rounded-full uppercase tracking-widest ${listing.status === 'active' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : listing.status === 'sold' ? 'bg-gray-100 text-gray-700 border border-gray-200' : 'bg-amber-100 text-amber-700 border border-amber-200'}`}>{listing.status}</span>
              <span className="flex items-center text-sm text-gray-400 font-semibold ml-auto"><Calendar className="w-4 h-4 mr-1.5" />{new Date(listing.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric'})}</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-black text-primary mb-6 tracking-tight leading-tight">{listing.title}</h1>
            <div className="flex items-baseline mb-10">
              <span className="text-6xl font-black text-accent-DEFAULT tracking-tighter">${listing.price.toLocaleString()}</span>
              <span className="text-xl text-gray-400 font-bold ml-2">USD</span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-10">
              {[
                { icon: Layers, label: "Thickness", value: `${listing.thickness_mm} mm`, desc: "Gauge" },
                { icon: Scale, label: "Weight", value: `${listing.estimated_weight_kg.toFixed(2)} kg`, desc: "Estimated" },
                { icon: Ruler, label: "Dimensions", value: `${listing.width_cm}x${listing.height_cm} cm`, desc: "Bounding Box" },
                { icon: MapPin, label: "Location", value: listing.location, desc: "Pickup Area" },
              ].map((metric, i) => (
                <div key={i} className="bg-gray-50 p-5 rounded-2xl border border-gray-100 hover:border-gray-200 transition-colors">
                  <div className="flex items-center space-x-3 mb-3"><div className="bg-white p-2 rounded-lg shadow-sm border border-gray-100"><metric.icon className="w-5 h-5 text-gray-500" /></div><p className="text-xs text-gray-500 font-bold uppercase tracking-wider">{metric.label}</p></div>
                  <p className="text-xl font-black text-gray-900">{metric.value}</p>
                  <p className="text-xs text-gray-400 font-medium mt-1">{metric.desc}</p>
                </div>
              ))}
            </div>

            <div className="mb-10 bg-white border border-gray-100 shadow-sm p-6 rounded-2xl">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-3 flex items-center"><FileText className="w-4 h-4 mr-2 text-gray-400" />Factory Description</h3>
              <p className="text-gray-600 leading-relaxed font-medium text-lg">{listing.description}</p>
            </div>

            <div className="mt-auto">
              {authLoading ? (
                <div className="w-full py-5 bg-gray-50 rounded-2xl animate-pulse"></div>
              ) : !user ? (
                <div className="p-6 bg-gray-50 border border-gray-200 rounded-2xl text-center"><p className="text-gray-600 font-medium mb-4">You must be logged in to request this material.</p><Link href={`/auth?callbackUrl=/listing/detail?id=${id}`} className="bg-primary text-white px-8 py-3 rounded-full font-bold shadow-md hover:bg-primary/90 transition-all inline-block">Sign in to Purchase</Link></div>
              ) : user.uid === listing.sellerId ? (
                <div className="p-6 bg-blue-50 border border-blue-200 rounded-2xl text-center"><p className="text-blue-800 font-bold text-lg mb-1">This is your listing.</p><p className="text-blue-600 font-medium text-sm">You can manage this item from your Seller Dashboard.</p></div>
              ) : role === 'buyer' ? (
                <button onClick={() => setShowModal(true)} disabled={listing.status !== 'active'} className={`w-full py-5 rounded-2xl font-black text-xl flex items-center justify-center space-x-3 transition-all ${listing.status === 'active' ? 'bg-primary text-white shadow-[0_8px_30px_rgba(26,26,46,0.2)] hover:bg-primary/90 hover:shadow-[0_12px_40px_rgba(26,26,46,0.3)] transform hover:-translate-y-1' : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'}`}>
                  <span>{listing.status === 'active' ? 'Request to Purchase' : 'Listing Unavailable'}</span>{listing.status === 'active' && <Send className="w-5 h-5" />}
                </button>
              ) : (
                <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl text-center"><p className="text-amber-800 font-bold">Seller Accounts cannot purchase material.</p></div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => !ordering && setShowModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white w-full max-w-lg rounded-[2rem] p-8 relative z-10 shadow-2xl overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-accent-DEFAULT to-blue-400" />
              <button onClick={() => !ordering && setShowModal(false)} className="absolute top-6 right-6 p-2 bg-gray-50 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors" disabled={ordering}><X className="w-5 h-5" /></button>
              <h2 className="text-3xl font-black text-primary mb-2">Send Request</h2>
              <p className="text-gray-500 font-medium mb-6">Connect with the factory to arrange pickup and payment for <strong className="text-accent-DEFAULT">${listing.price}</strong>.</p>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-6 flex items-center space-x-4">
                <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                  <Image src={listing.imageURL} alt="thumbnail" fill className="object-cover bg-white" />
                </div>
                <div><p className="font-bold text-gray-900 text-sm truncate max-w-[250px]">{listing.title}</p><p className="text-xs text-gray-500 font-medium">{listing.location}</p></div>
              </div>
              <form onSubmit={handleOrder}>
                <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Your Message</label>
                <textarea required rows={4} value={message} onChange={e=>setMessage(e.target.value)} placeholder="Hi, I'm a local fabricator. I can pick this up tomorrow morning. Is the price flexible?" className="w-full p-4 bg-white border border-gray-200 shadow-inner rounded-2xl focus:ring-2 focus:ring-accent-DEFAULT/20 focus:border-accent-DEFAULT outline-none font-medium mb-8 resize-none transition-all" disabled={ordering} />
                <div className="flex space-x-3">
                  <button type="button" onClick={() => setShowModal(false)} disabled={ordering} className="flex-1 py-4 font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">Cancel</button>
                  <button type="submit" disabled={ordering || !message.trim()} className="flex-[2] bg-accent-DEFAULT text-white font-black py-4 rounded-xl hover:bg-accent-DEFAULT/90 disabled:opacity-50 transition-all shadow-lg shadow-accent-DEFAULT/20 flex items-center justify-center">
                    {ordering ? <LoadingSpinner size="sm" /> : <><Send className="w-5 h-5 mr-2" /><span>Send to Factory</span></>}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ListingDetail() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center p-10"><LoadingSpinner size="lg" label="Loading..." /></div>}>
      <ListingDetailContent />
    </Suspense>
  );
}
