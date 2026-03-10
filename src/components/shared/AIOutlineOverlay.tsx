"use client";
import { motion } from "framer-motion";

export function AIOutlineOverlay({ points }: { points: number[][] }) {
  if (!points || points.length === 0) return null;

  const width = 100;
  const height = 100;

  const pathData = points.map((p, i) => {
    const x = p[0] * width;
    const y = p[1] * height;
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ') + ' Z';

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full drop-shadow-md">
        <motion.path
          d={pathData}
          fill="rgba(79, 70, 229, 0.15)"
          stroke="#4F46E5"
          strokeWidth="0.8"
          strokeDasharray="4 2"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
      </svg>
    </div>
  );
}
