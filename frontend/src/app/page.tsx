"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { Navbar } from "@/components/navbar";
import Link from "next/link";
import { Star, MapPin, UtensilsCrossed, ArrowRight, ShoppingBag, Search } from "lucide-react";

type Restaurant = {
  id: string;
  name: string;
  cuisine: string;
  description: string;
  address: string;
  imageUrl: string | null;
  rating: number;
  menuItemCount: number;
};

export default function Home() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi("/restaurants")
      .then((data) => setRestaurants(data.restaurants))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1">
        {/* High-Fidelity Hero Section */}
        <section className="relative min-h-[85vh] flex items-center pt-10 overflow-hidden">
          {/* Background Accents */}
          <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 -skew-x-12 translate-x-20 z-0" />
          <div className="absolute top-1/2 left-0 w-64 h-64 bg-primary/10 blur-[120px] rounded-full z-0" />

          <div className="max-w-7xl mx-auto w-full px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
            {/* Left: Content */}
            <div className="space-y-10 animate-in slide-in-from-left duration-1000">
              <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-primary/10 rounded-full border border-primary/20">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                </span>
                <span className="text-primary font-black uppercase tracking-[0.2em] text-[10px]">The Ultimate Shared Feast</span>
              </div>

              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9] text-foreground">
                Order as <span className="text-primary">One.</span><br />
                Feast <span className="text-primary italic font-serif">Together.</span>
              </h1>

              <p className="text-xl text-foreground/50 font-medium max-w-lg leading-relaxed">
                UnityEats makes group ordering seamless. Create a shared cart, invite your friends, and enjoy the best food in town, delivered as one.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 max-w-xl">
                <div className="flex-1 glass shadow-2xl rounded-3xl border border-border-subtle p-2 flex items-center group focus-within:border-primary transition-all">
                  <div className="p-4 bg-primary/10 rounded-2xl text-primary group-focus-within:bg-primary group-focus-within:text-white transition-all">
                    <Search className="w-6 h-6" />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Search restaurant or dish..." 
                    className="flex-1 bg-transparent border-none outline-none px-6 font-black text-lg placeholder:text-foreground/20"
                    onKeyDown={(e) => e.key === 'Enter' && (window.location.href = `/search?q=${(e.target as HTMLInputElement).value}`)}
                  />
                </div>
                <button 
                  onClick={() => document.getElementById('restaurants')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-10 py-6 bg-foreground text-background font-black rounded-3xl hover:scale-[1.05] transition-all shadow-2xl shadow-foreground/20"
                >
                  Explore
                </button>
              </div>

              <div className="flex items-center gap-8 pt-4">
                <div className="flex -space-x-4">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-12 h-12 rounded-full border-4 border-background bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary">
                      USER
                    </div>
                  ))}
                </div>
                <div className="h-10 w-[1px] bg-border-subtle" />
                <div>
                  <div className="text-xl font-black">10k+</div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-foreground/30">Happy Foodies</div>
                </div>
              </div>
            </div>

            {/* Right: Visual */}
            <div className="relative group animate-in zoom-in duration-1000 delay-300">
              <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full group-hover:bg-primary/30 transition-all duration-1000" />
              <div className="relative rounded-[3rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border border-white/10 aspect-square lg:aspect-auto lg:h-[700px]">
                <img 
                  src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop" 
                  alt="Gourmet Food" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                {/* Floating Cards */}
                <div className="absolute bottom-8 left-8 right-8 flex gap-4">
                  <div className="flex-1 glass p-6 rounded-2xl border border-white/10 backdrop-blur-2xl">
                    <div className="bg-primary/20 w-10 h-10 rounded-xl flex items-center justify-center mb-4">
                      <Star className="w-5 h-5 text-primary fill-primary" />
                    </div>
                    <div className="font-black text-white text-sm mb-1">Top Rated</div>
                    <div className="text-white/50 text-[10px] font-bold uppercase tracking-widest">4.9/5 Average</div>
                  </div>
                  <div className="flex-1 glass p-6 rounded-2xl border border-white/10 backdrop-blur-2xl">
                    <div className="bg-emerald-500/20 w-10 h-10 rounded-xl flex items-center justify-center mb-4">
                      <ShoppingBag className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="font-black text-white text-sm mb-1">Fast Delivery</div>
                    <div className="text-white/50 text-[10px] font-bold uppercase tracking-widest">Under 30 Mins</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Restaurant List */}
        <section id="restaurants" className="max-w-7xl mx-auto px-6 py-20">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight mb-2">Featured Restaurants</h2>
              <p className="text-foreground/60">The best local spots for group ordering</p>
            </div>
            <div className="hidden md:flex gap-4">
              {/* Add category filters here if needed */}
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-[400px] rounded-2xl bg-foreground/5 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {restaurants.map((restaurant) => (
                <Link
                  key={restaurant.id}
                  href={`/restaurants/${restaurant.id}`}
                  className="group block glass rounded-2xl overflow-hidden hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 shadow-xl hover:shadow-primary/10"
                >
                  <div className="h-56 relative bg-foreground/10">
                    {restaurant.imageUrl ? (
                      <img
                        src={restaurant.imageUrl}
                        alt={restaurant.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <UtensilsCrossed className="w-12 h-12 text-foreground/20" />
                      </div>
                    )}
                    <div className="absolute top-4 right-4 bg-white/90 dark:bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                      <Star className="w-4 h-4 text-orange-400 fill-orange-400" />
                      <span className="font-black text-sm">{restaurant.rating.toFixed(1)}</span>
                    </div>
                  </div>
                  <div className="p-8">
                    <div className="text-primary text-xs font-black tracking-widest uppercase mb-2">
                      {restaurant.cuisine}
                    </div>
                    <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">
                      {restaurant.name}
                    </h3>
                    <div className="flex items-center gap-2 text-foreground/50 text-sm mb-6">
                      <MapPin className="w-4 h-4" />
                      <span className="truncate">{restaurant.address}</span>
                    </div>
                    <div className="flex items-center justify-between pt-6 border-t border-border-subtle">
                      <span className="text-sm font-semibold text-foreground/60">
                        {restaurant.menuItemCount} items available
                      </span>
                      <div className="flex items-center gap-1 font-bold text-primary group-hover:gap-2 transition-all">
                        <span>Menu</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="border-t border-border-subtle py-20 bg-foreground/5">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="bg-primary p-1.5 rounded-lg">
              <ShoppingBag className="text-white w-4 h-4" />
            </div>
            <span className="font-black text-primary">UNITYEATS</span>
          </div>
          <p className="text-foreground/40 text-sm">© 2026 UnityEats. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
