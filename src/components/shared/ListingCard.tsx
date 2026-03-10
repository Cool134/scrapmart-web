import { Listing } from "@/types";
import { MaterialBadge } from "./MaterialBadge";
import { AIOutlineOverlay } from "./AIOutlineOverlay";
import Link from "next/link";
import { MapPin, Scale, Zap } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";

interface ListingCardProps {
  listing: Listing;
  priority?: boolean;
}

export function ListingCard({ listing, priority = false }: ListingCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      className="group bg-white rounded-2xl overflow-hidden border border-gray-200/60 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_30px_rgba(79,70,229,0.08)] transition-all duration-300 flex flex-col h-full relative"
    >
      <Link href={`/listing/${listing.id}`} className="flex flex-col h-full outline-none focus-visible:ring-2 focus-visible:ring-accent-DEFAULT focus-visible:ring-offset-2 rounded-2xl">
        
        {/* Top Image Section */}
        <div className="relative w-full h-56 bg-gray-100 overflow-hidden">
          {listing.imageURL ? (
            <img 
              src={listing.imageURL} 
              alt={listing.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading={priority ? "eager" : "lazy"}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-400">
              No Image
            </div>
          )}
          
          {/* AI Overlay triggers on hover */}
          {listing.outline_points && listing.outline_points.length > 0 && (
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
               <AIOutlineOverlay points={listing.outline_points} />
            </div>
          )}

          {/* Confidence Badge overlay */}
          {listing.confidence && (
            <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center space-x-1 z-20 shadow-sm border border-white/10">
              <Zap className="w-3 h-3 text-emerald-400" />
              <span>AI {(listing.confidence * 100).toFixed(0)}%</span>
            </div>
          )}
        </div>

        {/* Bottom Content Section */}
        <div className="p-5 flex flex-col flex-1 bg-white">
          <div className="flex justify-between items-start mb-3 gap-2">
            <MaterialBadge material={listing.material} />
            <span className="font-black text-xl text-primary tracking-tight">
              ${listing.price.toLocaleString()}
            </span>
          </div>
          
          <h3 className="font-bold text-gray-900 leading-snug line-clamp-1 mb-1.5 group-hover:text-accent-DEFAULT transition-colors">
            {listing.title}
          </h3>
          
          <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1 leading-relaxed">
            {listing.description || `High-quality ${listing.material} manufacturing offset available for immediate pickup.`}
          </p>
          
          <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 font-semibold">
            <div className="flex items-center space-x-1.5 text-gray-600 bg-gray-50 px-2.5 py-1.5 rounded-md">
              <MapPin className="w-3.5 h-3.5 text-gray-400" />
              <span className="truncate max-w-[100px]">{listing.location}</span>
            </div>
            <div className="flex items-center space-x-1.5 text-gray-600 bg-gray-50 px-2.5 py-1.5 rounded-md">
              <Scale className="w-3.5 h-3.5 text-gray-400" />
              <span>{listing.estimated_weight_kg.toFixed(1)} kg</span>
            </div>
          </div>
        </div>

      </Link>
    </motion.div>
  );
}

export function ListingCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col h-full animate-pulse">
      <div className="w-full h-56 bg-gray-200/60" />
      <div className="p-5 flex flex-col flex-1">
        <div className="flex justify-between items-center mb-3">
          <div className="w-20 h-6 bg-gray-200/60 rounded-full" />
          <div className="w-16 h-7 bg-gray-200/60 rounded-md" />
        </div>
        <div className="w-full h-6 bg-gray-200/60 rounded-md mb-2" />
        <div className="w-2/3 h-6 bg-gray-200/60 rounded-md mb-4" />
        <div className="w-full h-4 bg-gray-100 rounded mb-1" />
        <div className="w-4/5 h-4 bg-gray-100 rounded flex-1" />
        
        <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between">
          <div className="w-24 h-8 bg-gray-100 rounded-md" />
          <div className="w-20 h-8 bg-gray-100 rounded-md" />
        </div>
      </div>
    </div>
  );
}
