"use client";
import { SearchFilters as FilterType } from "@/types";

export function SearchFilters({ filters, setFilters }: { filters: FilterType, setFilters: (f: FilterType) => void }) {
  const materials = ['steel', 'aluminum', 'copper', 'iron', 'brass'];

  return (
    <div className="bg-white p-6 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-gray-100 space-y-6">
      <h3 className="font-bold text-lg text-primary border-b pb-4">Filters</h3>
      
      <div className="space-y-3">
        <label className="text-sm font-semibold text-gray-700">Material</label>
        <select 
          className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-accent-DEFAULT/50"
          value={filters.material || ''}
          onChange={(e) => setFilters({ ...filters, material: e.target.value || undefined })}
        >
          <option value="">Any Material</option>
          {materials.map(m => <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>)}
        </select>
      </div>

      <div className="space-y-3">
        <label className="text-sm font-semibold text-gray-700">Max Price (USD)</label>
        <input 
          type="range" min="0" max="5000" step="100"
          value={filters.maxPrice || 5000}
          onChange={(e) => setFilters({ ...filters, maxPrice: Number(e.target.value) })}
          className="w-full accent-accent-DEFAULT"
        />
        <div className="text-right text-xs text-gray-500 font-medium">${filters.maxPrice || 5000}</div>
      </div>

      <div className="space-y-3">
        <label className="text-sm font-semibold text-gray-700">Location</label>
        <input 
          type="text" placeholder="e.g. New York"
          value={filters.location || ''}
          onChange={(e) => setFilters({ ...filters, location: e.target.value })}
          className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-accent-DEFAULT/50"
        />
      </div>

      <button 
        onClick={() => setFilters({})}
        className="w-full py-2.5 text-sm font-semibold text-gray-500 hover:bg-gray-50 rounded-xl transition-colors"
      >
        Clear Filters
      </button>
    </div>
  );
}
