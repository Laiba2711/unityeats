"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/navbar";
import { CheckCircle2, Package, Truck, Utensils, ArrowRight, Home, Clock, Loader2, X } from "lucide-react";
import Link from "next/link";
import confetti from "canvas-confetti";

import { useSearchParams } from "next/navigation";
import { fetchApi } from "@/lib/api";
import { ReceiptModal } from "@/components/receipt-modal";

import { Suspense } from "react";

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes in seconds
  const [progress, setProgress] = useState(25);
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  useEffect(() => {
    if (orderId) {
      const sessionId = searchParams.get("session_id");
      const url = sessionId ? `/orders/${orderId}?session_id=${sessionId}` : `/orders/${orderId}`;
      fetchApi(url)
        .then((data) => {
          setOrder(data.order);
          // Calculate time left based on order creation (30 min estimate)
          const created = new Date(data.order.createdAt).getTime();
          const now = Date.now();
          const elapsed = Math.floor((now - created) / 1000);
          const remaining = Math.max(0, 1800 - elapsed);
          setTimeLeft(remaining);
          
          // Update progress based on elapsed time (25% initial, up to 100%)
          const progressBoost = Math.min(75, Math.floor((elapsed / 1800) * 100));
          setProgress(25 + progressBoost);
        })
        .catch((err) => {
          console.error(err);
          setError(err.message);
        });
    }

    // Fire confetti on mount
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);

    // Countdown timer
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(timer);
    };
  }, [orderId, searchParams]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col min-h-screen bg-background hero-gradient">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-20 flex flex-col items-center">
        {/* Success Header */}
        <div className="text-center space-y-6 mb-16 animate-in zoom-in duration-700">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
            <div className="relative bg-primary text-white p-6 rounded-[2.5rem] shadow-2xl shadow-primary/40 rotate-12 hover:rotate-0 transition-transform duration-500">
              <CheckCircle2 className="w-16 h-16" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-5xl font-black tracking-tight">Order Placed!</h1>
            <p className="text-xl text-foreground/50 font-medium">Your feast is being prepared by our chefs.</p>
          </div>
        </div>

        {/* Live Tracking Card */}
        <div className="w-full glass rounded-[3rem] p-10 shadow-2xl border border-primary/10 relative overflow-hidden mb-12">
          <div className="absolute top-0 left-0 w-full h-1 bg-foreground/5">
            <div 
              className="h-full bg-primary transition-all duration-1000 ease-out" 
              style={{ width: `${progress}%` }} 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Timer Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 text-primary">
                <Clock className="w-6 h-6 animate-pulse" />
                <span className="font-black uppercase tracking-[0.2em] text-xs">Estimated Delivery</span>
              </div>
              <div className="text-6xl sm:text-8xl font-black tracking-tighter tabular-nums">
                {formatTime(timeLeft)}
              </div>
              <p className="text-foreground/40 font-bold text-sm">
                Hang tight! Our rider is already on their way to the restaurant.
              </p>
            </div>

            {/* Steps Section */}
            <div className="space-y-8">
              {[
                { icon: CheckCircle2, label: "Order Received", status: "completed" },
                { icon: Utensils, label: "Preparing Meal", status: "active" },
                { icon: Truck, label: "On the Road", status: "pending" },
                { icon: Home, label: "At Your Door", status: "pending" },
              ].map((step, i) => (
                <div key={i} className={`flex items-center gap-5 ${step.status === 'pending' ? 'opacity-30' : ''}`}>
                  <div className={`p-3 rounded-xl ${step.status === 'completed' ? 'bg-primary text-white' : step.status === 'active' ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-foreground/5 text-foreground/20'}`}>
                    <step.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-black text-lg leading-none">{step.label}</div>
                    {step.status === 'active' && <div className="text-xs font-bold text-primary mt-1 animate-pulse">In Progress...</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-6 w-full max-w-xl">
          <Link 
            href="/" 
            className="flex-1 py-5 bg-foreground text-background rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:scale-[1.02] transition-all"
          >
            <Home className="w-5 h-5" />
            <span>Go Home</span>
          </Link>
          <button 
            onClick={() => setIsReceiptOpen(true)}
            className="flex-1 py-5 glass border border-border-subtle rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-foreground/5 transition-all"
          >
            <span>View Receipt</span>
            <ArrowRight className="w-5 h-5 text-foreground/20" />
          </button>
        </div>

        <p className="mt-12 text-foreground/30 text-xs font-bold uppercase tracking-widest text-center max-w-md">
          {orderId ? `A confirmation email has been sent to your registered address. For support, quote order #UE-${orderId.slice(-5).toUpperCase()}.` : 'Order confirmed. Processing your receipt...'}
        </p>
      </main>

      <ReceiptModal 
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        order={order}
      />
      
      {isReceiptOpen && !order && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-background/60 backdrop-blur-xl animate-in fade-in">
          <div className="bg-background border border-border-subtle p-10 rounded-[2.5rem] shadow-2xl flex flex-col items-center gap-6 max-w-sm text-center">
            {error ? (
               <>
                <div className="bg-red-500/10 p-4 rounded-2xl text-red-500">
                  <X className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <p className="text-xl font-black">Oops! Something went wrong</p>
                  <p className="text-sm text-foreground/40 font-medium">{error}</p>
                </div>
                <button 
                  onClick={() => {
                    setIsReceiptOpen(false);
                    setError(null);
                  }}
                  className="w-full py-4 bg-foreground text-background rounded-xl font-bold"
                >
                  Close
                </button>
              </>
            ) : orderId ? (
              <>
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <div className="space-y-2">
                  <p className="text-xl font-black">Fetching your receipt...</p>
                  <p className="text-sm text-foreground/40 font-medium">We're retrieving your order details from our servers.</p>
                </div>
              </>
            ) : (
              <>
                <div className="bg-red-500/10 p-4 rounded-2xl text-red-500">
                  <X className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <p className="text-xl font-black">Receipt Unavailable</p>
                  <p className="text-sm text-foreground/40 font-medium">We couldn't find an order ID for this session. You can view your order history in your profile.</p>
                </div>
                <button 
                  onClick={() => setIsReceiptOpen(false)}
                  className="w-full py-4 bg-foreground text-background rounded-xl font-bold"
                >
                  Close
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col min-h-screen bg-background hero-gradient items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    }>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
