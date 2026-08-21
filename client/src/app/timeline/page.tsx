import Link from "next/link";
import { getTimeline } from "@/lib/api";
import { AnimeCard } from "@/components/AnimeCard";
import { RevealStagger } from "@/components/RevealStagger";
import { Sidebar } from "@/components/Sidebar";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CaretLeft, CaretRight } from "@phosphor-icons/react/dist/ssr";

export const revalidate = 300;

export default async function TimelinePage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const page = typeof searchParams.page === "string" ? parseInt(searchParams.page, 10) : 1;

  let results: any = null;
  let error: string | null = null;

  try {
    results = await getTimeline(page);
  } catch (err: any) {
    error = err.response?.data?.error?.message || "Gagal memuat timeline anime.";
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-12 flex flex-col gap-8">

      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-border/40 pb-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">Beranda</Link>
          <span>/</span>
          <span className="text-foreground">Timeline Rilis</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">Timeline Rilis 📅</h1>
        <p className="text-muted-foreground text-lg">
          Anime diurutkan dari yang paling baru rilis hingga yang paling lama.
        </p>
      </div>

      {/* Konten + Sidebar */}
      <div className="flex flex-col lg:flex-row gap-10">

        {/* Daftar */}
        <div className="flex-1 min-w-0 flex flex-col gap-8">
          {error ? (
            <div className="flex flex-col items-center justify-center h-40 text-center text-muted-foreground gap-3">
              <p>{error}</p>
              <Link href="/timeline" className={buttonVariants({ variant: "outline", size: "sm" })}>Coba Lagi</Link>
            </div>
          ) : results?.data?.length > 0 ? (
            <div className="flex flex-col gap-8">
              <RevealStagger className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {results.data.map((anime: any, i: number) => (
                  <AnimeCard key={i} anime={anime} index={i} />
                ))}
              </RevealStagger>

              {results.pagination && (results.pagination.hasNextPage || results.pagination.hasPrevPage) && (
                <div className="flex items-center justify-center gap-4 pt-6 border-t border-border/40">
                  {results.pagination.hasPrevPage ? (
                    <Link href={`/timeline?page=${results.pagination.prevPage}`} className={buttonVariants({ variant: "outline" })}>
                      <CaretLeft className="mr-2 h-4 w-4" /> Sebelumnya
                    </Link>
                  ) : (
                    <span className={cn(buttonVariants({ variant: "outline" }), "opacity-50 cursor-not-allowed")}>
                      <CaretLeft className="mr-2 h-4 w-4" /> Sebelumnya
                    </span>
                  )}
                  <span className="text-sm font-medium text-muted-foreground">Halaman {page}</span>
                  {results.pagination.hasNextPage ? (
                    <Link href={`/timeline?page=${results.pagination.nextPage}`} className={buttonVariants({ variant: "outline" })}>
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
          ) : (
            <div className="flex items-center justify-center h-40 text-muted-foreground">
              <p>Tidak ada data.</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-80 xl:w-96 shrink-0">
          <Sidebar hideKarakter />
        </div>

      </div>
    </div>
  );
}
