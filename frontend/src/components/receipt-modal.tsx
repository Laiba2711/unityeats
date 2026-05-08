"use client";

import { X, Receipt, ShoppingBag, MapPin, CreditCard, Download } from "lucide-react";
import { formatMoney } from "@/lib/money";

type OrderItem = {
  id: string;
  itemName: string;
  priceCents: number;
  quantity: number;
};

type Order = {
  id: string;
  totalCents: number;
  paymentMethod: string;
  createdAt: string;
  lines: OrderItem[];
  cart: {
    restaurant: {
      name: string;
    };
    deliveryLocation: string;
  };
};

export function ReceiptModal({
  isOpen,
  onClose,
  order
}: {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}) {
  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-background/60 backdrop-blur-xl animate-in fade-in" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-background border border-border-subtle rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in slide-in-from-bottom-10 duration-500">
        <div className="p-10">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-3 rounded-2xl text-primary">
                <Receipt className="w-6 h-6" />
              </div>
              <h2 className="text-3xl font-black tracking-tight">Receipt</h2>
            </div>
            <button onClick={onClose} className="p-4 bg-foreground/5 rounded-2xl hover:text-primary transition-all hover:scale-110">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-8">
            {/* Order Info */}
            <div className="flex justify-between items-start">
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-foreground/30 mb-1">Restaurant</div>
                <div className="font-bold text-xl">{order.cart.restaurant.name}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-black uppercase tracking-widest text-foreground/30 mb-1">Order #</div>
                <div className="font-mono text-sm uppercase">{order.id.slice(-8)}</div>
              </div>
            </div>

            {/* Items */}
            <div className="space-y-4 pt-6 border-t border-dashed border-border-subtle">
              {order.lines.map((item) => (
                <div key={item.id} className="flex justify-between items-center text-sm">
                  <div className="flex gap-3">
                    <span className="font-black text-primary">{item.quantity}x</span>
                    <span className="font-bold">{item.itemName}</span>
                  </div>
                  <span className="font-bold">{formatMoney(item.priceCents * item.quantity)}</span>
                </div>
              ))}
            </div>

            {/* Fees & Total */}
            <div className="space-y-2 pt-6 border-t border-border-subtle">
              <div className="flex justify-between text-sm text-foreground/50 font-bold">
                <span>Subtotal</span>
                <span>{formatMoney(order.lines.reduce((acc, i) => acc + i.priceCents * i.quantity, 0))}</span>
              </div>
              <div className="flex justify-between text-sm text-foreground/50 font-bold">
                <span>Service Fee</span>
                <span>{formatMoney(250)}</span>
              </div>
              <div className="flex justify-between text-2xl font-black pt-4">
                <span>Total</span>
                <span className="text-primary">{formatMoney(order.totalCents)}</span>
              </div>
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-6 pt-6 border-t border-border-subtle">
              <div>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-foreground/30 mb-2">
                  <MapPin className="w-3 h-3" />
                  <span>Delivery to</span>
                </div>
                <div className="text-xs font-bold leading-relaxed">{order.cart.deliveryLocation}</div>
              </div>
              <div>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-foreground/30 mb-2">
                  <CreditCard className="w-3 h-3" />
                  <span>Payment</span>
                </div>
                <div className="text-xs font-bold uppercase">{order.paymentMethod}</div>
              </div>
            </div>
          </div>

          <button 
            onClick={() => window.print()}
            className="w-full mt-10 py-5 bg-foreground text-background rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:scale-[1.02] transition-all"
          >
            <Download className="w-5 h-5" />
            <span>Download Receipt</span>
          </button>
        </div>
      </div>
    </div>
  );
}
