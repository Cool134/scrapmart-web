"use client";
import { useState, useEffect, Suspense } from "react";
import { useAuthState, signInWithGoogle, signInWithEmail, signUpWithEmail } from "@/lib/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Role } from "@/types";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Chrome } from "lucide-react";

// We extract the actual form into a component that uses `useSearchParams` 
// so we can wrap it in <Suspense> as required by Next.js App Router.
function AuthForm() {
  const { user, role, loading } = useAuthState();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');

  const [isLogin, setIsLogin] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [selectedRole, setSelectedRole] = useState<Role>("buyer");

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user && role) {
      if (callbackUrl) {
        router.push(decodeURIComponent(callbackUrl));
      } else {
        router.push(`/dashboard/${role}`);
      }
    }
  }, [user, role, loading, router, callbackUrl]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (!isLogin && !name)) {
      return toast.error("Please fill out all required fields.");
    }
    
    setFormLoading(true);
    try {
      if (isLogin) {
        toast.loading("Signing in...", { id: 'auth' });
        await signInWithEmail(email, password);
        toast.success("Welcome back!", { id: 'auth' });
      } else {
        toast.loading("Creating account...", { id: 'auth' });
        await signUpWithEmail(email, password, name, selectedRole);
        toast.success("Account created successfully!", { id: 'auth' });
      }
    } catch (err: unknown) {
      toast.error((err as Error).message || "Authentication failed. Please check your credentials.", { id: 'auth' });
      setFormLoading(false);
    }
  };

  const handleGoogle = async () => {
    try {
      setFormLoading(true);
      toast.loading("Connecting to Google...", { id: 'google' });
      // If it's a signup, pass the explicitly chosen role. If login, it defaults/ignores.
      await signInWithGoogle(selectedRole); 
      toast.success("Authenticated successfully!", { id: 'google' });
    } catch (err: unknown) {
      toast.error((err as Error).message || "Google Sign-In failed.", { id: 'google' });
      setFormLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" label="Verifying Session..." />;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md bg-white p-8 sm:p-10 rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.08)] border border-gray-100"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black text-primary tracking-tight">
          {isLogin ? "Welcome Back" : "Join ScrapMart"}
        </h2>
        <p className="text-gray-500 font-medium mt-2 text-sm">
          {isLogin ? "Enter your credentials to access your dashboard." : "Create an account to buy or sell industrial offsets."}
        </p>
      </div>
      
      <form onSubmit={handleAuth} className="space-y-5">
        <AnimatePresence mode="popLayout">
          {!isLogin && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Full Name / Company</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                className="w-full p-3.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent-DEFAULT/20 focus:border-accent-DEFAULT outline-none transition-all font-medium placeholder:text-gray-400 text-sm" 
                placeholder="e.g. Acme Manufacturing" 
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Email Address</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            className="w-full p-3.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent-DEFAULT/20 focus:border-accent-DEFAULT outline-none transition-all font-medium placeholder:text-gray-400 text-sm" 
            placeholder="you@company.com" 
          />
        </div>
        
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Password</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            className="w-full p-3.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent-DEFAULT/20 focus:border-accent-DEFAULT outline-none transition-all font-medium placeholder:text-gray-400 text-sm" 
            placeholder="••••••••" 
          />
        </div>
        
        <AnimatePresence mode="popLayout">
          {!isLogin && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="pt-2 overflow-hidden"
            >
              <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">I want to...</label>
              <div className="flex gap-4">
                <button 
                  type="button" 
                  onClick={() => setSelectedRole('buyer')} 
                  className={`flex-1 py-3 rounded-xl border-2 font-bold text-sm transition-all ${selectedRole === 'buyer' ? 'border-accent-DEFAULT bg-accent-DEFAULT/5 text-accent-DEFAULT' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                >
                  Buy Material
                </button>
                <button 
                  type="button" 
                  onClick={() => setSelectedRole('seller')} 
                  className={`flex-1 py-3 rounded-xl border-2 font-bold text-sm transition-all ${selectedRole === 'seller' ? 'border-accent-DEFAULT bg-accent-DEFAULT/5 text-accent-DEFAULT' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                >
                  Sell Scrap
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button 
          type="submit" 
          disabled={formLoading} 
          className="w-full mt-6 bg-primary text-white font-bold py-4 rounded-xl hover:bg-primary/90 disabled:opacity-70 transition-colors shadow-lg shadow-primary/20 flex items-center justify-center space-x-2"
        >
          {formLoading ? <LoadingSpinner size="sm" /> : (
            <>
              <span>{isLogin ? "Sign In" : "Create Account"}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-8 flex items-center gap-4">
        <div className="flex-1 h-px bg-gray-200"></div>
        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">OR</span>
        <div className="flex-1 h-px bg-gray-200"></div>
      </div>

      <button 
        onClick={handleGoogle} 
        disabled={formLoading} 
        className="w-full mt-6 bg-white border border-gray-200 text-gray-700 font-bold text-sm py-3.5 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center shadow-sm"
      >
        <Chrome className="w-4 h-4 mr-2" />
        Continue with Google
      </button>

      <div className="mt-8 text-center bg-gray-50/50 -mx-8 -mb-8 sm:-mx-10 sm:-mb-10 p-6 rounded-b-3xl border-t border-gray-100">
        <p className="text-sm text-gray-500 font-medium">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button 
            onClick={() => { setIsLogin(!isLogin); setFormLoading(false); }} 
            className="ml-2 text-accent-DEFAULT font-bold hover:underline"
          >
            {isLogin ? "Sign Up" : "Sign In"}
          </button>
        </p>
      </div>
    </motion.div>
  );
}

export default function AuthPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[80vh] p-4 bg-gradient-to-b from-white to-gray-50/50">
      <Suspense fallback={<LoadingSpinner size="lg" />}>
        <AuthForm />
      </Suspense>
    </div>
  );
}
