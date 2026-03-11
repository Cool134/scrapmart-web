"use client";
import { SearchFilters as FilterType } from "@/types";
import { motion } from "framer-motion";
import { SlidersHorizontal, MapPin, DollarSign, Layers, PackageSearch } from "lucide-react";

interface SearchFiltersProps {
  filters: FilterType;
  setFilters: (f: FilterType) => void;
}

export function SearchFilters({ filters, setFilters }: SearchFiltersProps) {
  const materials = ['steel', 'aluminum', 'copper', 'iron', 'brass'];

  const handleClear = () => {
    setFilters({});
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white p-6 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.04)] border border-gray-100 flex flex-col space-y-8"
    >
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <h3 className="font-black text-xl text-primary flex items-center">
          <SlidersHorizontal className="w-5 h-5 mr-2 text-accent-DEFAULT" />
          Filters
        </h3>
        <button 
          onClick={handleClear}
          className="text-xs font-bold text-gray-400 hover:text-red-500 transition-colors uppercase tracking-wider"
        >
          Clear All
        </button>
      </div>
      
      {/* Material Type */}
      <div className="space-y-3">
        <label className="text-sm font-bold text-gray-700 uppercase tracking-wide flex items-center">
          <PackageSearch className="w-4 h-4 mr-2 text-gray-400" />
          Material Type
        </label>
        <div className="relative">
          <select 
            className="w-full p-3.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 outline-none focus:ring-2 focus:ring-accent-DEFAULT/20 focus:border-accent-DEFAULT appearance-none cursor-pointer transition-all"
            value={filters.material || ''}
            onChange={(e) => setFilters({ ...filters, material: e.target.value || undefined })}
          >
            <option value="">Any Material</option>
            {materials.map(m => (
              <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
        </div>
      </div>

      {/* Thickness */}
      <div className="space-y-3">
        <label className="text-sm font-bold text-gray-700 uppercase tracking-wide flex items-center">
          <Layers className="w-4 h-4 mr-2 text-gray-400" />
          Max Thickness (mm)
        </label>
        <div className="pt-2">
          <input 
            type="range" min="1" max="100" step="1"
            value={filters.thickness || 100}
            onChange={(e) => setFilters({ ...filters, thickness: Number(e.target.value) })}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-accent-DEFAULT"
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs font-bold text-gray-400">1mm</span>
            <span className="text-sm font-black text-accent-DEFAULT bg-accent-DEFAULT/10 px-2 py-0.5 rounded-md">
              {filters.thickness ? `<= ${filters.thickness}mm` : 'Any'}
            </span>
          </div>
        </div>
      </div>

      {/* Max Price */}
      <div className="space-y-3">
        <label className="text-sm font-bold text-gray-700 uppercase tracking-wide flex items-center">
          <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
          Max Price (USD)
        </label>
        <div className="pt-2">
          <input 
            type="range" min="0" max="5000" step="50"
            value={filters.maxPrice || 5000}
            onChange={(e) => setFilters({ ...filters, maxPrice: Number(e.target.value) })}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-accent-DEFAULT"
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs font-bold text-gray-400">$0</span>
            <span className="text-sm font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
              {filters.maxPrice && filters.maxPrice < 5000 ? `<= $${filters.maxPrice}` : 'Any Price'}
            </span>
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="space-y-3 border-t border-gray-100 pt-6">
        <label className="text-sm font-bold text-gray-700 uppercase tracking-wide flex items-center">
          <MapPin className="w-4 h-4 mr-2 text-gray-400" />
          Location
        </label>
        <input 
          type="text" 
          placeholder="e.g. ZIP code or City"
          value={filters.location || ''}
          onChange={(e) => setFilters({ ...filters, location: e.target.value })}
          className="w-full p-3.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 outline-none focus:ring-2 focus:ring-accent-DEFAULT/20 focus:border-accent-DEFAULT transition-all placeholder:text-gray-400"
        />
      </div>

    </motion.div>
  );
}
