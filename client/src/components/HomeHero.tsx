"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play } from "@phosphor-icons/react/dist/ssr";
import { AnimeBase } from "@/lib/api";
import { Badge } from "./ui/badge";
import { buttonVariants } from "./ui/button";
import { cn } from "@/lib/utils";

export function HomeHero({ animes }: { animes: AnimeBase[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (animes.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % animes.length);
    }, 5000); // Swap every 5 seconds
    
    return () => clearInterval(interval);
  }, [animes.length]);

  if (!animes || animes.length === 0) return null;

  const anime = animes[currentIndex];
  
  const urlObj = new URL(anime.url);
  const pathParts = urlObj.pathname.split('/').filter(Boolean);
  const slug = pathParts[pathParts.length - 1];

  return (
    <section className="relative w-full min-h-[75vh] flex items-center pt-28 md:pt-36 pb-20 overflow-hidden border-b border-border/40">
      
      {/* Background Abstract Aura (Blurred) with smooth transitions */}
      <div className="absolute inset-0 z-0 bg-background">
        {animes.map((item, i) => (
          <div 
            key={`bg-${i}`}
            className={cn(
              "absolute inset-0 mix-blend-screen transition-opacity duration-1000 ease-in-out",
              i === currentIndex ? "opacity-40" : "opacity-0"
            )}
          >
            <Image
              src={item.thumbnail || "https://picsum.photos/seed/anime-hero/1920/1080"}
              alt="aura"
              fill
              className="object-cover blur-[100px] scale-150 saturate-150"
              priority={i === 0}
            />
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-background/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-background/20" />
      </div>

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl flex flex-col md:flex-row items-center justify-between gap-10 lg:gap-12">
        
        {/* Left Content (Text) */}
        <div 
          key={`text-${currentIndex}`} 
          className="flex-1 w-full max-w-xl flex flex-col items-start gap-5 pt-8 md:pt-16 animate-in fade-in zoom-in-[0.98] duration-500"
        >
          <div className="flex gap-2 flex-wrap">
            {anime.status ? (
              <Badge className="bg-primary text-primary-foreground font-bold shadow-md text-xs pointer-events-none uppercase tracking-wider px-3 py-1">
                {anime.status}
              </Badge>
            ) : null}
            {anime.rating > 0 ? (
              <Badge variant="secondary" className="bg-muted/80 backdrop-blur-md text-foreground font-mono shadow-sm text-xs pointer-events-none px-3 py-1">
                ★ {anime.rating}
              </Badge>
            ) : null}
            {anime.episode ? (
              <Badge variant="secondary" className="bg-foreground text-background font-bold shadow-md text-xs pointer-events-none px-3 py-1.5">
                {anime.episode}
              </Badge>
            ) : null}
          </div>
          
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tighter leading-[1.1] text-foreground line-clamp-2 drop-shadow-sm">
            {anime.title}
          </h1>
          
          <p className="text-base md:text-lg text-muted-foreground/90 line-clamp-3 max-w-[50ch] leading-relaxed">
            Saksikan episode terbaru dari {anime.title}. Nikmati animasi memukau dan cerita yang memikat sekarang juga.
          </p>
          
          <div className="mt-6 flex items-center gap-4">
            <Link href={`/anime/${slug}`} className={cn(buttonVariants({ size: "lg" }), "rounded-full px-8 h-12 text-base font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all")}>
              <Play weight="fill" className="mr-2 h-5 w-5" />
              Tonton Sekarang
            </Link>
          </div>
        </div>

        {/* Right Stacked 3D Carousel Posters */}
        <div className="hidden md:flex relative w-56 lg:w-64 xl:w-72 aspect-[3/4] shrink-0 items-center justify-center mr-16 lg:mr-24">
          {animes.map((item, i) => {
            // Calculate circular offset based on currentIndex
            const offset = (i - currentIndex + animes.length) % animes.length;
            
            // Default hidden (for items that are not in the top 3)
            let transformClass = "opacity-0 scale-75 z-0 pointer-events-none";
            
            if (offset === 0) {
              // Center / Active card
              transformClass = "translate-x-0 scale-100 z-30 opacity-100 rotate-0 shadow-[0_20px_50px_rgba(0,0,0,0.5)]";
            } else if (offset === 1 || (offset > 1 && animes.length === 2 && i !== currentIndex)) {
              // Right side card (next)
              transformClass = "translate-x-[35%] scale-[0.85] z-20 opacity-70 rotate-[6deg] shadow-2xl hover:opacity-100";
            } else if (offset === animes.length - 1) {
              // Left side card (prev)
              transformClass = "-translate-x-[35%] scale-[0.85] z-10 opacity-70 -rotate-[6deg] shadow-2xl hover:opacity-100";
            }

            return (
              <div 
                key={`card-${i}`}
                onClick={() => setCurrentIndex(i)}
                className={cn(
                  "absolute inset-0 rounded-2xl overflow-hidden border border-white/10 bg-muted transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] cursor-pointer",
                  transformClass
                )}
              >
                <Image
                  src={item.thumbnail || "https://picsum.photos/seed/anime-hero/1920/1080"}
                  alt={item.title}
                  fill
                  className="object-cover"
                  priority={i === 0}
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
