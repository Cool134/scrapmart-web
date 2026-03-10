"use client";
import { useAuthState, signOut } from "@/lib/auth";
import Link from "next/link";
import { useState } from "react";
import { Search, Menu, X, User } from "lucide-react";
import { useRouter } from "next/navigation";

export function Navbar() {
  const { user, role } = useAuthState();
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) router.push(`/search?q=${encodeURIComponent(search)}`);
  };

  return (
    <nav className="w-full bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-2xl font-black text-primary">
            Scrap<span className="text-accent-DEFAULT">Mart</span>
          </Link>
          
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-lg mx-8 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search materials..." 
              className="w-full bg-gray-50 border border-gray-200 rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-accent-DEFAULT/50 transition-all"
            />
          </form>

          <div className="hidden md:flex items-center space-x-4">
            {!user ? (
              <Link href="/auth" className="bg-primary text-white px-5 py-2 rounded-full font-medium hover:bg-primary/90 transition-colors">Sign In</Link>
            ) : (
              <div className="relative group">
                <button className="flex items-center space-x-2 bg-gray-50 border border-gray-200 p-2 rounded-full hover:bg-gray-100 transition-colors">
                  <User className="w-5 h-5 text-gray-600" />
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <Link href={`/dashboard/${role}`} className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-xl">Dashboard</Link>
                  <button onClick={signOut} className="block w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-gray-50 last:rounded-b-xl">Sign Out</button>
                </div>
              </div>
            )}
          </div>

          <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-6 h-6 text-gray-600" /> : <Menu className="w-6 h-6 text-gray-600" />}
          </button>
        </div>
      </div>
    </nav>
  );
}
