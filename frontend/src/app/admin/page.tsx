"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Navbar } from "@/components/navbar";
import { fetchApi } from "@/lib/api";
import { useRouter } from "next/navigation";
import { 
  Users, 
  Store, 
  ShoppingBag, 
  ArrowUpRight, 
  Settings, 
  Plus, 
  Star,
  MapPin,
  TrendingUp,
  Activity
} from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "ADMIN")) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchApi("/restaurants");
        setRestaurants(data.restaurants);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.role === "ADMIN") loadData();
  }, [user]);

  if (authLoading || loading) return <div className="min-h-screen flex items-center justify-center">Loading Dashboard...</div>;

  const stats = [
    { label: "Total Users", value: "1,284", icon: Users, color: "bg-blue-500", trend: "+12%" },
    { label: "Active Restaurants", value: restaurants.length.toString(), icon: Store, color: "bg-emerald-500", trend: "+3" },
    { label: "Daily Orders", value: "42", icon: ShoppingBag, color: "bg-orange-500", trend: "+18%" },
    { label: "Revenue (MTD)", value: "$4,820", icon: TrendingUp, color: "bg-primary", trend: "+24%" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black tracking-tight mb-2">Admin Dashboard</h1>
            <p className="text-foreground/50 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-500" />
              Platform is running smoothly
            </p>
          </div>
          <Link 
            href="/restaurants/new"
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>Onboard New Restaurant</span>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, i) => (
            <div key={i} className="glass p-6 rounded-3xl relative overflow-hidden group">
              <div className={`absolute top-0 right-0 w-32 h-32 ${stat.color} opacity-[0.03] -mr-16 -mt-16 rounded-full group-hover:scale-150 transition-transform duration-700`} />
              <div className="flex items-start justify-between mb-4">
                <div className={`${stat.color} p-3 rounded-2xl shadow-lg`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-emerald-500 text-xs font-black bg-emerald-500/10 px-2 py-1 rounded-lg">
                  {stat.trend}
                </span>
              </div>
              <div className="text-3xl font-black mb-1">{stat.value}</div>
              <div className="text-sm font-bold text-foreground/40 uppercase tracking-widest">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Restaurant List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between mb-2 px-2">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Store className="w-5 h-5 text-primary" />
                Manage Restaurants
              </h2>
              <button className="text-xs font-black uppercase tracking-widest text-primary hover:underline">View All</button>
            </div>
            
            <div className="space-y-4">
              {restaurants.map((res) => (
                <div key={res.id} className="glass p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 group hover:border-primary/20 transition-all">
                  <div className="w-16 h-16 rounded-xl bg-foreground/5 overflow-hidden shrink-0">
                    {res.imageUrl ? (
                      <img src={res.imageUrl} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-foreground/10 font-black">
                        {res.name[0]}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold mb-1 truncate">{res.name}</div>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-foreground/40 font-semibold">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {res.address}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500" />
                        {res.rating}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end sm:justify-start">
                    <button className="p-2 hover:bg-foreground/5 rounded-lg text-foreground/40 hover:text-primary transition-all">
                      <Settings className="w-5 h-5" />
                    </button>
                    <button className="p-2 hover:bg-foreground/5 rounded-lg text-foreground/40 hover:text-primary transition-all">
                      <ArrowUpRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity Mock */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2 px-2">
              <Activity className="w-5 h-5 text-emerald-500" />
              Recent Activity
            </h2>
            <div className="glass p-6 rounded-3xl space-y-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex gap-4 group">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 ring-4 ring-primary/10" />
                  <div>
                    <div className="text-sm font-bold mb-1">New order from UnityEats Group</div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-foreground/30">2 minutes ago</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
