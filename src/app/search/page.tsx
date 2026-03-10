"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { SearchFilters as SearchFiltersComponent } from "@/components/shared/SearchFilters";
import { ListingCard, ListingCardSkeleton } from "@/components/shared/ListingCard";
import { getListings } from "@/lib/firestore";
import { Listing, SearchFilters } from "@/types";
import { SlidersHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function SearchPage() {
  const params = useSearchParams();
  const [filters, setFilters] = useState<SearchFilters>({
    material: params.get("material") || undefined,
    location: params.get("location") || undefined,
  });
  const [query, setQuery] = useState(params.get("q") || "");
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let res = await getListings(filters);
        if (query) {
          const q = query.toLowerCase();
          res = res.filter(l => 
            l.title.toLowerCase().includes(q) || 
            l.description.toLowerCase().includes(q)
          );
        }
        setListings(res);
      } catch (e) {
        console.error("Fetch error:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [filters, query]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters */}
        <div className={`md:w-72 flex-shrink-0 ${showFilters ? 'block' : 'hidden md:block'}`}>
          <div className="sticky top-24">
            <SearchFiltersComponent filters={filters} setFilters={setFilters} />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-black text-primary">
              {query ? `Results for "${query}"` : "Browse Offsets"}
              <span className="text-gray-400 font-medium text-lg ml-3">({listings.length})</span>
            </h1>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50"
            >
              <SlidersHorizontal className="w-5 h-5 text-gray-700" />
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3,4,5,6].map(i => <ListingCardSkeleton key={i} />)}
            </div>
          ) : listings.length === 0 ? (
            <div className="w-full py-20 bg-gray-50 border border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center text-center px-4">
              <h3 className="text-xl font-bold text-gray-800 mb-2">No offsets found</h3>
              <p className="text-gray-500 max-w-sm">Try adjusting your filters or search term to find what you're looking for.</p>
              <button onClick={() => { setFilters({}); setQuery(""); }} className="mt-6 px-6 py-2 bg-white border border-gray-200 rounded-full font-semibold text-gray-600 hover:bg-gray-50 shadow-sm transition">Clear all filters</button>
            </div>
          ) : (
            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {listings.map(listing => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
