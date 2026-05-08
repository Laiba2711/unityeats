import { useState } from "react";
import { Search, MapPin, X, Navigation, CheckCircle2 } from "lucide-react";
import dynamic from "next/dynamic";

const MapComponent = dynamic(() => import("./map-component"), { 
  ssr: false,
  loading: () => <div className="h-full w-full bg-foreground/5 animate-pulse flex items-center justify-center">Loading Maps...</div>
});

export function LocationModal({ isOpen, onClose, onSelect }: { isOpen: boolean; onClose: () => void; onSelect: (addr: string) => void }) {
  const [query, setQuery] = useState("");
  const [mapCenter, setMapCenter] = useState<[number, number] | undefined>(undefined);
  const [isLocating, setIsLocating] = useState(false);

  const handleSearch = async () => {
    if (!query) return;
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        setMapCenter([parseFloat(lat), parseFloat(lon)]);
        setQuery(display_name);
      }
    } catch (err) {
      console.error("Geocoding failed:", err);
    }
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser. Please use the search bar.");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setMapCenter([latitude, longitude]);
        
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          setQuery(data.display_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        } catch {
          setQuery(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        }
        setIsLocating(false);
      },
      (err) => {
        let msg = "Could not detect location.";
        if (err.code === 1) msg = "Location access denied. Please enable permissions or search manually.";
        else if (err.code === 2) msg = "Location unavailable. Please search manually.";
        else if (err.code === 3) msg = "Location request timed out. Please try again or search manually.";
        
        alert(msg);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };
  
  const handleSelect = () => {
    if (query) {
      onSelect(query);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-background/60 backdrop-blur-xl animate-in fade-in" onClick={onClose} />
      
      <div className="relative w-full max-w-5xl bg-background border border-border-subtle rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in slide-in-from-bottom-10 duration-500 flex flex-col md:flex-row h-[80vh]">
        {/* Sidebar Info */}
        <div className="w-full md:w-80 p-10 flex flex-col bg-foreground/[0.02] border-r border-border-subtle">
          <div className="mb-10">
            <h2 className="text-3xl font-black tracking-tight mb-2">Set Location</h2>
            <p className="text-foreground/50 text-sm">Where should we send your feast?</p>
          </div>

          <div className="space-y-4 flex-1">
            <button 
              onClick={handleDetectLocation}
              disabled={isLocating}
              className="w-full flex items-center gap-3 p-4 bg-primary text-white rounded-2xl font-bold hover:scale-[1.02] transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
            >
              <Navigation className={`w-5 h-5 ${isLocating ? 'animate-spin' : ''}`} />
              <span>{isLocating ? 'Locating...' : 'Detect My Location'}</span>
            </button>
            <div className="p-4 bg-foreground/5 rounded-2xl border border-border-subtle">
              <div className="text-[10px] font-black uppercase tracking-widest text-foreground/40 mb-2">Recent Places</div>
              <div className="space-y-2">
                {["Home", "Work", "Central Park"].map(place => (
                  <button key={place} className="flex items-center gap-2 w-full text-left text-sm font-bold hover:text-primary transition-colors py-1">
                    <MapPin className="w-3 h-3" />
                    {place}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={handleSelect}
            disabled={!query}
            className="w-full py-5 bg-foreground text-background font-black rounded-2xl hover:scale-[1.02] transition-all mt-8 disabled:opacity-50"
          >
            Confirm Location
          </button>
        </div>

        {/* Map Area */}
        <div className="flex-1 relative p-4 bg-background">
          <div className="absolute top-10 left-10 right-10 z-[1001]">
            <div className="glass shadow-2xl rounded-2xl border border-border-subtle overflow-hidden flex items-center px-4 group focus-within:border-primary transition-all bg-background/80 backdrop-blur-md">
              <Search className="w-5 h-5 text-foreground/20 group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full bg-transparent border-none outline-none p-4 font-bold text-sm"
                placeholder="Search for an address..."
              />
            </div>
          </div>

          {/* Real Interactive Map */}
          <div className="h-full rounded-3xl overflow-hidden border border-border-subtle shadow-2xl">
            <MapComponent 
              center={mapCenter}
              onLocationSelect={async (lat, lng) => {
                setMapCenter([lat, lng]);
                setQuery("Fetching address...");
                try {
                  const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
                  const data = await res.json();
                  setQuery(data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`);
                } catch {
                  setQuery(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
                }
              }} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
