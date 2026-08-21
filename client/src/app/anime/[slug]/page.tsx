import Image from "next/image";
import Link from "next/link";
import { getAnimeDetail } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Play, Calendar, Star, Clock, Info, BookmarkSimple, ShareNetwork, MonitorPlay } from "@phosphor-icons/react/dist/ssr";
import { RevealStagger } from "@/components/RevealStagger";
import { AnimeCard } from "@/components/AnimeCard";
import { cn } from "@/lib/utils";

export const revalidate = 3600;

export default async function AnimeDetailPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const url = `https://animasu.love/anime/${params.slug}/`;

  let data: any = null;
  let error = null;

  try {
    const res = await getAnimeDetail(url);
    data = res.data;
  } catch (err: any) {
    error = err.response?.data?.error?.message || "Gagal memuat detail anime.";
  }

  if (error || !data?.info) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Anime Tidak Ditemukan</h1>
        <p className="text-muted-foreground mb-8">{error || "Anime yang kamu cari tidak ditemukan."}</p>
        <Link href="/" className={buttonVariants({ variant: "default" })}>
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  const { info, genres, studios, episodes, relations, recommendations } = data;
  const firstEpisode = episodes?.length > 0 ? episodes[episodes.length - 1] : null;

  return (
    <div className="min-h-screen bg-background pb-24 relative selection:bg-primary/30">
      
      {/* Subtle top glow instead of full blur */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[400px] bg-primary/10 blur-[120px] rounded-full pointer-events-none opacity-50" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl pt-8 md:pt-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-12 xl:gap-20">
          
          {/* LEFT COLUMN: Sticky Poster & Actions */}
          <div className="flex flex-col gap-6 relative">
            <div className="sticky top-28 flex flex-col gap-6 animate-in fade-in slide-in-from-left-8 duration-700">
              
              {/* Poster */}
              <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-border/50 bg-muted">
                <Image
                  src={info.thumbnail || "https://picsum.photos/seed/anime/400/600"}
                  alt={info.title}
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                {info.rating > 0 && (
                  <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                    <span className="bg-background/95 backdrop-blur text-foreground font-bold px-3 py-1.5 rounded-lg text-sm flex items-center gap-1.5 shadow-lg">
                      <Star weight="fill" className="text-yellow-500" /> {info.rating}
                    </span>
                    {info.status && (
                      <span className="bg-primary text-primary-foreground font-bold px-3 py-1.5 rounded-lg text-xs uppercase tracking-wider shadow-lg">
                        {info.status}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Primary Actions */}
              <div className="flex flex-col gap-3">
                {firstEpisode ? (
                  <Link 
                    href={`/watch/${new URL(firstEpisode.url).pathname.replace(/\/$/, "").split("/").pop()}`}
                    className={cn(buttonVariants({ size: "lg" }), "w-full h-14 rounded-xl font-bold text-base shadow-lg hover:shadow-primary/25 transition-all")}
                  >
                    <Play weight="fill" className="mr-2 h-5 w-5" /> Mulai Menonton
                  </Link>
                ) : (
                  <button disabled className={cn(buttonVariants({ size: "lg", variant: "secondary" }), "w-full h-14 rounded-xl font-bold text-base opacity-50 cursor-not-allowed")}>
                    Belum Tersedia
                  </button>
                )}
              </div>

              {/* Quick Info Block */}
              <div className="bg-card/40 border border-border/50 rounded-2xl p-5 flex flex-col gap-4 text-sm backdrop-blur-sm">
                <div className="flex justify-between items-center border-b border-border/40 pb-3">
                  <span className="text-muted-foreground flex items-center gap-2"><MonitorPlay className="w-4 h-4"/> Tipe</span>
                  <span className="font-semibold">{info.type || "-"}</span>
                </div>
                <div className="flex justify-between items-center border-b border-border/40 pb-3">
                  <span className="text-muted-foreground flex items-center gap-2"><Clock className="w-4 h-4"/> Durasi</span>
                  <span className="font-semibold">{info.duration || "-"}</span>
                </div>
                <div className="flex justify-between items-center border-b border-border/40 pb-3">
                  <span className="text-muted-foreground flex items-center gap-2"><Calendar className="w-4 h-4"/> Musim</span>
                  <span className="font-semibold">{info.season || "-"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground flex items-center gap-2"><Info className="w-4 h-4"/> Studio</span>
                  <span className="font-semibold text-right">{studios?.length > 0 ? studios[0].name : "-"}</span>
                </div>
              </div>

            </div>
          </div>

          {/* RIGHT COLUMN: Content */}
          <div className="flex flex-col gap-12 lg:gap-16 pt-2 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150 fill-mode-both">
            
            {/* Header / Title Area */}
            <div className="flex flex-col gap-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-foreground">
                {info.title}
              </h1>
              
              {info.alternativeTitles?.length > 0 && (
                <p className="text-lg text-muted-foreground font-medium">
                  {info.alternativeTitles.join(", ")}
                </p>
              )}

              <div className="flex gap-2 flex-wrap">
                {genres?.map((genre: any) => (
                  <Link key={genre.slug} href={`/genre/${genre.slug}`}>
                    <Badge variant="secondary" className="bg-muted hover:bg-muted/80 text-foreground px-4 py-1.5 rounded-lg text-sm font-medium transition-colors">
                      {genre.name}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>

            {/* Synopsis */}
            {info.description && (
              <div className="flex flex-col gap-4">
                <h2 className="text-2xl font-bold tracking-tight">Sinopsis</h2>
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                  {info.description}
                </p>
              </div>
            )}

            {/* Episodes */}
            <div className="flex flex-col gap-6">
              <div className="flex items-end justify-between border-b border-border/40 pb-4">
                <h2 className="text-2xl font-bold tracking-tight">Episode</h2>
                <span className="text-muted-foreground font-medium bg-muted px-3 py-1 rounded-full text-sm">
                  Total: {episodes?.length || 0}
                </span>
              </div>

              {episodes?.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-[1px] bg-border/50 border border-border/50 rounded-2xl overflow-hidden shadow-sm">
                  {[...episodes].reverse().map((ep: any, i: number) => {
                    const epLabel = ep.episode || ep.title || (i + 1);
                    return (
                      <Link
                        key={i}
                        href={`/watch/${new URL(ep.url).pathname.replace(/\/$/, "").split("/").pop()}`}
                        className="group flex items-center justify-between p-4 bg-background/80 hover:bg-muted transition-colors"
                      >
                        <span className="font-semibold text-foreground/90 group-hover:text-primary transition-colors">
                          {String(epLabel).toLowerCase().includes('episode') ? epLabel : `Episode ${epLabel}`}
                        </span>
                        <Play weight="bold" className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center rounded-xl border border-dashed border-border/60 bg-muted/20">
                  <p className="text-muted-foreground">Belum ada episode yang tersedia.</p>
                </div>
              )}
            </div>

            {/* Recommendations */}
            {recommendations?.length > 0 && (
              <div className="flex flex-col gap-6 pb-12">
                <div className="border-b border-border/40 pb-4">
                  <h2 className="text-2xl font-bold tracking-tight">Saran Tontonan</h2>
                </div>
                <RevealStagger className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {recommendations.slice(0, 8).map((anime: any, i: number) => (
                    <AnimeCard key={i} anime={anime} index={i} />
                  ))}
                </RevealStagger>
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}
