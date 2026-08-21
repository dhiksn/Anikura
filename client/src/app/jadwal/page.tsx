import Link from "next/link";
import { getSchedule } from "@/lib/api";
import { AnimeCard } from "@/components/AnimeCard";
import { RevealStagger } from "@/components/RevealStagger";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const revalidate = 3600;

const DAY_ORDER = ["Senin", "Selasa", "Rabu", "Kamis", "Jum'at", "Sabtu", "Minggu", "Update Acak"];

function getTodayLabel(): string {
  const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jum'at", "Sabtu"];
  return days[new Date().getDay()];
}

export default async function JadwalPage(
  props: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
  }
) {
  const searchParams = await props.searchParams;
  const today = getTodayLabel();
  
  // Default to today if no day is selected in query, but if today is not in DAY_ORDER, fallback
  let selectedDay = typeof searchParams.day === "string" ? searchParams.day : today;
  if (!DAY_ORDER.includes(selectedDay)) {
    selectedDay = DAY_ORDER[0];
  }

  let schedule: Record<string, any[]> = {};
  let error: string | null = null;

  try {
    const res = await getSchedule();
    schedule = res.data?.schedule || res.schedule || {};
  } catch (err: any) {
    error = err.response?.data?.error?.message || "Gagal memuat jadwal anime.";
  }

  const currentAnimeList = schedule[selectedDay] || [];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-12 flex flex-col gap-10">
      
      {/* Cinematic Header */}
      <div className="flex flex-col gap-4 border-b border-border/40 pb-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Link href="/" className="hover:text-foreground transition-colors">Beranda</Link>
          <span>/</span>
          <span className="text-foreground">Jadwal</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">Jadwal Rilis</h1>
        <p className="text-muted-foreground text-lg max-w-[60ch]">
          Temukan anime favoritmu yang tayang setiap harinya. Jadwal ini otomatis diperbarui mengikuti waktu rilis.
        </p>
      </div>

      {error ? (
        <div className="flex items-center justify-center h-40 text-destructive font-medium bg-destructive/10 rounded-xl">
          <p>{error}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-10">
          
          {/* Day Navigation Pills */}
          <div className="relative">
            <div className="flex overflow-x-auto pb-4 -mb-4 gap-2 snap-x [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {DAY_ORDER.map((day) => {
                const isActive = day === selectedDay;
                const isToday = day === today;
                
                return (
                  <Link
                    key={day}
                    href={`/jadwal?day=${day}`}
                    className={cn(
                      buttonVariants({ variant: isActive ? "default" : "outline", size: "lg" }),
                      "rounded-full snap-start whitespace-nowrap transition-all duration-300",
                      isActive ? "shadow-md" : "hover:border-primary/50"
                    )}
                  >
                    {day}
                    {isToday && (
                      <span className={cn(
                        "ml-2 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold",
                        isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-primary/10 text-primary"
                      )}>
                        Hari ini
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
            {/* Gradient mask for scroll indication on right side (mobile) */}
            <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-background to-transparent pointer-events-none md:hidden" />
          </div>

          {/* Anime Grid for Selected Day */}
          <div className="flex flex-col gap-6 min-h-[40vh]">
            <div className="flex items-end justify-between">
              <h2 className="text-2xl font-semibold tracking-tight flex items-center gap-3">
                {selectedDay}
                <span className="text-sm font-normal text-muted-foreground bg-muted px-2.5 py-0.5 rounded-full">
                  {currentAnimeList.length} Anime
                </span>
              </h2>
            </div>

            {currentAnimeList.length > 0 ? (
              <RevealStagger className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
                {currentAnimeList.map((anime: any, i: number) => (
                  <AnimeCard key={i} anime={anime} priority={i < 6} />
                ))}
              </RevealStagger>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 border border-dashed border-border/60 rounded-xl text-muted-foreground bg-muted/20">
                <p>Tidak ada anime yang tayang pada hari {selectedDay}.</p>
              </div>
            )}
          </div>
          
        </div>
      )}
    </div>
  );
}
