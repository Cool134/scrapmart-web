"use client";

import { useAuthState, signOut } from "@/lib/auth";
import Link from "next/link";
import { useState, FormEvent, useEffect, useRef } from "react";
import { Search, Menu, X, User, ChevronDown, Package, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const { user, role, loading } = useAuthState();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [search, setSearch] = useState("");
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/search?q=${encodeURIComponent(search.trim())}`);
      setSearch("");
      setMenuOpen(false); // Close mobile menu if searching from there
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setDropdownOpen(false);
      setMenuOpen(false);
    } catch (error) {
      console.error("Sign out failed", error);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="w-full bg-white/80 backdrop-blur-xl border-b border-gray-200/60 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Left: Logo */}
          <Link href="/" className="flex items-center space-x-1" onClick={() => setMenuOpen(false)}>
            <span className="text-2xl font-black text-primary tracking-tight">Scrap</span>
            <span className="text-2xl font-black text-accent-DEFAULT tracking-tight">Mart</span>
          </Link>
          
          {/* Center: Desktop Search */}
          <form 
            onSubmit={handleSearch} 
            className="hidden md:flex flex-1 max-w-lg mx-8 relative group"
          >
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400 group-focus-within:text-accent-DEFAULT transition-colors" />
            </div>
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search materials, thickness, location..." 
              className="block w-full pl-11 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-full text-sm placeholder-gray-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent-DEFAULT/20 focus:border-accent-DEFAULT transition-all"
            />
          </form>

          {/* Right: Desktop Auth / Profile */}
          <div className="hidden md:flex items-center space-x-4">
            {loading ? (
              <div className="h-9 w-24 bg-gray-100 rounded-full animate-pulse"></div>
            ) : !user ? (
              <>
                <Link 
                  href="/auth" 
                  className="text-sm font-semibold text-gray-600 hover:text-primary transition-colors px-3 py-2"
                >
                  Log in
                </Link>
                <Link 
                  href="/auth" 
                  className="bg-primary text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-primary/90 hover:shadow-md transition-all active:scale-95"
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-2 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 pl-3 pr-2 py-1.5 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-accent-DEFAULT/20"
                >
                  <div className="w-6 h-6 bg-accent-DEFAULT/10 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-accent-DEFAULT" />
                  </div>
                  <span className="text-sm font-semibold text-gray-700 max-w-[100px] truncate">
                    {user.displayName || "Account"}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 overflow-hidden transform origin-top-right"
                    >
                      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                        <p className="text-xs text-gray-500 font-medium">Signed in as</p>
                        <p className="text-sm font-semibold text-gray-900 truncate">{user.email}</p>
                        <span className="inline-block mt-1.5 px-2 py-0.5 bg-accent-DEFAULT/10 text-accent-DEFAULT text-[10px] font-bold uppercase tracking-wider rounded-full">
                          {role || 'User'}
                        </span>
                      </div>
                      <div className="p-2">
                        <Link 
                          href={`/dashboard/${role}`} 
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-gray-700 rounded-xl hover:bg-gray-100 transition-colors"
                        >
                          <Package className="w-4 h-4 mr-3 text-gray-500" />
                          My Dashboard
                        </Link>
                        <button 
                          onClick={handleSignOut} 
                          className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50 transition-colors mt-1"
                        >
                          <LogOut className="w-4 h-4 mr-3 text-red-500" />
                          Sign out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center">
            <button 
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-accent-DEFAULT/20"
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-100 bg-white overflow-hidden"
          >
            <div className="px-4 pt-4 pb-6 space-y-4">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input 
                  type="text" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search materials..." 
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-accent-DEFAULT focus:ring-1 focus:ring-accent-DEFAULT"
                />
              </form>
              
              <div className="border-t border-gray-100 pt-4">
                {loading ? (
                   <div className="px-3 py-2 text-sm text-gray-500">Loading...</div>
                ) : !user ? (
                  <div className="flex flex-col space-y-3">
                    <Link 
                      href="/auth" 
                      onClick={() => setMenuOpen(false)}
                      className="w-full text-center py-3 text-sm font-semibold text-gray-700 bg-gray-50 rounded-xl"
                    >
                      Log In
                    </Link>
                    <Link 
                      href="/auth" 
                      onClick={() => setMenuOpen(false)}
                      className="w-full text-center py-3 text-sm font-semibold text-white bg-primary rounded-xl"
                    >
                      Sign Up
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="px-3 py-3 bg-gray-50 rounded-xl mb-3">
                      <p className="text-xs text-gray-500 font-medium">Signed in as</p>
                      <p className="text-sm font-semibold text-gray-900 truncate">{user.email}</p>
                    </div>
                    <Link 
                      href={`/dashboard/${role}`} 
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center px-3 py-3 text-base font-medium text-gray-900 hover:bg-gray-50 rounded-xl"
                    >
                      <Package className="w-5 h-5 mr-3 text-gray-500" />
                      Dashboard
                    </Link>
                    <button 
                      onClick={handleSignOut} 
                      className="flex items-center w-full text-left px-3 py-3 text-base font-medium text-red-600 hover:bg-red-50 rounded-xl"
                    >
                      <LogOut className="w-5 h-5 mr-3 text-red-500" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
