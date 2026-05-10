"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";

export function SearchInput() {
  const router = useRouter();

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const query = e.currentTarget.value;
      if (query.trim()) {
        router.push(`/search?q=${encodeURIComponent(query)}`);
      }
    }
  };

  return (
    <div className="flex-1 glass shadow-2xl rounded-3xl border border-border-subtle p-2 flex items-center group focus-within:border-primary transition-all">
      <div className="p-4 bg-primary/10 rounded-2xl text-primary group-focus-within:bg-primary group-focus-within:text-white transition-all">
        <Search className="w-6 h-6" />
      </div>
      <input 
        type="text" 
        placeholder="Search restaurant or dish..." 
        className="flex-1 bg-transparent border-none outline-none px-6 font-black text-lg placeholder:text-foreground/20"
        onKeyDown={handleSearch}
      />
    </div>
  );
}
