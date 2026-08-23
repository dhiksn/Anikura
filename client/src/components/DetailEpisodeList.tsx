"use client";

import { useState } from "react";
import Link from "next/link";
import { Play, MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";

export function DetailEpisodeList({ episodes }: { episodes: any[] }) {
  const [search, setSearch] = useState("");

  if (!episodes || episodes.length === 0) {
    return (
      <div className="p-8 text-center rounded-xl border border-dashed border-border/60 bg-muted/20">
        <p className="text-muted-foreground">Belum ada episode yang tersedia.</p>
      </div>
    );
  }

  // Determine if we should show the search bar
  const showSearch = episodes.length > 20;

  // Reverse episodes so Episode 1 is first? Wait, usually we want newest first or oldest first.
  // The original code did [...episodes].reverse().
  // Let's preserve the exact same ordering logic from the server component.
  const reversedEpisodes = [...episodes].reverse();
  
  const filteredEpisodes = reversedEpisodes.filter((ep: any, i: number) => {
    if (!search) return true;
    const epLabel = ep.number || ep.episode || ep.title || (i + 1);
    const labelStr = String(epLabel).toLowerCase();
    const searchStr = search.toLowerCase();
    
    // Check if search matches the episode number/label or the title itself
    return labelStr.includes(searchStr) || (ep.title && ep.title.toLowerCase().includes(searchStr));
  });

  return (
    <div className="flex flex-col gap-4">
      {showSearch && (
        <div className="relative w-full max-w-sm mb-2">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlass className="h-5 w-5 text-muted-foreground" />
          </div>
          <input
            type="text"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-10"
            placeholder="Cari episode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      )}

      {filteredEpisodes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-[1px] bg-border/50 border border-border/50 rounded-2xl overflow-hidden shadow-sm">
          {filteredEpisodes.map((ep: any) => {
            // Find original index for fallback if needed, but it's better to just use the mapped logic
            // Wait, i + 1 might be wrong if we filter! We should pre-calculate the label before filtering
            const originalIndex = reversedEpisodes.indexOf(ep);
            const epLabel = ep.number || ep.episode || ep.title || (originalIndex + 1);
            
            return (
              <Link
                key={ep.url || originalIndex}
                href={`/watch?url=${encodeURIComponent(ep.url)}`}
                className="group flex items-center justify-between p-4 bg-background/80 hover:bg-muted transition-colors"
              >
                <span className="font-semibold text-foreground/90 group-hover:text-primary transition-colors line-clamp-1 pr-2">
                  {String(epLabel).toLowerCase().includes('episode') ? epLabel : `Episode ${epLabel}`}
                </span>
                <Play weight="bold" className="w-4 h-4 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="p-8 text-center rounded-xl border border-dashed border-border/60 bg-muted/20">
          <p className="text-muted-foreground">Episode tidak ditemukan.</p>
        </div>
      )}
    </div>
  );
}
