"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ListingCard, ListingCardSkeleton } from "@/components/shared/ListingCard";
import { getListings } from "@/lib/firestore";
import { Listing } from "@/types";
import Link from "next/link";


const placeholders = [
  "Search steel offsets...",
  "Find 3mm aluminum sheets...",
  "Browse copper scrap near me...",
  "Looking for brass plates?"
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
        // Sort by newest first to get fresh listings
        const sorted = res.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setFeatured(sorted.slice(0, 6));
      } catch (e) { 
        console.error("Failed to load featured listings:", e);
      } finally { 
        setLoading(false); 
      }
    };
    fetchFeatured();
    
    // Cycle search placeholders
    const intervalId = setInterval(() => setIndex((i) => (i + 1) % placeholders.length), 3000);
    return () => clearInterval(intervalId);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/search?q=${encodeURIComponent(search.trim())}`);
    }
  };

  return (
    <div className="flex flex-col items-center w-full pb-24">
      
      {/* HERO SECTION */}
      <section className="relative w-full flex flex-col items-center justify-center min-h-[70vh] px-4 pt-20 pb-16 overflow-hidden">
        {/* Background gradient blob */}
        <div className="absolute top-0 -translate-y-1/2 w-full max-w-3xl h-[500px] bg-accent-DEFAULT/10 rounded-full blur-[100px] pointer-events-none -z-10" />

        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.7, ease: "easeOut" }} 
          className="text-center mb-12 z-10"
        >
          <div className="inline-flex items-center justify-center px-4 py-1.5 mb-6 text-sm font-bold text-accent-DEFAULT bg-accent-DEFAULT/10 rounded-full border border-accent-DEFAULT/20 shadow-sm">
            <Sparkles className="w-4 h-4 mr-2" />
            AI-Powered Industrial Marketplace
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tight text-primary mb-6 leading-tight">
            The Industrial <br className="hidden md:block"/> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-DEFAULT to-blue-400">
              Waste Economy.
            </span>
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto font-medium">
            Factories sell premium manufacturing offsets. You buy raw materials at scrap prices.
          </p>
        </motion.div>

        {/* SEARCH BAR */}
        <form onSubmit={handleSearch} className="w-full max-w-3xl relative z-10 px-4">
          <motion.div 
            whileFocus="focused" 
            className="relative group bg-white/90 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.06)] border border-gray-200 rounded-full px-6 py-5 flex items-center hover:shadow-[0_8px_40px_rgba(79,70,229,0.15)] transition-all duration-300"
          >
            <Search className="w-7 h-7 text-gray-400 mr-4 group-focus-within:text-accent-DEFAULT transition-colors" />
            <input 
              type="text" 
              value={search} 
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xl bg-transparent outline-none text-gray-800 font-medium z-10 placeholder-transparent"
              placeholder=" "
            />
            {/* Animated Placeholder logic */}
            {!search && (
              <div className="absolute left-[70px] right-6 flex items-center pointer-events-none h-full z-0 overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.span 
                    key={index}
                    initial={{ y: 20, opacity: 0 }} 
                    animate={{ y: 0, opacity: 1 }} 
                    exit={{ y: -20, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-gray-400 text-xl block truncate"
                  >
                    {placeholders[index]}
                  </motion.span>
                </AnimatePresence>
              </div>
            )}
            
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit" 
              className="hidden md:flex absolute right-3 bg-accent-DEFAULT text-white px-6 py-2.5 rounded-full font-bold shadow-md hover:bg-accent-DEFAULT/90 transition-colors"
            >
              Search
            </motion.button>
          </motion.div>
        </form>

        {/* QUICK FILTERS */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-3 mt-12 z-10"
        >
          {['steel', 'aluminum', 'copper', 'brass'].map(mat => (
            <Link 
              key={mat} 
              href={`/search?material=${mat}`} 
              className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-full text-sm font-bold hover:bg-gray-50 hover:border-accent-DEFAULT/40 transition-all shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-md"
            >
              {mat.charAt(0).toUpperCase() + mat.slice(1)}
            </Link>
          ))}
        </motion.div>
      </section>

      {/* FEATURED LISTINGS GRID */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 z-10 relative">
        <div className="flex justify-between items-end mb-10 border-b border-gray-100 pb-6">
          <div>
            <h2 className="text-3xl font-black text-primary tracking-tight">Fresh Offsets</h2>
            <p className="text-gray-500 font-medium mt-1">Recently listed manufacturing surplus.</p>
          </div>
          <Link href="/search" className="text-accent-DEFAULT font-bold hover:text-accent-DEFAULT/80 transition-colors flex items-center">
            View all <span className="ml-2 text-xl">&rarr;</span>
          </Link>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1,2,3,4,5,6].map(i => <ListingCardSkeleton key={i} />)}
          </div>
        ) : featured.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="w-full py-24 bg-white rounded-3xl border border-dashed border-gray-200 flex flex-col items-center justify-center text-center shadow-sm"
          >
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No inventory available right now</h3>
            <p className="text-gray-500 font-medium max-w-md">
              Factories haven&apos;t listed any new offsets today. Check back soon or adjust your search.
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
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
