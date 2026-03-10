import { motion } from "framer-motion";
import { Package, ShieldAlert, Sparkles, Flame, Coins, HelpCircle } from "lucide-react";

interface MaterialBadgeProps {
  material: string;
  size?: "sm" | "md" | "lg";
}

export function MaterialBadge({ material, size = "md" }: MaterialBadgeProps) {
  const m = material?.toLowerCase() || 'unknown';
  
  const sizeClasses = {
    sm: "px-2 py-0.5 text-[10px] space-x-1",
    md: "px-3 py-1 text-xs space-x-1.5",
    lg: "px-4 py-1.5 text-sm space-x-2"
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-3.5 h-3.5",
    lg: "w-4 h-4"
  };

  const variants: Record<string, { color: string, icon: React.ElementType }> = {
    steel: { color: "bg-slate-100 text-slate-800 border-slate-200", icon: ShieldAlert },
    aluminum: { color: "bg-sky-100 text-sky-800 border-sky-200", icon: Sparkles },
    copper: { color: "bg-orange-100 text-orange-800 border-orange-200", icon: Flame },
    iron: { color: "bg-zinc-100 text-zinc-800 border-zinc-200", icon: Package },
    brass: { color: "bg-amber-100 text-amber-800 border-amber-200", icon: Coins },
    unknown: { color: "bg-purple-100 text-purple-800 border-purple-200", icon: HelpCircle },
  };

  const variant = variants[m] || variants.unknown;
  const Icon = variant.icon;

  return (
    <motion.span 
      whileHover={{ scale: 1.05 }}
      className={`inline-flex items-center font-bold rounded-full border ${variant.color} ${sizeClasses[size]}`}
    >
      <Icon className={iconSizes[size]} />
      <span className="uppercase tracking-wider">
        {material || 'Unknown'}
      </span>
    </motion.span>
  );
}
