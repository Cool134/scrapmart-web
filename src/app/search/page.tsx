"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { SearchFilters as SearchFiltersComponent } from "@/components/shared/SearchFilters";
import { ListingCard, ListingCardSkeleton } from "@/components/shared/ListingCard";
import { getListings } from "@/lib/firestore";
import { Listing, SearchFilters } from "@/types";
import { SlidersHorizontal, PackageSearch } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

function SearchContent() {
  const params = useSearchParams();
  const initialQuery = params.get("q") || "";
  
  const [filters, setFilters] = useState<SearchFilters>({
    material: params.get("material") || undefined,
    location: params.get("location") || undefined,
  });
  
  const [query, setQuery] = useState(initialQuery);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  // Sync query state if URL parameter changes (e.g. from Navbar search)
  useEffect(() => {
    setQuery(params.get("q") || "");
  }, [params]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch from Firestore using active object filters (Material, Price, Thickness)
        let res = await getListings(filters);
        
        // Client-side filtering for text query (title/description)
        if (query) {
          const q = query.toLowerCase().trim();
          res = res.filter(l => 
            l.title.toLowerCase().includes(q) || 
            (l.description && l.description.toLowerCase().includes(q))
          );
        }
        
        // Sort by newest
        res.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setListings(res);
      } catch (error) {
        console.error("Search fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [filters, query]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1 flex flex-col md:flex-row gap-8">
      
      {/* Sidebar Filters - Sticky on Desktop, Drawer on Mobile */}
      <div className={`md:w-80 flex-shrink-0 ${showFiltersMobile ? 'block' : 'hidden md:block'}`}>
        <div className="sticky top-24">
          <SearchFiltersComponent filters={filters} setFilters={setFilters} />
        </div>
      </div>

      {/* Main Results Area */}
      <div className="flex-1">
        <div className="flex items-end justify-between mb-8 border-b border-gray-100 pb-6">
          <div>
            <h1 className="text-3xl font-black text-primary tracking-tight">
              {query ? `Results for "${query}"` : "Browse Inventory"}
            </h1>
            <p className="text-gray-500 font-medium mt-1">
              Showing {listings.length} active {listings.length === 1 ? 'listing' : 'listings'}
            </p>
          </div>
          <button 
            onClick={() => setShowFiltersMobile(!showFiltersMobile)}
            className="md:hidden flex items-center space-x-2 bg-white border border-gray-200 px-4 py-2 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => <ListingCardSkeleton key={i} />)}
          </div>
        ) : listings.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }}
            className="w-full py-24 bg-white border border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center text-center px-4 shadow-sm"
          >
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <PackageSearch className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No offsets found</h3>
            <p className="text-gray-500 font-medium max-w-sm">
              We couldn't find any materials matching your exact criteria. Try broadening your filters.
            </p>
            <button 
              onClick={() => { setFilters({}); setQuery(""); router.push('/search'); }} 
              className="mt-8 px-6 py-2.5 bg-gray-100 border border-gray-200 rounded-full font-bold text-gray-700 hover:bg-gray-200 hover:text-gray-900 shadow-sm transition-all"
            >
              Clear all filters
            </button>
          </motion.div>
        ) : (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {listings.map((listing, index) => (
                <motion.div
                  key={listing.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  layout
                >
                  <ListingCard listing={listing} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="flex h-[80vh] items-center justify-center"><LoadingSpinner size="lg" /></div>}>
      <SearchContent />
    </Suspense>
  );
}
