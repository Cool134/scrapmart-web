import { motion } from "framer-motion";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  label?: string;
}

export function LoadingSpinner({ size = "md", label }: LoadingSpinnerProps) {
  const sizes = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16"
  };

  const strokeWidths = {
    sm: "3",
    md: "4",
    lg: "4",
    xl: "5"
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <motion.svg
        className={`text-accent-DEFAULT ${sizes[size]} origin-center`}
        viewBox="0 0 50 50"
        animate={{ rotate: 360 }}
        transition={{ 
          repeat: Infinity, 
          duration: 1.5, 
          ease: "linear" 
        }}
      >
        {/* Background track */}
        <circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          className="stroke-accent-DEFAULT/20"
          strokeWidth={strokeWidths[size]}
        />
        {/* Animated Dash */}
        <motion.circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          className="stroke-accent-DEFAULT"
          strokeWidth={strokeWidths[size]}
          strokeLinecap="round"
          strokeDasharray="90 150"
          initial={{ strokeDashoffset: 0 }}
          animate={{ strokeDashoffset: -240 }}
          transition={{
            repeat: Infinity,
            duration: 2,
            ease: "easeInOut"
          }}
        />
      </motion.svg>
      
      {label && (
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-sm font-semibold text-gray-500 uppercase tracking-widest animate-pulse"
        >
          {label}
        </motion.p>
      )}
    </div>
  );
}
