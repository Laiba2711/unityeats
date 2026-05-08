"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";
import { Navbar } from "@/components/navbar";
import { socket } from "@/lib/socket";
import { useAuth } from "@/lib/auth-context";
import { CheckoutModal } from "@/components/checkout-modal";
import { PrepareShareModal } from "@/components/prepare-share-modal";
import Link from "next/link";
import { formatMoney } from "@/lib/money";
import { 
  Users, 
  Share2, 
  Plus, 
  Minus, 
  Trash2, 
  ChefHat, 
  ShoppingBag,
  CheckCircle2,
  AlertCircle,
  Lock,
  MapPin
} from "lucide-react";

type CartItem = {
  id: string;
  quantity: number;
  menuItem: {
    id: string;
    name: string;
    priceCents: number;
    imageUrl: string | null;
  };
};

type Participant = {
  user: {
    id: string;
    name: string;
    email: string;
  };
};

type MenuItem = {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  imageUrl: string | null;
};

type Cart = {
  id: string;
  shareToken: string;
  restaurant: {
    id: string;
    name: string;
    menuItems: MenuItem[];
  };
  participants: Participant[];
  items: CartItem[];
  deliveryLocation: string | null;
  isLocked: boolean;
  createdById: string;
  order?: { id: string } | null;
};

export default function SharedCartPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isPrepareModalOpen, setIsPrepareModalOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [lockLoading, setLockLoading] = useState(false);

  const refreshCart = async () => {
    try {
      const data = await fetchApi(`/carts/${token}`);
      setCart(data.cart);
    } catch (err) {
      console.error("Refresh cart failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshCart();

    // Socket.IO setup
    socket.connect();
    socket.emit("join_cart", token);

    socket.on("cart:refresh", () => {
      console.log("Socket: Refreshing cart...");
      refreshCart();
    });

    return () => {
      socket.emit("leave_cart", token);
      socket.off("cart:refresh");
      socket.disconnect();
    };
  }, [token]);

  // Join cart automatically if logged in and not a participant
  useEffect(() => {
    if (user && cart && !cart.participants.some(p => p.user.id === user.id)) {
      fetchApi(`/carts/${token}/join`, { method: "POST" }).then(refreshCart);
    }
  }, [user, cart]);

  // Redirect to success page if order is placed
  useEffect(() => {
    if (cart?.order?.id) {
      router.push(`/checkout/success?orderId=${cart.order.id}`);
    }
  }, [cart?.order?.id, router]);

  const updateQuantity = async (menuItemId: string, newQty: number) => {
    if (newQty < 1) return;
    try {
      await fetchApi(`/carts/${token}/items`, {
        method: "POST",
        body: JSON.stringify({ menuItemId, quantity: newQty }),
      });
    } catch (err: any) {
      alert(err.message);
    }
  };

  const addItem = async (menuItemId: string) => {
    setAddingId(menuItemId);
    try {
      await fetchApi(`/carts/${token}/items`, {
        method: "POST",
        body: JSON.stringify({ menuItemId, quantity: 1 }),
      });
    } catch (err: any) {
      alert(err.message);
    } finally {
      setAddingId(null);
    }
  };

  const removeItem = async (itemId: string) => {
    // Optimistic update
    const previousCart = cart;
    if (cart) {
      setCart({
        ...cart,
        items: cart.items.filter((item) => item.id !== itemId),
      });
    }

    try {
      await fetchApi(`/carts/${token}/items/${itemId}`, { method: "DELETE" });
    } catch (err: any) {
      alert(err.message);
      // Rollback on error
      setCart(previousCart);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading shared cart...</div>;
  if (!cart) return <div className="min-h-screen flex items-center justify-center">Cart not found</div>;

  const totalCents = cart.items.reduce((acc, item) => acc + item.menuItem.priceCents * item.quantity, 0);
  const isParticipant = user && cart.participants.some(p => p.user.id === user.id);

  const handleCheckout = async (method: "STRIPE" | "COD") => {
    setCheckoutLoading(true);
    try {
      const data = await fetchApi(`/carts/${token}/checkout`, {
        method: "POST",
        body: JSON.stringify({ paymentMethod: method }),
      });

      if (data.url) {
        window.location.href = data.url;
      } else {
        router.push(`/checkout/success?orderId=${data.orderId}`);
      }
    } catch (err: any) {
      if (err.message === "Order already processed") {
        router.push("/checkout/success");
      } else {
        alert(err.message);
      }
    } finally {
      setCheckoutLoading(false);
      setIsCheckoutModalOpen(false);
    }
  };

  const handleLock = async (location: string) => {
    setLockLoading(true);
    try {
      await fetchApi(`/carts/${token}/lock`, {
        method: "POST",
        body: JSON.stringify({ deliveryLocation: location }),
      });
      setIsPrepareModalOpen(false);
      refreshCart();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLockLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background hero-gradient">
      <Navbar />

      {!user && (
        <div className="bg-primary/90 text-white py-3 px-6 text-center font-bold sticky top-[80px] z-40 backdrop-blur-md animate-in slide-in-from-top duration-500">
          Want to contribute to this order?{" "}
          <Link href={`/login?redirect=/cart/${token}`} className="underline decoration-2 underline-offset-4 hover:text-white/80">
            Login or create an account
          </Link>
        </div>
      )}

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* Left Column: Cart Items & Quick Add */}
        <div className="lg:col-span-2 space-y-12 animate-in">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
              <div>
                <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">Our Order</h1>
                <p className="text-foreground/60 flex items-center gap-2">
                  <ChefHat className="w-4 h-4" />
                  Ordering from <span className="font-bold text-foreground">{cart.restaurant.name}</span>
                </p>
              </div>
              <div className="flex flex-wrap gap-4">
                {cart.isLocked ? (
                  <button
                    onClick={copyLink}
                    className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-black/40 border border-border-subtle rounded-xl font-bold text-sm hover:border-primary transition-all shadow-xl"
                  >
                    {copied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Share2 className="w-4 h-4 text-primary" />}
                    <span>{copied ? "Link Copied!" : "Share Link"}</span>
                  </button>
                ) : user?.id === cart.createdById ? (
                  <button
                    onClick={() => setIsPrepareModalOpen(true)}
                    disabled={cart.items.length === 0}
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary-hover transition-all shadow-xl shadow-primary/20 disabled:opacity-50"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Review & Share</span>
                  </button>
                ) : (
                  <div className="px-6 py-3 bg-foreground/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-foreground/40 border border-border-subtle">
                    Waiting for Creator
                  </div>
                )}
              </div>
            </div>

            {cart.isLocked && (
              <div className="mb-10 p-8 glass-primary border-primary/20 rounded-[2rem] flex items-center gap-6 animate-in slide-in-from-top-4">
                <div className="bg-primary p-4 rounded-2xl text-white shadow-xl shadow-primary/20">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-1">Locked Delivery Destination</div>
                  <div className="text-xl md:text-2xl font-black text-foreground break-words">{cart.deliveryLocation}</div>
                </div>
              </div>
            )}

            {cart.items.length === 0 ? (
              <div className="glass rounded-3xl p-20 text-center flex flex-col items-center">
                <div className="bg-foreground/5 p-6 rounded-full mb-6">
                  <ShoppingBag className="w-12 h-12 text-foreground/20" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Your cart is empty</h3>
                <p className="text-foreground/50 mb-8">Items will appear here as soon as someone adds them.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.items.map((item) => (
                  <div key={item.id} className="glass rounded-2xl p-6 flex items-center gap-6 group transition-all hover:border-primary/20">
                    {item.menuItem.imageUrl ? (
                      <img src={item.menuItem.imageUrl} alt={item.menuItem.name} className="w-20 h-20 rounded-xl object-cover" />
                    ) : (
                      <div className="w-20 h-20 rounded-xl bg-foreground/5 flex items-center justify-center">
                        <ShoppingBag className="w-8 h-8 text-foreground/10" />
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg md:text-xl font-bold mb-1 truncate">{item.menuItem.name}</h3>
                      <div className="text-base md:text-lg font-black text-primary">
                        {formatMoney(item.menuItem.priceCents * item.quantity)}
                      </div>
                    </div>

                    <div className={`flex items-center gap-4 bg-foreground/5 p-2 rounded-xl border border-border-subtle ${(!isParticipant || cart.isLocked) ? 'opacity-50 pointer-events-none' : ''}`}>
                      <button
                        onClick={() => updateQuantity(item.menuItem.id, item.quantity - 1)}
                        className="p-1 hover:text-primary transition-colors disabled:opacity-30"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="w-5 h-5" />
                      </button>
                      <span className="font-black text-lg w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.menuItem.id, item.quantity + 1)}
                        className="p-1 hover:text-primary transition-colors"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>

                    {isParticipant && !cart.isLocked && (
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-3 text-foreground/20 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Add Menu Section */}
          {!cart.isLocked && (
            <div className={`pt-8 border-t border-border-subtle ${!isParticipant ? 'opacity-50 grayscale' : ''}`}>
            <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
              <Plus className="w-6 h-6 text-primary" />
              Add More from {cart.restaurant.name}
              {!isParticipant && <span className="text-xs font-bold bg-foreground/10 px-2 py-1 rounded text-foreground/60">Login to Add</span>}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cart.restaurant.menuItems.map((menuItem) => (
                <div key={menuItem.id} className="glass p-4 rounded-2xl flex items-center gap-4 group">
                  {menuItem.imageUrl ? (
                    <img src={menuItem.imageUrl} alt={menuItem.name} className="w-16 h-16 rounded-xl object-cover" />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-foreground/5 flex items-center justify-center">
                      <ChefHat className="w-6 h-6 text-foreground/10" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm truncate">{menuItem.name}</h3>
                    <div className="text-primary font-black text-xs">{formatMoney(menuItem.priceCents)}</div>
                  </div>
                  <button
                    onClick={() => addItem(menuItem.id)}
                    disabled={addingId === menuItem.id || !isParticipant}
                    className="p-2 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-lg transition-all disabled:opacity-50"
                  >
                    {addingId === menuItem.id ? (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

        {/* Right Column: Order Summary & Participants */}
        <div className="space-y-8 animate-in" style={{ animationDelay: "0.1s" }}>
          <div className="glass rounded-3xl p-8 sticky top-28 shadow-2xl">
            <h2 className="text-2xl font-black mb-8 flex items-center gap-2">
              <ShoppingBag className="w-6 h-6 text-primary" />
              Order Summary
            </h2>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-foreground/60">
                <span>Subtotal</span>
                <span>{formatMoney(totalCents)}</span>
              </div>
              <div className="flex justify-between text-foreground/60">
                <span>Service Fee</span>
                <span>$2.50</span>
              </div>
              <div className="pt-4 border-t border-border-subtle flex justify-between items-center">
                <span className="text-xl font-bold">Total</span>
                <span className="text-3xl font-black text-primary">{formatMoney(totalCents + 250)}</span>
              </div>
            </div>

            <button 
              onClick={() => setIsCheckoutModalOpen(true)}
              disabled={!isParticipant || cart.items.length === 0}
              className="w-full py-5 rounded-2xl bg-primary hover:bg-primary-hover text-white font-black text-xl shadow-xl shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              Checkout Now
            </button>

            <div className="mt-8 p-4 bg-orange-400/5 border border-orange-400/10 rounded-2xl flex gap-3 text-orange-600 dark:text-orange-400 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p>{cart.isLocked ? "This order is locked and ready for payment." : "This order is locked once the payer starts the checkout process."}</p>
            </div>
          </div>

          <div className="glass rounded-3xl p-8 shadow-xl">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Who's Hungry? ({cart.participants.length})
            </h2>
            <div className="space-y-4">
              {cart.participants.map((p) => (
                <div key={p.user.id} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-black text-xs">
                    {p.user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-sm">{p.user.name}</div>
                    <div className="text-xs text-foreground/40">{p.user.email}</div>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" title="Active" />
                </div>
              ))}
            </div>
          </div>
        </div>

      </main>
      <CheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        onConfirm={handleCheckout}
        totalAmount={(totalCents + 250) / 100}
        loading={checkoutLoading}
      />
      <PrepareShareModal
        isOpen={isPrepareModalOpen}
        onClose={() => setIsPrepareModalOpen(false)}
        onConfirm={handleLock}
        items={cart.items}
        totalAmount={(totalCents + 250) / 100}
        loading={lockLoading}
      />
    </div>
  );
}
