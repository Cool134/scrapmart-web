"use client";
import { useAuthState } from "@/lib/auth";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LoadingSpinner } from "../shared/LoadingSpinner";
import { Role } from "@/types";
import { motion } from "framer-motion";

interface AuthGuardProps {
  children: React.ReactNode;
  role?: Role;
}

export function AuthGuard({ children, role }: AuthGuardProps) {
  const { user, role: userRole, loading } = useAuthState();
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (loading) return; // Wait for Firebase Auth to initialize

    if (!user) {
      // User is not logged in, redirect to auth page
      // We pass the callback URL so they can return here after logging in
      const callbackUrl = encodeURIComponent(pathname);
      router.replace(`/auth?callbackUrl=${callbackUrl}`);
    } else if (role && userRole && userRole !== role) {
      // User is logged in but has the wrong role for this page
      router.replace(`/dashboard/${userRole}`);
    } else {
      // User is logged in and authorized
      setIsAuthorized(true);
    }
  }, [user, userRole, loading, role, router, pathname]);

  if (loading || !isAuthorized) {
    return (
      <div className="flex h-[80vh] w-full flex-col items-center justify-center space-y-6">
        <LoadingSpinner size="lg" />
        <motion.p 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ delay: 0.5 }}
          className="text-gray-500 font-medium text-sm tracking-wide uppercase"
        >
          Authenticating Session...
        </motion.p>
      </div>
    );
  }

  // Fade in the protected content smoothly once authorized
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="flex-1 flex flex-col w-full"
    >
      {children}
    </motion.div>
  );
}
