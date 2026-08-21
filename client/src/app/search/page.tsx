import Link from "next/link";
import { searchAnime } from "@/lib/api";
import { AnimeCard } from "@/components/AnimeCard";
import { RevealStagger } from "@/components/RevealStagger";
import { MagnifyingGlass, CaretLeft, CaretRight, XCircle } from "@phosphor-icons/react/dist/ssr";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const revalidate = 0;

export default async function SearchPage(
  props: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
  }
) {
  const searchParams = await props.searchParams;
  const q = typeof searchParams.q === "string" ? searchParams.q : "";
  const page = typeof searchParams.page === "string" ? parseInt(searchParams.page, 10) : 1;

  let results: any = null;
  let error = null;

  if (q.length >= 2) {
    try {
      results = await searchAnime(q, page);
    } catch (err: any) {
      error = err.response?.data?.error?.message || "Gagal mencari anime.";
    }
  }

  const buildUrl = (p = 1) => `/search?q=${encodeURIComponent(q)}&page=${p}`;
  const isSearching = q.length > 0;

  return (
    <div className="flex flex-col min-h-screen -mt-24">
      
      {/* Cinematic Hero Search Section */}
      <div className="relative pt-32 pb-16 md:pt-40 md:pb-24 border-b border-border/40 overflow-hidden bg-background">
        {/* Glow effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] max-w-3xl h-[200px] bg-primary/10 blur-[100px] rounded-[100%] pointer-events-none" />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl relative z-10 flex flex-col items-center text-center gap-8">
          <div className="flex flex-col gap-3">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground">
              Jelajahi Dunia Anime.
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl">
              Cari judul favoritmu dari ribuan koleksi yang tersedia.
            </p>
          </div>

          <form action="/search" className="w-full relative group">
            <MagnifyingGlass 
              weight="bold" 
              className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground/60 group-focus-within:text-primary transition-colors" 
            />
            
            <input
              key={q}
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Cari Naruto, One Piece, atau genre..."
              className="w-full bg-background/50 backdrop-blur-xl border-2 border-border/60 focus:border-primary focus:bg-background/80 shadow-2xl pl-16 pr-28 py-5 text-lg md:text-xl font-medium outline-none rounded-2xl transition-all placeholder:text-muted-foreground/50 [&::-webkit-search-cancel-button]:appearance-none"
              required
              minLength={2}
            />
            
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              {isSearching && (
                <Link href="/search" className="p-2 text-muted-foreground hover:text-foreground transition-colors">
                  <XCircle weight="fill" className="w-6 h-6" />
                </Link>
              )}
              <button 
                type="submit" 
                className="px-6 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 hover:scale-105 transition-all shadow-lg shadow-primary/20"
              >
                Cari
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-12 flex-1 flex flex-col">
        
        {/* Initial Empty State */}
        {!isSearching && (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground/50 min-h-[40vh]">
            <MagnifyingGlass weight="duotone" className="h-20 w-20 mb-6 opacity-20" />
            <p className="text-lg font-medium">Mulai mengetik untuk mencari anime.</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex-1 flex flex-col items-center justify-center text-center h-64 rounded-3xl bg-destructive/5 text-destructive border border-destructive/20 gap-4 min-h-[40vh]">
            <p className="font-semibold text-xl">{error}</p>
            <Link href="/search" className={buttonVariants({ variant: "destructive" })}>Reset Pencarian</Link>
          </div>
        )}

        {/* No Results State */}
        {!error && isSearching && results?.data?.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center h-64 rounded-3xl bg-muted/10 border border-dashed border-border/40 gap-4 min-h-[40vh]">
            <MagnifyingGlass className="h-12 w-12 text-muted-foreground/30" />
            <p className="text-xl text-muted-foreground">
              Anime <span className="text-foreground font-bold">&quot;{q}&quot;</span> tidak ditemukan.
            </p>
          </div>
        )}

        {/* Results Grid */}
        {!error && isSearching && results?.data?.length > 0 && (
          <div className="flex flex-col gap-10">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border/20 pb-4">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                Hasil Pencarian
              </h2>
              <span className="text-sm font-semibold px-4 py-1.5 rounded-full bg-primary/10 text-primary">
                {results.total} ditemukan
              </span>
            </div>
            
            <RevealStagger className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
              {results.data.map((anime: any, i: number) => {
                const animeForCard = {
                  ...anime,
                  episode: anime.episode || (anime.episodes ? `Ep ${anime.episodes}` : undefined)
                };
                return (
                  <AnimeCard key={i} anime={animeForCard} index={i} priority={i < 6} />
                );
              })}
            </RevealStagger>

            {/* Pagination */}
            {results.pagination && results.pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 pt-8 border-t border-border/40">
                {results.pagination.currentPage > 1 ? (
                  <Link href={buildUrl(results.pagination.currentPage - 1)} className={buttonVariants({ variant: "outline" })}>
                    <CaretLeft className="mr-2 h-4 w-4" /> Sebelumnya
                  </Link>
                ) : (
                  <span className={cn(buttonVariants({ variant: "outline" }), "opacity-50 cursor-not-allowed")}>
                    <CaretLeft className="mr-2 h-4 w-4" /> Sebelumnya
                  </span>
                )}

                <span className="text-sm font-medium text-muted-foreground">
                  Halaman {results.pagination.currentPage} dari {results.pagination.totalPages}
                </span>

                {results.pagination.currentPage < results.pagination.totalPages ? (
                  <Link href={buildUrl(results.pagination.currentPage + 1)} className={buttonVariants({ variant: "outline" })}>
                    Berikutnya <CaretRight className="ml-2 h-4 w-4" />
                  </Link>
                ) : (
                  <span className={cn(buttonVariants({ variant: "outline" }), "opacity-50 cursor-not-allowed")}>
                    Berikutnya <CaretRight className="ml-2 h-4 w-4" />
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
