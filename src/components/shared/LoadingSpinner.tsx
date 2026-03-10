import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "w-4 h-4", md: "w-8 h-8", lg: "w-12 h-12" };
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
      className={`text-accent-DEFAULT ${sizes[size]}`}
    >
      <Loader2 className="w-full h-full" />
    </motion.div>
  );
}
