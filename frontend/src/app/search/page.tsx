"use client";

import { useEffect, useState, use } from "react";
import { Navbar } from "@/components/navbar";
import { fetchApi } from "@/lib/api";
import Link from "next/link";
import { Search, MapPin, Star, ShoppingBag, ArrowRight, ChefHat } from "lucide-react";

import { formatMoney } from "@/lib/money";

type SearchResult = {
  restaurants: any[];
  dishes: any[];
};

export default function SearchPage({ searchParams }: { searchParams: Promise<{ q: string }> }) {
  const { q } = use(searchParams);
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const performSearch = async () => {
      setLoading(true);
      try {
        // We'll add a search endpoint to the backend, or filter here.
        // For now, let's assume the backend has /api/search?q=...
        const data = await fetchApi(`/restaurants/search?q=${encodeURIComponent(q)}`);
        setResults(data);
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setLoading(false);
      }
    };

    if (q) performSearch();
  }, [q]);

  return (
    <div className="flex flex-col min-h-screen bg-background hero-gradient">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-black tracking-tight mb-2">
            Results for <span className="text-primary">"{q}"</span>
          </h1>
          <p className="text-foreground/50">Found {results ? results.restaurants.length + results.dishes.length : 0} matches</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-16">
            {/* Restaurants Section */}
            {results?.restaurants.length ? (
              <section>
                <div className="flex items-center gap-3 mb-8">
                  <div className="bg-primary/10 p-2 rounded-xl text-primary">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-black">Restaurants</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {results.restaurants.map((res: any) => (
                    <Link 
                      key={res.id} 
                      href={`/restaurants/${res.id}`}
                      className="glass group rounded-[2rem] overflow-hidden border border-border-subtle hover:border-primary/30 transition-all hover:scale-[1.02]"
                    >
                      <div className="h-48 bg-foreground/5 relative overflow-hidden">
                        {res.imageUrl && (
                          <img src={res.imageUrl} alt={res.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        )}
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-lg">
                          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                          <span className="font-bold text-sm">{res.rating}</span>
                        </div>
                      </div>
                      <div className="p-8">
                        <h3 className="text-2xl font-black mb-2 group-hover:text-primary transition-colors">{res.name}</h3>
                        <p className="text-foreground/50 text-sm font-medium line-clamp-2 mb-6">{res.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black uppercase tracking-widest text-foreground/30">{res.cuisine}</span>
                          <div className="p-2 bg-primary/10 rounded-xl text-primary">
                            <ArrowRight className="w-5 h-5" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            ) : null}

            {/* Dishes Section */}
            {results?.dishes.length ? (
              <section>
                <div className="flex items-center gap-3 mb-8">
                  <div className="bg-primary/10 p-2 rounded-xl text-primary">
                    <ChefHat className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-black">Dishes</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {results.dishes.map((dish: any) => (
                    <div 
                      key={dish.id} 
                      className="glass group p-6 rounded-[2rem] border border-border-subtle hover:border-primary/30 transition-all flex gap-6"
                    >
                      <div className="w-24 h-24 bg-foreground/5 rounded-2xl overflow-hidden shrink-0">
                        {dish.imageUrl && (
                          <img src={dish.imageUrl} alt={dish.name} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="font-black text-lg mb-1">{dish.name}</h4>
                          <p className="text-xs text-foreground/40 font-bold uppercase tracking-widest mb-2">{dish.restaurant.name}</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-primary font-black">{formatMoney(dish.priceCents)}</span>
                          <Link 
                            href={`/restaurants/${dish.restaurantId}`}
                            className="p-2 bg-foreground/5 rounded-xl hover:bg-primary hover:text-white transition-all"
                          >
                            <ShoppingBag className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {!results?.restaurants.length && !results?.dishes.length && (
              <div className="text-center py-20 glass rounded-[3rem]">
                <div className="bg-foreground/5 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-8 h-8 text-foreground/20" />
                </div>
                <h3 className="text-2xl font-black mb-2">No results found</h3>
                <p className="text-foreground/50 max-w-md mx-auto">
                  We couldn't find any restaurants or dishes matching your search. Try a different keyword or explore our categories!
                </p>
                <Link href="/" className="inline-flex items-center gap-2 mt-8 text-primary font-black uppercase tracking-widest text-xs hover:gap-4 transition-all">
                  <span>Explore Menu</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
