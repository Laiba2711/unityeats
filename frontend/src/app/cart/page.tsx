"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";
import { Navbar } from "@/components/navbar";
import { ShoppingBag, ArrowRight, Search } from "lucide-react";
import Link from "next/link";

export default function CartRedirectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkActiveCart = async () => {
      try {
        const data = await fetchApi("/carts/active");
        if (data.token) {
          router.push(`/cart/${data.token}`);
        }
      } catch (err) {
        setLoading(false);
      }
    };

    checkActiveCart();
  }, [router]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-background hero-gradient">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center animate-pulse">
            <ShoppingBag className="w-12 h-12 text-primary mx-auto mb-4" />
            <p className="font-bold text-foreground/50">Finding your active cart...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background hero-gradient">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full glass p-10 rounded-[2.5rem] shadow-2xl text-center">
          <div className="bg-foreground/5 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8">
            <ShoppingBag className="w-8 h-8 text-foreground/20" />
          </div>
          <h1 className="text-3xl font-black mb-4 tracking-tight">No Active Cart</h1>
          <p className="text-foreground/50 mb-10 leading-relaxed">
            You don't have an active shared cart right now. Start a new one by exploring restaurants!
          </p>
          
          <Link
            href="/"
            className="w-full flex items-center justify-center gap-3 py-5 bg-primary hover:bg-primary-hover text-white font-black text-xl rounded-2xl transition-all hover:scale-[1.02]"
          >
            <span>Explore Restaurants</span>
            <ArrowRight className="w-5 h-5" />
          </Link>

          <Link
            href="/login"
            className="block mt-6 text-sm font-bold text-foreground/40 hover:text-primary transition-colors"
          >
            Not logged in? Sign in here
          </Link>
        </div>
      </main>
    </div>
  );
}
