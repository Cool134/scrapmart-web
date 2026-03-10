"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface AIOutlineOverlayProps {
  points: number[][]; // Array of [x, y] normalized coordinates (0-1)
}

export function AIOutlineOverlay({ points }: AIOutlineOverlayProps) {
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch on Framer Motion animations
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !points || points.length === 0) return null;

  // We use a 100x100 viewBox so the normalized coordinates (0.0 to 1.0) 
  // just need to be multiplied by 100 to fit the SVG coordinate space.
  const svgWidth = 100;
  const svgHeight = 100;

  // Generate the SVG Path string (M x y L x y L x y Z)
  const pathData = points.map((p, i) => {
    // Ensure safety against malformed AI output arrays
    const x = (p[0] || 0) * svgWidth;
    const y = (p[1] || 0) * svgHeight;
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ') + ' Z';

  return (
    <div className="absolute inset-0 pointer-events-none z-10 w-full h-full overflow-hidden">
      <svg 
        viewBox="0 0 100 100" 
        preserveAspectRatio="none" 
        className="w-full h-full drop-shadow-lg filter"
        style={{ filter: "drop-shadow(0px 4px 6px rgba(79, 70, 229, 0.4))" }}
      >
        <motion.path
          d={pathData}
          fill="rgba(79, 70, 229, 0.15)" // Accent color with low opacity
          stroke="#4F46E5" // Accent solid color
          strokeWidth="0.8" // Thin precision line
          strokeDasharray="3 2" // Tech/scanning visual effect
          initial={{ pathLength: 0, opacity: 0, fillOpacity: 0 }}
          animate={{ pathLength: 1, opacity: 1, fillOpacity: 0.15 }}
          transition={{ 
            pathLength: { duration: 1.5, ease: "easeInOut" },
            opacity: { duration: 0.5 },
            fillOpacity: { delay: 1.2, duration: 0.5 }
          }}
        />
        
        {/* Draw subtle animated nodes at each vertex to simulate a computer vision scan */}
        {points.map((p, i) => (
          <motion.circle
            key={`node-${i}`}
            cx={(p[0] || 0) * svgWidth}
            cy={(p[1] || 0) * svgHeight}
            r="0.6"
            fill="#FFFFFF"
            stroke="#4F46E5"
            strokeWidth="0.3"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1.5 + (i * 0.05), duration: 0.3 }}
          />
        ))}
      </svg>
      
      {/* Optional: Add a subtle sweeping gradient overlay to simulate scanning */}
      <motion.div
        initial={{ top: "-10%" }}
        animate={{ top: "110%" }}
        transition={{ 
          duration: 3, 
          repeat: Infinity, 
          ease: "linear",
          repeatDelay: 1 
        }}
        className="absolute left-0 right-0 h-1 bg-gradient-to-b from-transparent via-accent-DEFAULT/40 to-transparent shadow-[0_0_15px_rgba(79,70,229,0.5)] z-20"
      />
    </div>
  );
}
