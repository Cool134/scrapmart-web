"use client";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { useAuthState } from "@/lib/auth";
import { getOrdersForBuyer, getSavedListings } from "@/lib/firestore";
import { Order, Listing } from "@/types";
import { useEffect, useState } from "react";
import Link from "next/link";
import { PackageSearch, Clock, ExternalLink, Bookmark, ShieldAlert, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ListingCard, ListingCardSkeleton } from "@/components/shared/ListingCard";

export default function BuyerDashboard() {
  const { user } = useAuthState();
  const [orders, setOrders] = useState<Order[]>([]);
  const [savedListings, setSavedListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'requests' | 'saved'>('requests');

  useEffect(() => {
    if (user?.uid) {
      Promise.all([
        getOrdersForBuyer(user.uid),
        getSavedListings(user.uid)
      ]).then(([o, s]) => {
        setOrders(o);
        setSavedListings(s);
        setLoading(false);
      }).catch(e => {
        console.error("Buyer dashboard error:", e);
        setLoading(false);
      });
    }
  }, [user]);

  const pendingCount = orders.filter(o => o.status === 'pending').length;
  const acceptedCount = orders.filter(o => o.status === 'accepted').length;

  return (
    <AuthGuard role="buyer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <h1 className="text-4xl font-black text-primary tracking-tight">Buyer Dashboard</h1>
            <p className="text-gray-500 font-medium mt-2">Track your material requests and saved offsets.</p>
          </div>
          <Link 
            href="/search" 
            className="flex items-center justify-center space-x-2 bg-primary text-white px-6 py-3 rounded-full font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 transform hover:-translate-y-0.5"
          >
            <PackageSearch className="w-5 h-5" />
            <span>Browse Inventory</span>
          </Link>
        </div>

        {/* Dashboard Tabs */}
        <div className="flex space-x-2 border-b border-gray-200 mb-8">
          <button 
            onClick={() => setActiveTab('requests')}
            className={`pb-4 px-4 text-sm font-bold tracking-wide uppercase transition-all border-b-2 ${
              activeTab === 'requests' ? 'border-accent-DEFAULT text-accent-DEFAULT' : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            Purchase Requests ({orders.length})
          </button>
          <button 
            onClick={() => setActiveTab('saved')}
            className={`pb-4 px-4 text-sm font-bold tracking-wide uppercase transition-all border-b-2 ${
              activeTab === 'saved' ? 'border-accent-DEFAULT text-accent-DEFAULT' : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            Saved Items ({savedListings.length})
          </button>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'requests' && (
            <motion.div 
              key="requests"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="bg-white rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.03)] border border-gray-100 overflow-hidden"
            >
              {/* Status Summary */}
              <div className="bg-gray-50/50 border-b border-gray-100 p-6 flex flex-wrap gap-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-amber-100 text-amber-700 rounded-lg"><Clock className="w-5 h-5" /></div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Pending</p>
                    <p className="text-xl font-black text-gray-900">{pendingCount}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 border-l border-gray-200 pl-6">
                  <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg"><ShieldAlert className="w-5 h-5" /></div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Ready for Pickup</p>
                    <p className="text-xl font-black text-gray-900">{acceptedCount}</p>
                  </div>
                </div>
              </div>

              {/* Orders List */}
              <div className="p-6">
                {loading ? (
                  <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-24 bg-gray-50 animate-pulse rounded-2xl"></div>)}</div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-20">
                    <PackageSearch className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No active requests</h3>
                    <p className="text-gray-500 font-medium mb-6">You haven't contacted any factories yet.</p>
                    <Link href="/search" className="text-accent-DEFAULT font-bold bg-accent-DEFAULT/10 px-6 py-3 rounded-full hover:bg-accent-DEFAULT/20 transition-colors">Start searching</Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {orders.map((order, i) => (
                      <motion.div 
                        key={order.id} 
                        initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                        className="flex flex-col md:flex-row md:items-center justify-between p-5 bg-white border border-gray-100 shadow-sm hover:shadow-md rounded-2xl transition-all gap-6 group"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="font-mono text-xs text-gray-400 font-bold bg-gray-50 px-2 py-1 rounded">ID: {order.id?.slice(-8)}</span>
                            <span className="text-xs text-gray-400 font-medium">{new Date(order.createdAt).toLocaleDateString()}</span>
                          </div>
                          
                          <div className="flex items-start mt-4">
                            <div className="w-1 h-full bg-gray-200 rounded-full mr-4"></div>
                            <div className="flex-1">
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Your Message</p>
                              <p className="text-sm font-medium text-gray-700 italic">"{order.message}"</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-start md:items-end justify-center min-w-[200px] border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
                          <span className={`px-4 py-1.5 text-xs font-black tracking-widest rounded-full uppercase mb-4 ${
                            order.status === 'pending' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                            order.status === 'accepted' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                            'bg-red-100 text-red-800 border border-red-200'
                          }`}>
                            {order.status}
                          </span>
                          <Link 
                            href={`/listing/${order.listingId}`}
                            className="flex items-center text-sm font-bold text-accent-DEFAULT hover:text-primary transition-colors"
                          >
                            View Original Listing
                            <ExternalLink className="w-4 h-4 ml-1.5" />
                          </Link>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'saved' && (
            <motion.div 
              key="saved"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            >
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map(i => <ListingCardSkeleton key={i} />)}
                </div>
              ) : savedListings.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                  <Bookmark className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No saved items</h3>
                  <p className="text-gray-500 font-medium">Items you save while browsing will appear here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {savedListings.map(listing => (
                    <ListingCard key={listing.id} listing={listing} />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </AuthGuard>
  );
}
