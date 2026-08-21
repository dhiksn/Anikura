import Link from "next/link";
import { getAnimeByGenre } from "@/lib/api";
import { AnimeCard } from "@/components/AnimeCard";
import { RevealStagger } from "@/components/RevealStagger";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CaretLeft, CaretRight } from "@phosphor-icons/react/dist/ssr";

export const revalidate = 300;

export default async function GenreDetailPage(
  props: {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
  }
) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const page = typeof searchParams.page === "string" ? parseInt(searchParams.page, 10) : 1;

  let results: any = null;
  let error = null;

  try {
    results = await getAnimeByGenre(params.slug, page);
  } catch (err: any) {
    error = err.response?.data?.error?.message || "Gagal memuat anime untuk genre ini.";
  }

  if (error || !results || !results.genre) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Tidak Ditemukan</h1>
        <p className="text-muted-foreground mb-8">{error || "Genre tidak ditemukan."}</p>
        <Link href="/genre" className={buttonVariants({ variant: "default" })}>
          Kembali ke Genre
        </Link>
      </div>
    );
  }

  const { genre, data, pagination } = results;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-12 flex flex-col gap-12">
      <div className="flex flex-col gap-4 border-b border-border/40 pb-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Link href="/genre" className="hover:text-foreground transition-colors">Genre</Link>
          <span>/</span>
          <span className="text-foreground">{genre.name}</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">{genre.name} Anime</h1>
        <p className="text-muted-foreground text-lg max-w-[60ch]">
          Jelajahi semua {genre.name.toLowerCase()} anime.
        </p>
      </div>

      {data?.length > 0 ? (
        <div className="flex flex-col gap-12">
          <RevealStagger className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {data.map((anime: any, i: number) => (
              <AnimeCard key={i} anime={anime} index={i} />
            ))}
          </RevealStagger>
          
          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 pt-8 border-t border-border/40">
              {pagination.hasPrevPage ? (
                <Link href={`/genre/${params.slug}?page=${pagination.currentPage - 1}`} className={buttonVariants({ variant: "outline" })}>
                  <CaretLeft className="mr-2 h-4 w-4" /> Sebelumnya
                </Link>
              ) : (
                <span className={cn(buttonVariants({ variant: "outline" }), "opacity-50 cursor-not-allowed")}><CaretLeft className="mr-2 h-4 w-4" /> Sebelumnya</span>
              )}
              
              <span className="text-sm font-medium text-muted-foreground">
                Halaman {pagination.currentPage} dari {pagination.totalPages}
              </span>
              
              {pagination.hasNextPage ? (
                <Link href={`/genre/${params.slug}?page=${pagination.currentPage + 1}`} className={buttonVariants({ variant: "outline" })}>
                  Berikutnya <CaretRight className="ml-2 h-4 w-4" />
                </Link>
              ) : (
                <span className={cn(buttonVariants({ variant: "outline" }), "opacity-50 cursor-not-allowed")}>Berikutnya <CaretRight className="ml-2 h-4 w-4" /></span>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center h-64 text-muted-foreground">
          <p>Tidak ada anime untuk genre ini.</p>
        </div>
      )}
    </div>
  );
}
