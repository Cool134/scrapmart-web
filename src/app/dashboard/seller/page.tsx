"use client";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { useAuthState } from "@/lib/auth";
import { getSellerListings, getOrdersForSeller, updateOrderStatus } from "@/lib/firestore";
import { Listing, Order } from "@/types";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Package, TrendingUp, CheckCircle, Clock, ArrowRight, ExternalLink, Inbox, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

export default function SellerDashboard() {
  const { user } = useAuthState();
  const [listings, setListings] = useState<Listing[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.uid) {
      Promise.all([
        getSellerListings(user.uid),
        getOrdersForSeller(user.uid)
      ]).then(([l, o]) => {
        setListings(l);
        setOrders(o);
        setLoading(false);
      }).catch((e) => {
        console.error("Dashboard error:", e);
        toast.error("Failed to load dashboard data");
        setLoading(false);
      });
    }
  }, [user]);

  const handleUpdateOrderStatus = async (orderId: string, status: Order['status']) => {
    const loadingToast = toast.loading(`Marking as ${status}...`);
    try {
      await updateOrderStatus(orderId, status);
      
      // Optimistic update
      setOrders(orders.map(o => o.id === orderId ? { ...o, status } : o));
      
      toast.success(`Order ${status}`, { id: loadingToast });
    } catch (e: unknown) {
      toast.error((e as Error).message || "Failed to update order", { id: loadingToast });
    }
  };

  const activeCount = listings.filter(l => l.status === 'active').length;
  const pendingOrders = orders.filter(o => o.status === 'pending');
  const revenue = listings.filter(l => l.status === 'sold').reduce((sum, l) => sum + l.price, 0);

  return (
    <AuthGuard role="seller">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-black text-primary tracking-tight">Factory Dashboard</h1>
            <p className="text-gray-500 font-medium mt-1">Manage your industrial offset inventory and orders.</p>
          </div>
          <Link 
            href="/dashboard/seller/upload" 
            className="flex items-center justify-center space-x-2 bg-primary text-white px-6 py-3.5 rounded-full font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 hover:shadow-xl hover:-translate-y-0.5 transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>New AI Listing</span>
          </Link>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { label: "Total Listings", val: listings.length, icon: Package, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
            { label: "Active Offsets", val: activeCount, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
            { label: "Pending Requests", val: pendingOrders.length, icon: Clock, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
            { label: "Est. Revenue (Sold)", val: `$${revenue.toLocaleString()}`, icon: TrendingUp, color: "text-accent-DEFAULT", bg: "bg-accent-DEFAULT/10", border: "border-accent-DEFAULT/20" }
          ].map((stat, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: i * 0.1 }} 
              className={`bg-white p-6 rounded-3xl shadow-sm border ${stat.border} flex items-center space-x-5`}
            >
              <div className={`p-4 rounded-2xl ${stat.bg}`}>
                <stat.icon className={`w-7 h-7 ${stat.color}`} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">{stat.label}</p>
                <p className="text-3xl font-black text-gray-900">{stat.val}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main Content Grids */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          {/* INCOMING ORDERS (Priority View) */}
          <div className="xl:col-span-7 flex flex-col">
            <div className="bg-white rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.03)] border border-gray-100 flex-1 flex flex-col overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                <h2 className="text-xl font-bold text-primary flex items-center">
                  <Inbox className="w-5 h-5 mr-2 text-accent-DEFAULT" />
                  Purchase Requests
                  {pendingOrders.length > 0 && (
                    <span className="ml-3 px-2.5 py-0.5 bg-red-100 text-red-700 text-xs font-black rounded-full">
                      {pendingOrders.length} NEW
                    </span>
                  )}
                </h2>
              </div>
              
              <div className="p-6 flex-1 overflow-y-auto max-h-[600px] no-scrollbar">
                {loading ? (
                  <div className="space-y-4">{[1,2].map(i => <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-2xl"></div>)}</div>
                ) : orders.length === 0 ? (
                  <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
                      <Inbox className="w-8 h-8 text-gray-300" />
                    </div>
                    <p className="text-gray-500 font-medium">No incoming orders yet.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <AnimatePresence>
                      {orders.map(o => {
                        const relatedListing = listings.find(l => l.id === o.listingId);
                        return (
                          <motion.div 
                            key={o.id} 
                            initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
                            className={`p-5 rounded-2xl border ${o.status === 'pending' ? 'bg-white border-amber-200 shadow-md shadow-amber-100/50' : 'bg-gray-50 border-gray-100 opacity-70'}`}
                          >
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <span className={`inline-block px-3 py-1 text-[10px] font-black tracking-widest rounded-full uppercase mb-2 ${
                                  o.status==='pending'?'bg-amber-100 text-amber-800':
                                  o.status==='accepted'?'bg-emerald-100 text-emerald-800':
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {o.status}
                                </span>
                                <p className="font-mono text-gray-400 text-xs">Order ID: {o.id}</p>
                              </div>
                              <span className="text-xs font-bold text-gray-400 flex items-center">
                                <Calendar className="w-3 h-3 mr-1" />
                                {new Date(o.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            
                            {relatedListing && (
                              <div className="flex items-center bg-white border border-gray-100 p-3 rounded-xl mb-4 shadow-sm">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={relatedListing.imageURL} alt="Thumb" className="w-10 h-10 rounded-lg object-cover mr-3 bg-gray-100" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-bold text-gray-900 truncate">{relatedListing.title}</p>
                                  <p className="text-xs text-accent-DEFAULT font-black">${relatedListing.price}</p>
                                </div>
                                <Link href={`/listing/detail?id=${relatedListing.id}`} className="p-2 hover:bg-gray-50 rounded-lg transition">
                                  <ExternalLink className="w-4 h-4 text-gray-400" />
                                </Link>
                              </div>
                            )}

                            <div className="bg-white border border-gray-100 p-4 rounded-xl shadow-inner mb-5 relative">
                              <div className="absolute -top-2 left-4 px-2 bg-white text-[10px] font-bold text-gray-400 uppercase">Buyer Message</div>
                              <p className="text-sm text-gray-700 italic">&quot;{o.message}&quot;</p>
                            </div>

                            {o.status === 'pending' && (
                              <div className="flex space-x-3">
                                <button 
                                  onClick={() => handleUpdateOrderStatus(o.id!, 'accepted')}
                                  className="flex-1 bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary/90 transition shadow-md flex justify-center items-center"
                                >
                                  Accept & Arrange
                                </button>
                                <button 
                                  onClick={() => handleUpdateOrderStatus(o.id!, 'rejected')}
                                  className="flex-1 bg-white border border-gray-200 text-red-600 font-bold py-3 rounded-xl hover:bg-red-50 transition"
                                >
                                  Decline
                                </button>
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* INVENTORY LIST (Secondary View) */}
          <div className="xl:col-span-5 flex flex-col">
            <div className="bg-white rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.03)] border border-gray-100 flex-1 flex flex-col overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                <h2 className="text-xl font-bold text-primary flex items-center">
                  <Package className="w-5 h-5 mr-2 text-accent-DEFAULT" />
                  Your Inventory
                </h2>
                <Link href="/search" className="text-xs font-bold text-gray-500 hover:text-accent-DEFAULT uppercase tracking-wider">View Storefront</Link>
              </div>
              
              <div className="flex-1 overflow-y-auto max-h-[600px] no-scrollbar p-4">
                {loading ? (
                  <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-20 bg-gray-100 animate-pulse rounded-2xl"></div>)}</div>
                ) : listings.length === 0 ? (
                   <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center">
                     <p className="text-gray-500 font-medium">No inventory listed.</p>
                   </div>
                ) : (
                  <div className="space-y-3">
                    {listings.map(l => (
                      <Link 
                        key={l.id} 
                        href={`/listing/detail?id=${l.id}`}
                        className="flex items-center space-x-4 p-3 bg-white border border-gray-100 hover:border-accent-DEFAULT/30 hover:shadow-md rounded-2xl transition-all group"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={l.imageURL} alt={l.title} className="w-16 h-16 rounded-xl object-cover bg-gray-100 group-hover:scale-105 transition-transform" />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-900 text-sm truncate group-hover:text-accent-DEFAULT transition-colors">{l.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5 font-medium">${l.price} • {l.estimated_weight_kg}kg</p>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className={`px-2.5 py-1 text-[10px] font-black tracking-widest rounded-full uppercase mb-1 ${
                            l.status==='active'?'bg-emerald-100 text-emerald-700':
                            l.status==='sold'?'bg-gray-100 text-gray-500':
                            'bg-amber-100 text-amber-700'
                          }`}>
                            {l.status}
                          </span>
                          <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-accent-DEFAULT group-hover:translate-x-1 transition-all" />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </AuthGuard>
  );
}
