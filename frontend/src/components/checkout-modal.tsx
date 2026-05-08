"use client";

import { useState } from "react";
import { X, CreditCard, Banknote, ShieldCheck, ArrowRight, Loader2 } from "lucide-react";
import { formatMoney } from "@/lib/money";

export function CheckoutModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  totalAmount,
  loading 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: (method: "STRIPE" | "COD") => void;
  totalAmount: number;
  loading: boolean;
}) {
  const [method, setMethod] = useState<"STRIPE" | "COD">("STRIPE");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-background/60 backdrop-blur-xl animate-in fade-in" onClick={onClose} />
      
      <div className="relative w-full max-w-xl bg-background border border-border-subtle rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in slide-in-from-bottom-10 duration-500">
        <div className="p-10">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-black tracking-tight mb-2">Finalize Order</h2>
              <p className="text-foreground/50">Select your preferred payment method</p>
            </div>
            <button onClick={onClose} className="p-3 bg-foreground/5 rounded-2xl hover:text-primary transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-4 mb-10">
            <button
              onClick={() => setMethod("STRIPE")}
              className={`w-full flex items-center justify-between p-6 rounded-2xl border-2 transition-all group ${
                method === "STRIPE" ? "border-primary bg-primary/5" : "border-border-subtle hover:border-primary/30"
              }`}
            >
              <div className="flex items-center gap-6">
                <div className={`p-4 rounded-xl transition-colors ${method === "STRIPE" ? "bg-primary text-white" : "bg-foreground/5 text-foreground/40"}`}>
                  <CreditCard className="w-8 h-8" />
                </div>
                <div className="text-left">
                  <div className="text-xl font-bold mb-1">Pay with Card</div>
                  <div className="text-xs font-bold text-foreground/40 uppercase tracking-widest">Powered by Stripe</div>
                </div>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${method === "STRIPE" ? "border-primary bg-primary" : "border-foreground/20"}`}>
                {method === "STRIPE" && <div className="w-2 h-2 bg-white rounded-full" />}
              </div>
            </button>

            <button
              onClick={() => setMethod("COD")}
              className={`w-full flex items-center justify-between p-6 rounded-2xl border-2 transition-all group ${
                method === "COD" ? "border-primary bg-primary/5" : "border-border-subtle hover:border-primary/30"
              }`}
            >
              <div className="flex items-center gap-6">
                <div className={`p-4 rounded-xl transition-colors ${method === "COD" ? "bg-primary text-white" : "bg-foreground/5 text-foreground/40"}`}>
                  <Banknote className="w-8 h-8" />
                </div>
                <div className="text-left">
                  <div className="text-xl font-bold mb-1">Cash on Delivery</div>
                  <div className="text-xs font-bold text-foreground/40 uppercase tracking-widest">Pay when you receive</div>
                </div>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${method === "COD" ? "border-primary bg-primary" : "border-foreground/20"}`}>
                {method === "COD" && <div className="w-2 h-2 bg-white rounded-full" />}
              </div>
            </button>
          </div>

          <div className="p-6 bg-foreground/5 rounded-2xl flex items-center gap-4 text-sm font-bold text-foreground/60 mb-10">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            <span>Secure Checkout • Encrypted Transactions</span>
          </div>

          <button
            onClick={() => onConfirm(method)}
            disabled={loading}
            className="w-full py-6 rounded-2xl bg-primary hover:bg-primary-hover text-white font-black text-2xl shadow-2xl shadow-primary/40 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                <span>Complete {formatMoney(totalAmount * 100)} Order</span>
                <ArrowRight className="w-6 h-6" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
