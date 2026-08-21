import Image from "next/image";
import Link from "next/link";
import { Play } from "@phosphor-icons/react/dist/ssr";
import { AnimeBase } from "@/lib/api";
import { Badge } from "./ui/badge";

export function AnimeCard({ anime, priority = false, index = 99 }: { anime: AnimeBase; priority?: boolean; index?: number }) {
  const shouldPrioritize = priority || index < 4;
  // Extract slug from URL: "https://ANIKURA.love/anime/yani-neko/" -> "yani-neko"
  const urlObj = new URL(anime.url);
  const pathParts = urlObj.pathname.split('/').filter(Boolean);
  const slug = pathParts[pathParts.length - 1];
  
  return (
    <Link href={`/anime/${slug}`} className="group relative flex flex-col gap-3 rounded-lg overflow-hidden outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring">
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-muted">
        <Image
          src={anime.thumbnail || "https://picsum.photos/seed/anime/300/400"}
          alt={anime.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
          priority={shouldPrioritize}
          loading={shouldPrioritize ? "eager" : "lazy"}
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-80" />
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1.5">
          {anime.status && (
            <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm pointer-events-none text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 shadow-none border-none">
              {anime.status}
            </Badge>
          )}
        </div>
        <div className="absolute top-2 right-2">
          {anime.rating > 0 && (
            <Badge className="bg-primary/90 text-primary-foreground pointer-events-none shadow-none text-xs font-bold font-mono">
              ★ {anime.rating}
            </Badge>
          )}
        </div>
        
        {/* Hover play button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-background/90 text-foreground shadow-xl backdrop-blur-sm transform translate-y-4 transition-transform duration-300 group-hover:translate-y-0">
            <Play weight="fill" className="h-5 w-5 ml-1" />
          </div>
        </div>
        
        {/* Episode pill */}
        {anime.episode && (
          <div className="absolute bottom-2 left-2 text-xs font-medium text-white bg-black/60 backdrop-blur-md px-2 py-1 rounded-sm">
            {anime.episode}
          </div>
        )}
      </div>
      
      <div className="flex flex-col gap-1">
        <h3 className="font-semibold leading-tight text-sm line-clamp-2" title={anime.title}>
          {anime.title}
        </h3>
        <p className="text-xs text-muted-foreground">{anime.type}</p>
      </div>
    </Link>
  );
}
