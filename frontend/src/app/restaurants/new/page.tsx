"use client";

import { useState } from "react";
import { fetchApi } from "@/lib/api";
import { Navbar } from "@/components/navbar";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { 
  Plus, 
  Trash2, 
  ChefHat, 
  MapPin, 
  UtensilsCrossed, 
  DollarSign, 
  Star,
  Search,
  CheckCircle2
} from "lucide-react";

const MapComponent = dynamic(() => import("@/components/map-component"), { 
  ssr: false,
  loading: () => <div className="h-64 w-full bg-foreground/5 animate-pulse flex items-center justify-center">Loading Maps...</div>
});

type MenuItemForm = {
  name: string;
  description: string;
  priceCents: number;
};

export default function NewRestaurantPage() {
  const [name, setName] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [rating, setRating] = useState(4.5);
  const [menuItems, setMenuItems] = useState<MenuItemForm[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const addMenuItem = () => {
    setMenuItems([...menuItems, { name: "", description: "", priceCents: 0 }]);
  };

  const removeMenuItem = (index: number) => {
    setMenuItems(menuItems.filter((_, i) => i !== index));
  };

  const updateMenuItem = (index: number, field: keyof MenuItemForm, value: any) => {
    const updated = [...menuItems];
    updated[index] = { ...updated[index], [field]: value };
    setMenuItems(updated);
  };

  const [mapCenter, setMapCenter] = useState<[number, number] | undefined>(undefined);

  const handleSearchAddress = async () => {
    if (!address) return;
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        setMapCenter([parseFloat(lat), parseFloat(lon)]);
      }
    } catch (err) {
      console.error("Geocoding failed:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await fetchApi("/restaurants", {
        method: "POST",
        body: JSON.stringify({
          name,
          cuisine,
          description,
          address,
          rating,
          menuItems
        }),
      });
      router.push("/");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background hero-gradient">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-12">
        <div className="flex items-center gap-4 mb-12">
          <div className="bg-primary p-4 rounded-2xl shadow-xl shadow-primary/20">
            <Plus className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight mb-1">New Restaurant</h1>
            <p className="text-foreground/50">Grow your business on UnityEats</p>
          </div>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl font-bold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-12">
          {/* Basic Info */}
          <section className="glass p-8 rounded-3xl shadow-xl">
            <h2 className="text-xl font-bold mb-8 flex items-center gap-2">
              <ChefHat className="w-5 h-5 text-primary" />
              General Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-sm font-black uppercase tracking-widest text-foreground/40 ml-1">Restaurant Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-4 rounded-xl bg-background border border-border-subtle focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  placeholder="e.g. Pasta Palace"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-black uppercase tracking-widest text-foreground/40 ml-1">Cuisine Type</label>
                <input
                  type="text"
                  required
                  value={cuisine}
                  onChange={(e) => setCuisine(e.target.value)}
                  className="w-full p-4 rounded-xl bg-background border border-border-subtle focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  placeholder="e.g. Italian"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-black uppercase tracking-widest text-foreground/40 ml-1">Description</label>
                <textarea
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-4 rounded-xl bg-background border border-border-subtle focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all min-h-[120px]"
                  placeholder="Tell customers what makes your restaurant special..."
                />
              </div>
            </div>
          </section>

          {/* Location Selection (Mocked Maps) */}
          <section className="glass p-8 rounded-3xl shadow-xl">
            <h2 className="text-xl font-bold mb-8 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              Location Settings
            </h2>
            <div className="space-y-6">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/20 group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearchAddress())}
                  className="w-full p-4 pl-12 rounded-xl bg-background border border-border-subtle focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  placeholder="Type address & press Enter to center map"
                />
              </div>
              
              {/* Real Map Interface */}
              <div className="relative h-64 rounded-2xl overflow-hidden border border-border-subtle shadow-inner">
                <MapComponent 
                  center={mapCenter}
                  onLocationSelect={async (lat, lng) => {
                    setMapCenter([lat, lng]);
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
            </div>
          </section>

          {/* Menu Management */}
          <section className="glass p-8 rounded-3xl shadow-xl">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <UtensilsCrossed className="w-5 h-5 text-primary" />
                Menu Items
              </h2>
              <button
                type="button"
                onClick={addMenuItem}
                className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-xl font-bold transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="space-y-6">
              {menuItems.length === 0 ? (
                <div className="p-12 text-center border-2 border-dashed border-border-subtle rounded-2xl text-foreground/30">
                  No items added yet. Click "Add Item" to build your menu.
                </div>
              ) : (
                menuItems.map((item, index) => (
                  <div key={index} className="p-6 rounded-2xl bg-foreground/5 border border-border-subtle relative group animate-in">
                    <button
                      type="button"
                      onClick={() => removeMenuItem(index)}
                      className="absolute top-4 right-4 p-2 text-foreground/20 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Item Name</label>
                        <input
                          type="text"
                          required
                          value={item.name}
                          onChange={(e) => updateMenuItem(index, "name", e.target.value)}
                          className="w-full p-3 rounded-lg bg-background border border-border-subtle focus:border-primary outline-none text-sm"
                          placeholder="e.g. Garlic Knots"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Price (Cents)</label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/20" />
                          <input
                            type="number"
                            required
                            value={item.priceCents || ""}
                            onChange={(e) => updateMenuItem(index, "priceCents", parseInt(e.target.value) || 0)}
                            className="w-full p-3 pl-9 rounded-lg bg-background border border-border-subtle focus:border-primary outline-none text-sm"
                            placeholder="999"
                          />
                        </div>
                      </div>
                      <div className="md:col-span-3 space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Short Description</label>
                        <input
                          type="text"
                          required
                          value={item.description}
                          onChange={(e) => updateMenuItem(index, "description", e.target.value)}
                          className="w-full p-3 rounded-lg bg-background border border-border-subtle focus:border-primary outline-none text-sm"
                          placeholder="e.g. Warm and buttery with herbs"
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-6 rounded-2xl bg-primary hover:bg-primary-hover text-white font-black text-2xl shadow-2xl shadow-primary/40 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? "Onboarding Restaurant..." : "Launch Restaurant"}
          </button>
        </form>
      </main>
    </div>
  );
}
