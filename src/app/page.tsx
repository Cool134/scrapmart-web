"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ListingCard, ListingCardSkeleton } from "@/components/shared/ListingCard";
import { getListings } from "@/lib/firestore";
import { Listing } from "@/types";
import Link from "next/link";

const placeholders = [
  "Search steel offsets...",
  "Find aluminum sheets...",
  "Browse copper scrap...",
  "Looking for 5mm brass plates?"
];

export default function Home() {
  const [index, setIndex] = useState(0);
  const [search, setSearch] = useState("");
  const [featured, setFeatured] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await getListings();
        setFeatured(res.slice(0, 6));
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchFeatured();
    const intervalId = setInterval(() => setIndex((i) => (i + 1) % placeholders.length), 2500);
    return () => clearInterval(intervalId);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) router.push(`/search?q=${encodeURIComponent(search)}`);
  };

  return (
    <div className="flex flex-col items-center w-full pb-20">
      <section className="w-full flex flex-col items-center justify-center min-h-[60vh] px-4 pt-16 pb-12 bg-white/50">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-10">
          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-primary mb-6">
            The Industrial <br className="hidden md:block"/> <span className="text-accent-DEFAULT bg-clip-text text-transparent bg-gradient-to-r from-accent-DEFAULT to-blue-400">Waste Economy.</span>
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto font-medium">Connect with factories. Buy premium manufacturing offsets. Build sustainably.</p>
        </motion.div>

        <form onSubmit={handleSearch} className="w-full max-w-3xl relative">
          <motion.div whileFocus="focused" className="relative group bg-white shadow-[0_8px_32px_rgba(0,0,0,0.06)] border border-gray-100 rounded-full px-6 py-4 flex items-center hover:shadow-[0_8px_40px_rgba(79,70,229,0.12)] transition-shadow">
            <Search className="w-6 h-6 text-gray-400 mr-4" />
            <input 
              type="text" 
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xl bg-transparent outline-none text-gray-800 font-medium z-10"
              placeholder=""
            />
            {!search && (
              <div className="absolute left-[56px] right-6 flex items-center pointer-events-none h-full z-0 overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.span 
                    key={index}
                    initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-gray-400 text-xl block truncate"
                  >
                    {placeholders[index]}
                  </motion.span>
                </AnimatePresence>
              </div>
            )}
            <button type="submit" className="hidden" />
          </motion.div>
        </form>

        <div className="flex flex-wrap items-center justify-center gap-3 mt-10">
          {['steel', 'aluminum', 'copper', 'brass'].map(mat => (
            <Link key={mat} href={`/search?material=${mat}`} className="px-5 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-full text-sm font-semibold hover:bg-gray-50 hover:border-accent-DEFAULT/30 transition-all shadow-sm">
              {mat.charAt(0).toUpperCase() + mat.slice(1)}
            </Link>
          ))}
        </div>
      </section>

      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="flex justify-between items-end mb-8">
          <h2 className="text-3xl font-bold text-primary tracking-tight">Featured Offsets</h2>
          <Link href="/search" className="text-accent-DEFAULT font-semibold hover:underline">View all &rarr;</Link>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1,2,3,4,5,6].map(i => <ListingCardSkeleton key={i} />)}
          </div>
        ) : featured.length === 0 ? (
          <div className="w-full py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200 flex flex-col items-center justify-center">
            <p className="text-gray-500 font-medium">No listings available right now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {featured.map(listing => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>
    </div>
  );
}
