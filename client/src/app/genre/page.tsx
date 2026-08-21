import Link from "next/link";
import { getGenres } from "@/lib/api";
import { RevealStagger } from "@/components/RevealStagger";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";

export const revalidate = 86400;

export default async function GenreListPage() {
  let genres: any = null;
  let error = null;

  try {
    const res = await getGenres();
    genres = res.data;
  } catch (err: any) {
    error = err.response?.data?.error?.message || "Gagal memuat genre.";
  }

  if (error || !genres) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Layanan Tidak Tersedia</h1>
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  // Sort genres alphabetically
  const sortedGenres = [...genres].sort((a: any, b: any) => a.name.localeCompare(b.name));

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl pt-8 pb-16 flex flex-col gap-12">
      
      {/* Editorial Header */}
      <div className="flex flex-col gap-3 max-w-3xl">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-[1.1]">
          Eksplorasi<br />
          <span className="text-muted-foreground">Kategori.</span>
        </h1>
        <p className="text-muted-foreground text-lg md:text-xl leading-relaxed max-w-[50ch]">
          Temukan lebih dari {genres.length} genre anime. Dari aksi memukau hingga cerita slice of life yang menenangkan.
        </p>
      </div>

      {/* Sleek List Grid */}
      <RevealStagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-0">
        {sortedGenres.map((genre: any, i: number) => (
          <Link
            key={genre.slug}
            href={`/genre/${genre.slug}`}
            className="group flex items-center justify-between py-6 border-b border-border/40 hover:border-primary transition-colors"
          >
            <span className="text-xl md:text-2xl font-medium tracking-tight text-foreground group-hover:translate-x-2 transition-transform duration-300">
              {genre.name}
            </span>
            <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
              <ArrowUpRight weight="bold" className="w-4 h-4" />
            </div>
          </Link>
        ))}
      </RevealStagger>

    </div>
  );
}
