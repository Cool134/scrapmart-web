"use client";
import { useState, useEffect } from "react";
import { useAuthState, signInWithGoogle, signInWithEmail, signUpWithEmail } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Role } from "@/types";
import toast from "react-hot-toast";

export default function AuthPage() {
  const { user, role, loading } = useAuthState();
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [selectedRole, setSelectedRole] = useState<Role>("buyer");

  useEffect(() => {
    if (!loading && user && role) router.push(`/dashboard/${role}`);
  }, [user, role, loading, router]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (!isLogin && !name)) {
      return toast.error("Please fill all required fields");
    }
    setFormLoading(true);
    try {
      if (isLogin) {
        await signInWithEmail(email, password);
        toast.success("Welcome back!");
      } else {
        await signUpWithEmail(email, password, name, selectedRole);
        toast.success("Account created successfully!");
      }
    } catch (err: any) {
      toast.error(err.message || "Authentication failed");
    } finally {
      setFormLoading(false);
    }
  };

  const handleGoogle = async () => {
    try {
      setFormLoading(true);
      await signInWithGoogle();
      toast.success("Authenticated with Google!");
    } catch (e: any) {
      toast.error(e.message || "Google Sign-In failed");
      setFormLoading(false);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><LoadingSpinner size="lg"/></div>;

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 bg-gray-50/50">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.06)] border border-gray-100">
        <h2 className="text-3xl font-black text-primary text-center mb-8">{isLogin ? "Welcome Back" : "Create Account"}</h2>
        
        <form onSubmit={handleAuth} className="space-y-5">
          {!isLogin && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name / Company</label>
              <input type="text" value={name} onChange={e=>setName(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent-DEFAULT/50 outline-none" placeholder="John Doe" />
            </div>
          )}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent-DEFAULT/50 outline-none" placeholder="you@company.com" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent-DEFAULT/50 outline-none" placeholder="••••••••" />
          </div>
          
          {!isLogin && (
            <div className="pt-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">I want to...</label>
              <div className="flex gap-4">
                <button type="button" onClick={()=>setSelectedRole('buyer')} className={`flex-1 py-3 rounded-xl border-2 font-semibold transition-all ${selectedRole === 'buyer' ? 'border-accent-DEFAULT bg-accent-DEFAULT/5 text-accent-DEFAULT' : 'border-gray-100 text-gray-500'}`}>Buy Scrap</button>
                <button type="button" onClick={()=>setSelectedRole('seller')} className={`flex-1 py-3 rounded-xl border-2 font-semibold transition-all ${selectedRole === 'seller' ? 'border-accent-DEFAULT bg-accent-DEFAULT/5 text-accent-DEFAULT' : 'border-gray-100 text-gray-500'}`}>Sell Scrap</button>
              </div>
            </div>
          )}

          <button type="submit" disabled={formLoading} className="w-full mt-6 bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 flex items-center justify-center">
            {formLoading ? <LoadingSpinner size="sm" /> : (isLogin ? "Sign In" : "Sign Up")}
          </button>
        </form>

        <div className="mt-8 flex items-center gap-4">
          <div className="flex-1 h-px bg-gray-200"></div>
          <span className="text-sm font-semibold text-gray-400">OR</span>
          <div className="flex-1 h-px bg-gray-200"></div>
        </div>

        <button onClick={handleGoogle} disabled={formLoading} className="w-full mt-6 bg-white border-2 border-gray-200 text-gray-700 font-bold py-3.5 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center">
          Continue with Google
        </button>

        <p className="text-center mt-8 text-sm text-gray-500 font-medium">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button onClick={() => setIsLogin(!isLogin)} className="ml-2 text-accent-DEFAULT font-bold hover:underline">
            {isLogin ? "Sign Up" : "Sign In"}
          </button>
        </p>
      </div>
    </div>
  );
}
