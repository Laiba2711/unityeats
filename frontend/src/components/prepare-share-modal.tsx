"use client";

import { useState } from "react";
import { X, MapPin, Lock, Send, Loader2, ShoppingBag, Home, Navigation } from "lucide-react";
import { formatMoney } from "@/lib/money";
import dynamic from "next/dynamic";

const MapComponent = dynamic(() => import("./map-component"), { 
  ssr: false,
  loading: () => <div className="h-64 w-full bg-foreground/5 animate-pulse rounded-2xl flex items-center justify-center font-bold text-foreground/20 border-2 border-dashed border-border-subtle">Loading Interactive Map...</div>
});

type CartItem = {
  id: string;
  quantity: number;
  menuItem: {
    name: string;
    priceCents: number;
  };
};

export function PrepareShareModal({
  isOpen,
  onClose,
  onConfirm,
  items,
  totalAmount,
  loading
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (location: string) => void;
  items: CartItem[];
  totalAmount: number;
  loading: boolean;
}) {
  const [address, setAddress] = useState("");
  const [houseInfo, setHouseInfo] = useState("");
  const [coords, setCoords] = useState<{lat: number, lng: number} | null>(null);

  if (!isOpen) return null;

  const handleFinalConfirm = () => {
    const finalLocation = `${address}${houseInfo ? ` (House/Floor: ${houseInfo})` : ""}${coords ? ` [📍 ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}]` : ""}`;
    onConfirm(finalLocation);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-background/60 backdrop-blur-xl animate-in fade-in" onClick={onClose} />
      
      <div className="relative w-full max-w-5xl bg-background border border-border-subtle rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in slide-in-from-bottom-10 duration-500 max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="absolute top-0 left-0 right-0 h-32 bg-primary/5 -z-10" />
        
        <div className="p-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full mb-3">
                <Lock className="w-3 h-3 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">Final Review</span>
              </div>
              <h2 className="text-4xl font-black tracking-tight">Prepare to Share</h2>
              <p className="text-foreground/50 font-medium">Set the exact delivery destination on the map</p>
            </div>
            <button onClick={onClose} className="p-4 bg-foreground/5 rounded-2xl hover:text-primary transition-all hover:scale-110">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
            {/* Left Column: Order Summary (2/5) */}
            <div className="lg:col-span-2 space-y-6">
              <div className="glass p-8 rounded-3xl border border-border-subtle h-full">
                <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-foreground/30 mb-6">
                  <ShoppingBag className="w-4 h-4" />
                  <span>Order Summary</span>
                </div>
                <div className="max-h-[300px] overflow-y-auto pr-4 space-y-4 custom-scrollbar">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between items-start">
                      <div className="flex gap-3">
                        <span className="font-black text-primary bg-primary/10 w-6 h-6 rounded flex items-center justify-center text-xs">
                          {item.quantity}x
                        </span>
                        <span className="font-bold text-sm text-foreground/80">{item.menuItem.name}</span>
                      </div>
                      <span className="font-bold text-sm">
                        {formatMoney(item.menuItem.priceCents * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-8 pt-6 border-t border-dashed border-border-subtle flex justify-between items-end">
                  <span className="text-sm font-bold text-foreground/40">Total</span>
                  <span className="text-4xl font-black text-primary">{formatMoney(totalAmount * 100)}</span>
                </div>
              </div>
            </div>

            {/* Right Column: Detailed Location (3/5) */}
            <div className="lg:col-span-3 space-y-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-foreground/30">
                    <Navigation className="w-4 h-4" />
                    <span>Interactive Map Picker</span>
                  </div>
                  <button 
                    onClick={() => {
                      if ("geolocation" in navigator) {
                        navigator.geolocation.getCurrentPosition(async (pos) => {
                          const { latitude, longitude } = pos.coords;
                          setCoords({ lat: latitude, lng: longitude });
                          setAddress("Fetching current location...");
                          try {
                            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                            const data = await res.json();
                            setAddress(data.display_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
                          } catch {
                            setAddress(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
                          }
                        });
                      }
                    }}
                    className="flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-lg text-xs font-black hover:bg-primary hover:text-white transition-all"
                  >
                    <Navigation className="w-3 h-3" />
                    <span>Detect My Location</span>
                  </button>
                </div>

                {/* Location Presets */}
                <div className="flex flex-wrap gap-3">
                  {[
                    { label: "Home", icon: Home, color: "bg-blue-500/10 text-blue-500" },
                    { label: "Work", icon: ShoppingBag, color: "bg-amber-500/10 text-amber-500" },
                    { label: "Partner", icon: Navigation, color: "bg-pink-500/10 text-pink-500" }
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setAddress(preset.label)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all hover:scale-105 active:scale-95 ${preset.color}`}
                    >
                      <preset.icon className="w-3 h-3" />
                      <span>{preset.label}</span>
                    </button>
                  ))}
                </div>

                <div className="h-64 relative">
                  <MapComponent 
                    center={coords ? [coords.lat, coords.lng] : undefined}
                    onLocationSelect={async (lat, lng) => {
                      setCoords({lat, lng});
                      setAddress("Fetching address...");
                      try {
                        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
                        const data = await res.json();
                        setAddress(data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`);
                      } catch {
                        setAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
                      }
                    }} 
                  />
                </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 ml-2">Street Address / Area</label>
                  <div className="relative group">
                    <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/20 group-focus-within:text-primary transition-colors" />
                    <input
                      type="text"
                      placeholder="e.g. 123 Main St, Downtown"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full pl-14 pr-6 py-5 bg-foreground/5 border-2 border-transparent focus:border-primary focus:bg-background rounded-3xl outline-none transition-all font-bold text-base shadow-inner"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 ml-2">House / Floor / Apartment</label>
                  <div className="relative group">
                    <Home className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/20 group-focus-within:text-primary transition-colors" />
                    <input
                      type="text"
                      placeholder="e.g. Apt 4B, 2nd Floor"
                      value={houseInfo}
                      onChange={(e) => setHouseInfo(e.target.value)}
                      className="w-full pl-14 pr-6 py-5 bg-foreground/5 border-2 border-transparent focus:border-primary focus:bg-background rounded-3xl outline-none transition-all font-bold text-base shadow-inner"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleFinalConfirm}
                disabled={loading || address.length < 5}
                className="w-full py-6 rounded-3xl bg-primary hover:bg-primary-hover text-white font-black text-2xl shadow-2xl shadow-primary/40 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-4 disabled:opacity-50 disabled:grayscale"
              >
                {loading ? (
                  <Loader2 className="w-8 h-8 animate-spin" />
                ) : (
                  <>
                    <span>Lock & Share Order</span>
                    <Send className="w-6 h-6" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
