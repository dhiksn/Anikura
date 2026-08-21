import Link from "next/link";
import { getDaftarAnime } from "@/lib/api";
import { Sidebar } from "@/components/Sidebar";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CaretLeft, CaretRight, Hash } from "@phosphor-icons/react/dist/ssr";
import { RevealStagger } from "@/components/RevealStagger";
import { AnimeCard } from "@/components/AnimeCard";

export const revalidate = 3600;

export default async function DaftarAnimePage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const show = typeof searchParams.show === "string" ? searchParams.show.toUpperCase() : "";
  const page = typeof searchParams.page === "string" ? parseInt(searchParams.page, 10) : 1;

  let results: any = null;
  let error: string | null = null;

  try {
    results = await getDaftarAnime({ show, page });
  } catch (err: any) {
    error = err.response?.data?.error?.message || "Gagal memuat daftar anime.";
  }

  const buildUrl = (s: string, p = 1) => {
    const q = new URLSearchParams();
    if (s) q.set("show", s);
    if (p > 1) q.set("page", String(p));
    return `/daftar-anime${q.toString() ? `?${q.toString()}` : ""}`;
  };

  const letters = results?.letters || "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-12 flex flex-col gap-10">

      {/* Cinematic Header */}
      <div className="flex flex-col gap-4 border-b border-border/40 pb-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Link href="/" className="hover:text-foreground transition-colors">Beranda</Link>
          <span>/</span>
          <span className="text-foreground">Daftar Anime A–Z</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">Daftar Anime A–Z</h1>
        <div className="flex items-center gap-4">
          <p className="text-muted-foreground text-lg max-w-[60ch]">
            Eksplorasi seluruh koleksi anime berdasarkan abjad.
          </p>
          {results?.stats && (
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold">
              {results.stats}
            </span>
          )}
        </div>
      </div>

      {/* Alphabet Filter (Fit 1 Line) */}
      <div className="border-b border-border/20 pb-6">
        <div className="flex w-full gap-0.5 sm:gap-1 md:gap-1.5 lg:gap-2">
          {letters.map((letter: string) => {
            const isSymbol = letter.length > 1; // Sometimes it's '0-9' or similar
            const display = isSymbol ? <Hash weight="bold" className="w-3 h-3 sm:w-4 sm:h-4" /> : letter;
            return (
              <Link
                key={letter}
                href={buildUrl(letter)}
                className={cn(
                  "flex-1 flex items-center justify-center py-1.5 sm:py-2 rounded-sm sm:rounded-md font-bold transition-all text-[9px] sm:text-xs md:text-sm",
                  show === letter
                    ? "bg-primary text-primary-foreground shadow-sm scale-110"
                    : "bg-muted/40 border border-border/50 text-muted-foreground hover:bg-muted hover:text-foreground hover:border-border/80 hover:-translate-y-0.5"
                )}
              >
                {display}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main Content & Sidebar */}
      <div className="flex flex-col lg:flex-row gap-10">
        
        {/* Grid Column */}
        <div className="flex-1 min-w-0 flex flex-col gap-8">
          
          {error && (
            <div className="flex flex-col items-center justify-center h-48 rounded-2xl bg-destructive/5 text-destructive text-center gap-4 border border-destructive/20">
              <p className="font-medium">{error}</p>
              <Link href="/daftar-anime" className={buttonVariants({ variant: "destructive", size: "sm" })}>Reset Filter</Link>
            </div>
          )}

          {!error && results?.data?.length === 0 && (
            <div className="flex items-center justify-center h-48 rounded-2xl bg-muted/20 border border-dashed border-border/60 text-muted-foreground">
              <p>Tidak ada anime yang berawalan dari huruf &quot;<span className="font-bold text-foreground">{show}</span>&quot;.</p>
            </div>
          )}

          {!error && results?.data?.length > 0 && (
            <RevealStagger className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {results.data.map((anime: any, i: number) => {
                // Map 'episodes' to 'episode' so AnimeCard can render it
                const animeForCard = {
                  ...anime,
                  episode: anime.episode || (anime.episodes ? `Ep ${anime.episodes}` : undefined)
                };
                return (
                  <AnimeCard key={i} anime={animeForCard} index={i} priority={i < 8} />
                );
              })}
            </RevealStagger>
          )}

          {/* Pagination */}
          {!error && results?.pagination && results.pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-8 pb-4 border-t border-border/40 mt-4">
              {results.pagination.currentPage > 1 ? (
                <Link href={buildUrl(show, results.pagination.currentPage - 1)} className={buttonVariants({ variant: "outline" })}>
                  <CaretLeft className="mr-2 h-4 w-4" /> Sebelumnya
                </Link>
              ) : (
                <span className={cn(buttonVariants({ variant: "outline" }), "opacity-50 cursor-not-allowed")}>
                  <CaretLeft className="mr-2 h-4 w-4" /> Sebelumnya
                </span>
              )}
              
              <span className="text-sm font-medium text-muted-foreground px-4 py-2 rounded-lg bg-muted/30">
                Halaman {results.pagination.currentPage} / {results.pagination.totalPages || "?"}
              </span>
              
              {results.pagination.currentPage < results.pagination.totalPages ? (
                <Link href={buildUrl(show, results.pagination.currentPage + 1)} className={buttonVariants({ variant: "outline" })}>
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

        {/* Sidebar */}
        <div className="w-full lg:w-80 xl:w-96 shrink-0">
          <Sidebar hideKarakter/>
        </div>

      </div>
    </div>
  );
}
