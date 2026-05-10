"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { usePathname } from "next/navigation";
import { fetchApi } from "@/lib/api";
import { LogOut, User as UserIcon, ShoppingBag, MapPin, PlusCircle, Search, Menu, X, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { LocationModal } from "./location-modal";
import { socket } from "@/lib/socket";

export function Navbar() {
  const { user, logout } = useAuth();
  const [location, setLocation] = useState("Selecting location...");
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [itemCount, setItemCount] = useState(0);
  const [activeCartToken, setActiveCartToken] = useState<string | null>(null);
  const pathname = usePathname();
  
  const isCartPage = pathname?.startsWith("/cart/");
  const isAdminPage = pathname?.startsWith("/admin") || pathname?.startsWith("/restaurants/new");
  const loginUrl = isCartPage ? `/login?redirect=${pathname}` : "/login";
  const registerUrl = isCartPage ? `/register?redirect=${pathname}` : "/register";

  const refreshActiveCart = () => {
    if (user) {
      fetchApi("/carts/active")
        .then(data => {
          setItemCount(data.itemCount || 0);
          setActiveCartToken(data.token);
          
          // Join the cart room for real-time updates if we have a token
          if (data.token) {
            socket.emit("join_cart", data.token);
          }
        })
        .catch(() => {
          setItemCount(0);
          setActiveCartToken(null);
        });
    } else {
      setItemCount(0);
      setActiveCartToken(null);
    }
  };

  useEffect(() => {
    refreshActiveCart();

    const saved = localStorage.getItem("delivery_address");
    if (saved) setLocation(saved);
    else setLocation("New York, NY");

    // Listen for cart refreshes from any participant
    socket.on("cart:refresh", () => {
      refreshActiveCart();
    });

    return () => {
      socket.off("cart:refresh");
    };
  }, [user]);

  const handleLocationSelect = (addr: string) => {
    setLocation(addr);
    localStorage.setItem("delivery_address", addr);
  };

  return (
    <>
      <nav className="glass sticky top-0 z-50 px-4 md:px-6 py-4 border-b border-border-subtle shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4 md:gap-8">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="bg-primary p-1.5 md:p-2 rounded-xl group-hover:rotate-12 transition-transform shadow-lg shadow-primary/30">
                <ShoppingBag className="text-white w-5 h-5 md:w-6 md:h-6" />
              </div>
              <span className="text-xl md:text-2xl font-black tracking-tighter text-primary">UNITYEATS</span>
            </Link>
            
            {!isAdminPage && (
              <button 
                onClick={() => setIsLocationModalOpen(true)}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 hover:bg-foreground/5 rounded-xl transition-colors group"
              >
                <MapPin className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                <div className="text-left hidden md:block">
                  <div className="text-[10px] font-black uppercase tracking-widest text-foreground/40 leading-none mb-1">Deliver to</div>
                  <div className="text-sm font-bold truncate max-w-[120px]">{location}</div>
                </div>
              </button>
            )}
          </div>
          
          {!isAdminPage && (
            <div className="flex-1 max-w-md mx-4 md:mx-8 hidden lg:block">
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  const q = (e.currentTarget.elements.namedItem("search") as HTMLInputElement).value;
                  if (q) window.location.href = `/search?q=${encodeURIComponent(q)}`;
                }}
                className="relative group"
              >
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/20 group-focus-within:text-primary transition-colors" />
                <input 
                  name="search"
                  type="text" 
                  placeholder="Search restaurants or dishes..." 
                  className="w-full h-11 bg-foreground/[0.03] border border-border-subtle rounded-xl pl-11 pr-4 font-bold text-xs focus:bg-background focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                />
              </form>
            </div>
          )}

          <div className="flex items-center gap-3 md:gap-6">
            {!isAdminPage && (
              <Link 
                href={activeCartToken ? `/cart/${activeCartToken}` : "/cart"} 
                className="p-2 md:p-2.5 bg-foreground/[0.03] hover:bg-primary/10 hover:text-primary rounded-xl transition-all relative group"
                title="My Active Cart"
              >
                <ShoppingBag className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform animate-in zoom-in">
                    {itemCount}
                  </span>
                )}
              </Link>
            )}

            <div className="hidden md:flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-4">
                  {user.role === "ADMIN" && (
                    <Link href="/admin" className="text-sm font-bold text-foreground/60 hover:text-primary transition-colors">Dashboard</Link>
                  )}
                  <button onClick={logout} className="p-2.5 bg-foreground/[0.03] hover:bg-red-500/10 hover:text-red-500 rounded-xl transition-all">
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <Link href={loginUrl} className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-all">
                  Login
                </Link>
              )}
            </div>

            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 bg-foreground/5 rounded-xl text-foreground"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-background/95 backdrop-blur-xl border-b border-border-subtle p-6 space-y-6 animate-in slide-in-from-top duration-300 z-50">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                const q = (e.currentTarget.elements.namedItem("search") as HTMLInputElement).value;
                if (q) window.location.href = `/search?q=${encodeURIComponent(q)}`;
              }}
              className="relative"
            >
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/20" />
              <input 
                name="search"
                type="text" 
                placeholder="Search..." 
                className="w-full h-14 bg-foreground/5 rounded-2xl pl-12 pr-4 font-bold outline-none border border-transparent focus:border-primary transition-all"
              />
            </form>

            <div className="space-y-4">
              <button 
                onClick={() => {
                  setIsLocationModalOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-between p-4 bg-foreground/5 rounded-2xl font-bold"
              >
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-primary" />
                  <span>{location}</span>
                </div>
                <ArrowRight className="w-4 h-4 text-foreground/20" />
              </button>

              {user ? (
                <div className="space-y-4">
                  <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-black">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-black text-sm">{user.name}</div>
                      <div className="text-xs text-foreground/40 font-bold uppercase tracking-widest">{user.role}</div>
                    </div>
                  </div>
                  {user.role === "ADMIN" && (
                    <Link href="/admin" className="block w-full p-4 bg-foreground/5 rounded-2xl font-bold">Dashboard</Link>
                  )}
                  <button onClick={logout} className="w-full p-4 bg-red-500/10 text-red-500 rounded-2xl font-black">Logout</button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <Link href={loginUrl} className="w-full py-4 text-center bg-foreground/5 rounded-2xl font-black">Login</Link>
                  <Link href={registerUrl} className="w-full py-4 text-center bg-primary text-white rounded-2xl font-black">Sign Up</Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      <LocationModal 
        isOpen={isLocationModalOpen} 
        onClose={() => setIsLocationModalOpen(false)} 
        onSelect={handleLocationSelect}
      />
    </>
  );
}
