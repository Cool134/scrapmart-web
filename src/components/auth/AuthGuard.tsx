"use client";
import { useAuthState } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LoadingSpinner } from "../shared/LoadingSpinner";
import { Role } from "@/types";

export function AuthGuard({ children, role }: { children: React.ReactNode, role?: Role }) {
  const { user, role: userRole, loading } = useAuthState();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/auth");
      } else if (role && userRole && userRole !== role) {
        router.push(`/dashboard/${userRole}`);
      }
    }
  }, [user, userRole, loading, role, router]);

  if (loading) {
    return <div className="flex h-screen w-full items-center justify-center"><LoadingSpinner size="lg" /></div>;
  }

  if (!user || (role && userRole !== role)) return null;

  return <>{children}</>;
}
