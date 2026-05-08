"use client";

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useState, useEffect } from "react";

// Fix for default marker icons in Leaflet with Next.js
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

function MapController({ center }: { center: [number, number] }) {
  const map = useMapEvents({});
  useEffect(() => {
    if (center) {
      map.flyTo(center, 15, { animate: true });
    }
  }, [center, map]);
  return null;
}

function LocationMarker({ onLocationSelect, position, setPosition }: { 
  onLocationSelect: (lat: number, lng: number) => void;
  position: L.LatLng | null;
  setPosition: (pos: L.LatLng) => void;
}) {
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onLocationSelect(e.latlng.lat, e.latlng.lng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
}

export default function MapComponent({ 
  onLocationSelect, 
  center 
}: { 
  onLocationSelect: (lat: number, lng: number) => void;
  center?: [number, number];
}) {
  const [markerPos, setMarkerPos] = useState<L.LatLng | null>(null);
  const [initialCenter] = useState<[number, number]>(center || [40.7128, -74.0060]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="h-full w-full bg-foreground/5 animate-pulse" />;

  return (
    <div className="h-full w-full rounded-2xl overflow-hidden border border-border-subtle shadow-inner bg-foreground/5 relative">
      <MapContainer 
        key="unityeats-map-instance"
        center={initialCenter} 
        zoom={13} 
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {center && <MapController center={center} />}
        <LocationMarker 
          onLocationSelect={onLocationSelect} 
          position={markerPos} 
          setPosition={setMarkerPos} 
        />
      </MapContainer>
    </div>
  );
}
