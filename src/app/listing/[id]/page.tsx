"use client";
import { useEffect, useState } from "react";
import { getListing, createOrder } from "@/lib/firestore";
import { useAuthState } from "@/lib/auth";
import { Listing } from "@/types";
import { MaterialBadge } from "@/components/shared/MaterialBadge";
import { AIOutlineOverlay } from "@/components/shared/AIOutlineOverlay";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { MapPin, Scale, Ruler, Layers, BadgeCheck, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function ListingDetail({ params }: { params: { id: string } }) {
  const { id } = params;
  const { user, role } = useAuthState();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState("");
  const [ordering, setOrdering] = useState(false);
  const router = useRouter();

  useEffect(() => {
    getListing(id).then(l => {
      setListing(l);
      setLoading(false);
    });
  }, [id]);

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || role !== 'buyer' || !listing) return;
    setOrdering(true);
    try {
      await createOrder({
        buyerId: user.uid,
        sellerId: listing.sellerId,
        listingId: listing.id!,
        status: 'pending',
        message
      });
      toast.success("Purchase request sent!");
      setShowModal(false);
      router.push("/dashboard/buyer");
    } catch (e: any) {
      toast.error("Failed to send request");
    } finally {
      setOrdering(false);
    }
  };

  if (loading) return <div className="flex-1 flex items-center justify-center min-h-[60vh]"><LoadingSpinner size="lg" /></div>;
  if (!listing) return <div className="flex-1 flex items-center justify-center"><h1 className="text-2xl font-bold">Listing not found</h1></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1">
      <div className="flex flex-col lg:flex-row gap-10">
        
        {/* LEFT COLUMN: IMAGE & AI */}
        <div className="w-full lg:w-1/2">
          <div className="relative rounded-3xl overflow-hidden border border-gray-100 shadow-[0_8px_32px_rgba(0,0,0,0.06)] bg-gray-50 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={listing.imageURL} alt={listing.title} className="w-full h-auto object-cover max-h-[600px]" />
            <AIOutlineOverlay points={listing.outline_points} />
            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full flex items-center text-white text-sm font-bold shadow-lg border border-white/10">
              <BadgeCheck className="w-4 h-4 text-emerald-400 mr-2" />
              AI Verified Geometry ({(listing.confidence * 100).toFixed(0)}%)
            </div>
            
            {/* AI Callouts overlayed dynamically */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} className="absolute bottom-6 right-6 bg-white px-5 py-3 rounded-2xl shadow-xl border border-gray-100 flex items-center space-x-3">
              <div className="bg-accent-DEFAULT/10 p-2 rounded-lg"><Ruler className="w-5 h-5 text-accent-DEFAULT" /></div>
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase">Estimated Area</p>
                <p className="text-lg font-black text-primary">{listing.surface_area_cm2} cm²</p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* RIGHT COLUMN: DETAILS */}
        <div className="w-full lg:w-1/2 flex flex-col">
          <div className="flex items-center space-x-3 mb-4">
            <MaterialBadge material={listing.material} />
            <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase ${listing.status==='active'?'bg-emerald-100 text-emerald-700':listing.status==='sold'?'bg-gray-100 text-gray-700':'bg-amber-100 text-amber-700'}`}>
              {listing.status}
            </span>
            <span className="text-sm text-gray-400 font-medium ml-auto">Listed {new Date(listing.createdAt).toLocaleDateString()}</span>
          </div>

          <h1 className="text-4xl lg:text-5xl font-black text-primary mb-6 tracking-tight leading-tight">{listing.title}</h1>
          <div className="text-5xl font-black text-accent-DEFAULT mb-8">${listing.price}</div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
              <Layers className="w-6 h-6 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500 font-semibold mb-1">Thickness</p>
              <p className="text-xl font-bold text-gray-900">{listing.thickness_mm} mm</p>
            </div>
            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
              <Scale className="w-6 h-6 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500 font-semibold mb-1">Estimated Weight</p>
              <p className="text-xl font-bold text-gray-900">{listing.estimated_weight_kg} kg</p>
            </div>
            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
              <Ruler className="w-6 h-6 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500 font-semibold mb-1">Bounding Box</p>
              <p className="text-xl font-bold text-gray-900">{listing.width_cm}x{listing.height_cm} cm</p>
            </div>
            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
              <MapPin className="w-6 h-6 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500 font-semibold mb-1">Pickup Location</p>
              <p className="text-xl font-bold text-gray-900">{listing.location}</p>
            </div>
          </div>

          <div className="mb-10 flex-1">
            <h3 className="text-lg font-bold text-primary mb-3">Seller Description</h3>
            <p className="text-gray-600 leading-relaxed font-medium">{listing.description}</p>
          </div>

          {user?.uid === listing.sellerId ? (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 font-bold text-center">
              This is your listing. Edit capabilities coming soon.
            </div>
          ) : role === 'buyer' ? (
            <button onClick={() => setShowModal(true)} disabled={listing.status !== 'active'} className="w-full bg-primary text-white text-xl font-bold py-5 rounded-2xl hover:bg-primary/90 disabled:opacity-50 transition shadow-lg shadow-primary/20 flex items-center justify-center">
              {listing.status === 'active' ? 'Request to Purchase' : 'Listing Unavailable'}
            </button>
          ) : (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-600 font-semibold text-center">
              Log in as a buyer to request this material.
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white w-full max-w-lg rounded-3xl p-8 relative z-10 shadow-2xl">
              <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-900"><X className="w-6 h-6" /></button>
              <h2 className="text-2xl font-black text-primary mb-2">Request Purchase</h2>
              <p className="text-gray-500 font-medium mb-6">Send a message to the seller to arrange pickup and payment for <span className="text-accent-DEFAULT font-bold">${listing.price}</span>.</p>
              
              <form onSubmit={handleOrder}>
                <textarea 
                  required rows={4} value={message} onChange={e=>setMessage(e.target.value)}
                  placeholder="Hi, I'd like to pick this up tomorrow morning. Is the price negotiable?"
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-accent-DEFAULT/50 outline-none font-medium mb-6"
                />
                <button type="submit" disabled={ordering} className="w-full bg-emerald-500 text-white font-bold py-4 rounded-xl hover:bg-emerald-600 disabled:opacity-50 transition shadow-lg shadow-emerald-500/30 flex items-center justify-center">
                  {ordering ? <LoadingSpinner size="sm" /> : "Send Request to Seller"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
