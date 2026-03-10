"use client";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { useAuthState } from "@/lib/auth";
import { getOrdersForBuyer } from "@/lib/firestore";
import { Order } from "@/types";
import { useEffect, useState } from "react";
import Link from "next/link";
import { PackageSearch, Clock } from "lucide-react";
import { motion } from "framer-motion";

export default function BuyerDashboard() {
  const { user } = useAuthState();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.uid) {
      getOrdersForBuyer(user.uid).then(o => {
        setOrders(o);
        setLoading(false);
      });
    }
  }, [user]);

  return (
    <AuthGuard role="buyer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-black text-primary">Buyer Dashboard</h1>
          <Link href="/search" className="flex items-center space-x-2 bg-primary text-white px-5 py-2.5 rounded-full font-bold hover:bg-primary/90 transition-all shadow-md">
            <PackageSearch className="w-5 h-5" />
            <span>Find Materials</span>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-gray-100 p-8">
          <h2 className="text-xl font-bold text-primary mb-6 flex items-center"><Clock className="w-5 h-5 mr-2 text-accent-DEFAULT" /> Order History</h2>
          
          {loading ? (
            <p>Loading...</p>
          ) : orders.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <PackageSearch className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium mb-4">You haven't requested any materials yet.</p>
              <Link href="/search" className="text-accent-DEFAULT font-bold hover:underline">Start browsing offsets &rarr;</Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 text-sm font-semibold text-gray-500 uppercase tracking-wider">
                    <th className="pb-4 pr-4">Order ID</th>
                    <th className="pb-4 px-4">Listing ID</th>
                    <th className="pb-4 px-4">Status</th>
                    <th className="pb-4 px-4">Date Sent</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {orders.map((order, i) => (
                    <motion.tr 
                      key={order.id} 
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 pr-4 font-mono text-gray-900">#{order.id?.slice(-6)}</td>
                      <td className="py-4 px-4"><Link href={`/listing/${order.listingId}`} className="text-accent-DEFAULT hover:underline font-mono">{order.listingId.slice(-6)}</Link></td>
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-1 text-xs font-bold rounded-full uppercase ${order.status==='pending'?'bg-amber-100 text-amber-700':order.status==='accepted'?'bg-emerald-100 text-emerald-700':'bg-red-100 text-red-700'}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-500 font-medium">{new Date(order.createdAt).toLocaleDateString()}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
