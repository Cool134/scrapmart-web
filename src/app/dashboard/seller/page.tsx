"use client";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { useAuthState } from "@/lib/auth";
import { getSellerListings, getOrdersForSeller } from "@/lib/firestore";
import { Listing, Order } from "@/types";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Package, TrendingUp, CheckCircle, Clock } from "lucide-react";
import { motion } from "framer-motion";

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
      });
    }
  }, [user]);

  const activeCount = listings.filter(l => l.status === 'active').length;
  const pendingCount = orders.filter(o => o.status === 'pending').length;
  const revenue = listings.filter(l => l.status === 'sold').reduce((sum, l) => sum + l.price, 0);

  return (
    <AuthGuard role="seller">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-black text-primary">Factory Dashboard</h1>
          <Link href="/dashboard/seller/upload" className="flex items-center space-x-2 bg-accent-DEFAULT text-white px-5 py-2.5 rounded-full font-bold shadow-lg shadow-accent-DEFAULT/20 hover:bg-accent-DEFAULT/90 transition-all">
            <Plus className="w-5 h-5" />
            <span>New Listing</span>
          </Link>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[
            { label: "Total Listings", val: listings.length, icon: Package, color: "text-blue-500", bg: "bg-blue-50" },
            { label: "Active Listings", val: activeCount, icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-50" },
            { label: "Pending Orders", val: pendingCount, icon: Clock, color: "text-amber-500", bg: "bg-amber-50" },
            { label: "Est. Revenue (Sold)", val: `$${revenue}`, icon: TrendingUp, color: "text-purple-500", bg: "bg-purple-50" }
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-white p-6 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-gray-100 flex items-center space-x-4">
              <div className={`p-4 rounded-full ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-500">{stat.label}</p>
                <p className="text-2xl font-black text-primary">{stat.val}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Content Grids */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Listings */}
          <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-gray-100 p-6 overflow-hidden">
            <h2 className="text-xl font-bold text-primary mb-6">Your Offsets</h2>
            {loading ? <p>Loading...</p> : listings.length === 0 ? (
              <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <p className="text-gray-500 font-medium">No listings yet.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 no-scrollbar">
                {listings.map(l => (
                  <div key={l.id} className="flex items-center space-x-4 p-4 hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-gray-100">
                    <img src={l.imageURL} alt={l.title} className="w-16 h-16 rounded-lg object-cover bg-gray-100" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{l.title}</p>
                      <p className="text-sm text-gray-500">${l.price} • {l.material}</p>
                    </div>
                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${l.status==='active'?'bg-emerald-100 text-emerald-700':l.status==='sold'?'bg-gray-100 text-gray-700':'bg-amber-100 text-amber-700'}`}>
                      {l.status.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Orders */}
          <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-gray-100 p-6 overflow-hidden">
            <h2 className="text-xl font-bold text-primary mb-6">Purchase Requests</h2>
            {loading ? <p>Loading...</p> : orders.length === 0 ? (
              <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <p className="text-gray-500 font-medium">No incoming orders yet.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 no-scrollbar">
                {orders.map(o => (
                  <div key={o.id} className="p-5 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-bold text-gray-900 text-sm">Order #{o.id?.slice(-6)}</p>
                      <span className={`px-2 py-1 text-[10px] font-bold rounded-full uppercase ${o.status==='pending'?'bg-amber-100 text-amber-700':o.status==='accepted'?'bg-emerald-100 text-emerald-700':'bg-red-100 text-red-700'}`}>
                        {o.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-4 bg-white p-3 rounded-lg border border-gray-100 italic">"{o.message}"</p>
                    {o.status === 'pending' && (
                      <div className="flex space-x-3">
                        <button className="flex-1 bg-emerald-500 text-white font-bold py-2 rounded-lg hover:bg-emerald-600 transition">Accept</button>
                        <button className="flex-1 bg-white border border-gray-200 text-gray-700 font-bold py-2 rounded-lg hover:bg-gray-50 transition">Reject</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
