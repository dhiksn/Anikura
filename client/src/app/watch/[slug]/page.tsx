import { getEpisode } from "@/lib/api";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { ArrowLeft, MonitorPlay } from "@phosphor-icons/react/dist/ssr";
import { VideoPlayer } from "./VideoPlayer";

export const revalidate = 0; // Don't cache video links as they might expire

const BASE_URL = process.env.NEXT_PUBLIC_SOURCE_BASE_URL || "https://animasu.love";

/** Extract last path segment from an animasu URL to use as watch slug */
function toWatchSlug(epUrl: string): string {
  try {
    return new URL(epUrl).pathname.replace(/\/$/, "").split("/").pop() || "";
  } catch {
    return "";
  }
}

export default async function WatchPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;

  // Reconstruct the full animasu.love episode URL from the slug
  const url = `${BASE_URL}/${slug}/`;

  let data: any = null;
  let error = null;

  try {
    const res = await getEpisode(url);
    data = res.data;
  } catch (err: any) {
    error = err.response?.data?.error?.message || "Gagal memuat episode.";
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Gagal Memuat</h1>
        <p className="text-muted-foreground mb-8">{error || "Terjadi kesalahan saat mengambil data episode."}</p>
        <Link href="/" className={buttonVariants({ variant: "default" })}>
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  const { title, animeUrl, navigation, defaultPlayer, servers, episodeList } = data;

  // Extract the anime slug to link back to the detail page
  // animeUrl is like: "https://animasu.love/anime/tensei-shitara-slime-datta-ken-season-4/"
  const animeSlugMatch = animeUrl?.match(/\/anime\/([^\/]+)/);
  const animeSlug = animeSlugMatch ? animeSlugMatch[1] : null;

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="container mx-auto px-4 max-w-7xl pt-2 md:pt-3 flex flex-col lg:flex-row gap-8">
        
        {/* Left Column: Player & Info */}
        <div className="flex-1 flex flex-col gap-6">
          
          {/* Back Button & Title */}
          <div className="flex items-center gap-4">
            <Link
              href={animeSlug ? `/anime/${animeSlug}` : "/"}
              className="shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-card hover:bg-muted border border-border/50 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-lg md:text-xl font-bold line-clamp-1">
              {title}
            </h1>
          </div>

          <VideoPlayer
            key={slug}
            title={title}
            defaultPlayer={defaultPlayer}
            servers={servers}
            navigation={navigation}
          />
          
          <div className="flex flex-col gap-2 p-5 bg-card border border-border/50 rounded-2xl">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <MonitorPlay className="w-5 h-5 text-primary" /> Sedang Menonton
            </h2>
            <p className="text-muted-foreground font-medium">{title}</p>
          </div>
        </div>

        {/* Right Column: Episode List */}
        <div className="w-full lg:w-[350px] shrink-0 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg">Daftar Episode</h3>
            <span className="text-xs font-semibold bg-muted px-2 py-1 rounded-md text-muted-foreground">
              {episodeList?.length || 0} EPS
            </span>
          </div>

          <div className="flex flex-col border border-border/50 rounded-2xl overflow-hidden bg-card/20 shadow-sm max-h-[600px] overflow-y-auto custom-scrollbar">
            {episodeList && [...episodeList].reverse().map((ep: any, i: number) => {
              const epSlug = toWatchSlug(ep.url);
              const isActive = epSlug === slug;
              const epLabel = ep.episode || ep.title || (i + 1);

              return (
                <Link
                  key={i}
                  href={`/watch/${epSlug}`}
                  className={`
                    group flex items-center justify-between p-4 border-b border-border/40 last:border-b-0 transition-colors
                    ${isActive ? 'bg-primary/10 border-l-2 border-l-primary' : 'bg-card/40 hover:bg-muted/80 border-l-2 border-l-transparent'}
                  `}
                >
                  <span className={`font-semibold ${isActive ? 'text-primary' : 'text-foreground/80 group-hover:text-foreground'}`}>
                    {String(epLabel).toLowerCase().includes('episode') ? epLabel : `Episode ${epLabel}`}
                  </span>
                  {isActive && (
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
