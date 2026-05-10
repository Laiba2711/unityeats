"use client";

import { useEffect, useState, use } from "react";
import { fetchApi } from "@/lib/api";
import { Navbar } from "@/components/navbar";
import { useRouter, useSearchParams } from "next/navigation";
import { UtensilsCrossed, ArrowLeft, Star, ShoppingCart, Plus, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

type MenuItem = {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  imageUrl: string | null;
};

type Restaurant = {
  id: string;
  name: string;
  cuisine: string;
  description: string;
  address: string;
  imageUrl: string | null;
  rating: number;
  menuItems: MenuItem[];
};

import { Suspense } from "react";

function RestaurantDetailContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const cartToken = searchParams.get("cart");
  
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [activeToken, setActiveToken] = useState<string | null>(cartToken);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creatingCart, setCreatingCart] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);
  
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    fetchApi(`/restaurants/${id}`)
      .then((data) => setRestaurant(data.restaurant))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));

    // Also check if user has an active cart for this restaurant
    if (user) {
      fetchApi(`/carts/active?restaurantId=${id}`)
        .then(data => {
          if (data.token) setActiveToken(data.token);
        })
        .catch(console.error);
    }
  }, [id, user]);

  const handleStartCart = async () => {
    if (activeToken) {
      router.push(`/cart/${activeToken}`);
      return;
    }

    setCreatingCart(true);
    try {
      const data = await fetchApi("/carts", {
        method: "POST",
        body: JSON.stringify({ restaurantId: id }),
      });
      router.push(`/cart/${data.cart.shareToken}`);
    } catch (err: any) {
      alert("Please login to start a shared cart!");
      router.push("/login");
    } finally {
      setCreatingCart(false);
    }
  };

  const handleAddItem = async (menuItemId: string) => {
    setAddingId(menuItemId);
    try {
      let currentToken = activeToken;

      // If no cart, create one first
      if (!currentToken) {
        setCreatingCart(true);
        const data = await fetchApi("/carts", {
          method: "POST",
          body: JSON.stringify({ restaurantId: id }),
        });
        currentToken = data.cart.shareToken;
        setActiveToken(currentToken);
      }

      await fetchApi(`/carts/${currentToken}/items`, {
        method: "POST",
        body: JSON.stringify({ menuItemId, quantity: 1 }),
      });

      // No longer redirecting automatically - let the user stay and add more!
      // The Navbar will update via socket or we could trigger a local refresh if needed.
    } catch (err: any) {
      alert("Please login to add items to a cart!");
      router.push("/login");
    } finally {
      setAddingId(null);
      setCreatingCart(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!restaurant) return <div className="min-h-screen flex items-center justify-center">Not found</div>;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />

      <main className="flex-1">
        {/* Header Section */}
        <div className="relative h-[400px] bg-foreground/10">
          {restaurant.imageUrl ? (
            <img src={restaurant.imageUrl} alt={restaurant.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <UtensilsCrossed className="w-20 h-20 text-foreground/10" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
          
          <div className="absolute top-8 left-8 z-10">
            <button 
              onClick={() => router.push('/')}
              className="glass px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold text-foreground/60 hover:text-primary hover:border-primary transition-all shadow-xl"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Go Back</span>
            </button>
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 p-8 max-w-7xl mx-auto">
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div className="animate-in">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-full">
                    {restaurant.cuisine}
                  </span>
                  <div className="flex items-center gap-1.5 text-orange-400 font-black">
                    <Star className="w-4 h-4 fill-orange-400" />
                    <span>{restaurant.rating.toFixed(1)}</span>
                  </div>
                </div>
                <h1 className="text-5xl font-black tracking-tight mb-4">{restaurant.name}</h1>
                <p className="text-lg text-foreground/60 max-w-2xl">{restaurant.description}</p>
              </div>

              {activeToken ? (
                <Link
                  href={`/cart/${activeToken}`}
                  className="flex items-center gap-3 px-8 py-4 bg-primary hover:bg-primary-hover text-white font-bold text-lg rounded-2xl shadow-xl shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <ShoppingBag className="w-6 h-6" />
                  <span>View My Cart</span>
                </Link>
              ) : (
                <button
                  onClick={handleStartCart}
                  disabled={creatingCart}
                  className="flex items-center gap-3 px-8 py-4 bg-primary hover:bg-primary-hover text-white font-bold text-lg rounded-2xl shadow-xl shadow-primary/30 transition-all hover:scale-[1.02] disabled:opacity-50 active:scale-[0.98]"
                >
                  <ShoppingCart className="w-6 h-6" />
                  <span>{creatingCart ? "Starting..." : "Start Shared Cart"}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Menu Section */}
        <div className="max-w-7xl mx-auto px-6 py-20">
          <h2 className="text-3xl font-black mb-12 tracking-tight">Full Menu</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {restaurant.menuItems.map((item) => (
              <div
                key={item.id}
                className="glass rounded-2xl p-6 flex gap-6 hover:shadow-lg transition-all border-transparent hover:border-border-subtle group"
              >
                <div className="flex-1 flex flex-col">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{item.name}</h3>
                    <p className="text-foreground/50 text-sm mb-4 line-clamp-2">{item.description}</p>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-2xl font-black text-primary">
                      ${(item.priceCents / 100).toFixed(2)}
                    </div>
                    <button
                      onClick={() => handleAddItem(item.id)}
                      disabled={addingId === item.id || creatingCart}
                      className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-xl font-bold transition-all disabled:opacity-50"
                    >
                      {addingId === item.id ? (
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                      <span>Add</span>
                    </button>
                  </div>
                </div>
                {item.imageUrl && (
                  <img src={item.imageUrl} alt={item.name} className="w-32 h-32 rounded-2xl object-cover shadow-md" />
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function RestaurantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <RestaurantDetailContent params={params} />
    </Suspense>
  );
}
