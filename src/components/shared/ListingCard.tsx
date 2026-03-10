import { Listing } from "@/types";
import { MaterialBadge } from "./MaterialBadge";
import { AIOutlineOverlay } from "./AIOutlineOverlay";
import Link from "next/link";
import { MapPin, Scale } from "lucide-react";
import { motion } from "framer-motion";

export function ListingCard({ listing }: { listing: Listing }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] transition-all flex flex-col"
    >
      <Link href={`/listing/${listing.id}`} className="block relative w-full h-48 bg-gray-100 group">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={listing.imageURL} alt={listing.title} className="w-full h-full object-cover" />
        {listing.outline_points && (
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <AIOutlineOverlay points={listing.outline_points} />
          </div>
        )}
      </Link>
      <div className="p-5 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
          <MaterialBadge material={listing.material} />
          <span className="font-bold text-lg text-primary">${listing.price}</span>
        </div>
        <h3 className="font-semibold text-gray-900 line-clamp-1">{listing.title}</h3>
        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{listing.description}</p>
        
        <div className="mt-auto pt-4 flex items-center justify-between text-xs text-gray-500 font-medium">
          <div className="flex items-center space-x-1">
            <MapPin className="w-3.5 h-3.5" />
            <span>{listing.location}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Scale className="w-3.5 h-3.5" />
            <span>{listing.estimated_weight_kg} kg</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function ListingCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm flex flex-col animate-pulse">
      <div className="w-full h-48 bg-gray-200" />
      <div className="p-5">
        <div className="flex justify-between mb-2">
          <div className="w-16 h-5 bg-gray-200 rounded-full" />
          <div className="w-12 h-5 bg-gray-200 rounded" />
        </div>
        <div className="w-3/4 h-5 bg-gray-200 rounded mb-2" />
        <div className="w-full h-4 bg-gray-200 rounded mt-1" />
        <div className="flex justify-between mt-4">
          <div className="w-1/3 h-4 bg-gray-200 rounded" />
          <div className="w-1/4 h-4 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  );
}
