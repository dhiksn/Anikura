import Link from "next/link";
import { Suspense } from "react";
import { getAnimeList } from "@/lib/api";
import { AnimeCard } from "@/components/AnimeCard";
import { RevealStagger } from "@/components/RevealStagger";
import { AnimeFilterPanel } from "@/components/AnimeFilterPanel";
import { Sidebar } from "@/components/Sidebar";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CaretLeft, CaretRight } from "@phosphor-icons/react/dist/ssr";

export const revalidate = 300;

// Baca array param dari searchParams (support key[] dan key)
function getArr(sp: Record<string, string | string[] | undefined>, key: string): string[] {
  const v = sp[`${key}[]`] ?? sp[key];
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

function getStr(sp: Record<string, string | string[] | undefined>, key: string): string {
  const v = sp[key];
  return Array.isArray(v) ? v[0] : (v ?? "");
}

export default async function AnimeListPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await props.searchParams;

  const page     = parseInt(getStr(sp, "page") || "1", 10);
  const genre    = getArr(sp, "genre");
  const karakter = getArr(sp, "karakter");
  const season   = getArr(sp, "season");
  const status   = getStr(sp, "status");
  const tipe     = getStr(sp, "tipe");
  // "default" = standar (dari home filter), "" = belum dipilih = default ke "baru"
  const urutanRaw = getStr(sp, "urutan");
  const urutan    = urutanRaw === "default" ? "" : (urutanRaw || "baru");

  // Build pagination URL helper (pertahankan semua filter)
  const buildPageUrl = (p: number) => {
    const params = new URLSearchParams();
    genre.forEach((g)    => params.append("genre[]", g));
    karakter.forEach((k) => params.append("karakter[]", k));
    season.forEach((s)   => params.append("season[]", s));
    if (status) params.set("status", status);
    if (tipe)   params.set("tipe", tipe);
    if (urutan) params.set("urutan", urutan);
    params.set("page", String(p));
    return `/anime-list?${params.toString()}`;
  };

  let results: any = null;
  let error: string | null = null;

  try {
    results = await getAnimeList({ page, genre, karakter, season, status, tipe, urutan });
  } catch (err: any) {
    error = err.response?.data?.error?.message || "Gagal memuat daftar anime.";
  }

  // initialParams untuk filter panel (supaya state filter terbaca dari URL)
  const initialParams: Record<string, string | string[]> = {
    "genre[]":    genre,
    "karakter[]": karakter,
    "season[]":   season,
    status, tipe,
    urutan: urutanRaw, // kirim nilai asli agar AnimeFilterPanel bisa konversi sendiri
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-12 flex flex-col gap-8">

      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-border/40 pb-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">Beranda</Link>
          <span>/</span>
          <span className="text-foreground">Daftar Anime</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">Daftar Anime</h1>
        <p className="text-muted-foreground text-lg">
          Temukan anime sesuai selera kamu dengan filter genre, karakter, status, dan banyak lagi.
        </p>
      </div>

      {/* Filter + Sidebar + Hasil — layout utama */}
      <div className="flex flex-col lg:flex-row gap-10">

        {/* Kiri: Filter + Hasil */}
        <div className="flex-1 min-w-0 flex flex-col gap-8">

          {/* Filter Panel */}
          <Suspense fallback={null}>
            <AnimeFilterPanel initialParams={initialParams} />
          </Suspense>

          {/* Hasil */}
          {error ? (
            <div className="flex flex-col items-center justify-center min-h-[30vh] text-center">
              <p className="text-muted-foreground mb-4">{error}</p>
              <Link href="/anime-list" className={buttonVariants({ variant: "outline" })}>Reset</Link>
            </div>
          ) : results?.data?.length > 0 ? (
            <div className="flex flex-col gap-12">
              <RevealStagger className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {results.data.map((anime: any, i: number) => (
                  <AnimeCard key={i} anime={anime} index={i} />
                ))}
              </RevealStagger>

              {results.pagination && (results.pagination.hasNextPage || results.pagination.hasPrevPage) && (
                <div className="flex items-center justify-center gap-4 pt-8 border-t border-border/40">
                  {results.pagination.hasPrevPage ? (
                    <Link href={buildPageUrl(results.pagination.prevPage)} className={buttonVariants({ variant: "outline" })}>
                      <CaretLeft className="mr-2 h-4 w-4" /> Sebelumnya
                    </Link>
                  ) : (
                    <span className={cn(buttonVariants({ variant: "outline" }), "opacity-50 cursor-not-allowed")}>
                      <CaretLeft className="mr-2 h-4 w-4" /> Sebelumnya
                    </span>
                  )}
                  <span className="text-sm font-medium text-muted-foreground">
                    Halaman {results.pagination.currentPage}
                  </span>
                  {results.pagination.hasNextPage ? (
                    <Link href={buildPageUrl(results.pagination.nextPage)} className={buttonVariants({ variant: "outline" })}>
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
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground text-center gap-3">
              <p>Tidak ada anime yang sesuai dengan kriteria ini.</p>
              <Link href="/anime-list" className={buttonVariants({ variant: "outline", size: "sm" })}>
                Reset Filter
              </Link>
            </div>
          )}
        </div>

        {/* Kanan: Sidebar */}
        <div className="w-full lg:w-80 xl:w-96 shrink-0">
          <Sidebar hideKarakter/>
        </div>

      </div>
    </div>
  );
}
