import Link from "next/link";
import { getCharacters } from "@/lib/api";
import { RevealStagger } from "@/components/RevealStagger";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";

export const revalidate = 3600;

export default async function CharacterPage() {
  let data: any = null;
  let error: string | null = null;

  try {
    data = await getCharacters();
  } catch (err: any) {
    error = err.response?.data?.error?.message || "Gagal memuat daftar tipe karakter.";
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Gagal Memuat</h1>
        <p className="text-muted-foreground mb-8">{error}</p>
        <Link href="/" className="inline-flex items-center px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium">
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  const characters: any[] = data?.data || [];
  
  // Sort characters alphabetically
  const sortedCharacters = [...characters].sort((a: any, b: any) => a.name.localeCompare(b.name));

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl pt-8 pb-16 flex flex-col gap-12">
      
      {/* Editorial Header (Konsisten dengan Genre) */}
      <div className="flex flex-col gap-3 max-w-3xl">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-[1.1]">
          Katalog<br />
          <span className="text-muted-foreground">Karakter.</span>
        </h1>
        <p className="text-muted-foreground text-lg md:text-xl leading-relaxed max-w-[50ch]">
          Temukan anime berdasarkan tipe kepribadian (tropes) karakter utamanya. Mulai dari pahlawan overpower hingga tsundere sejati.
        </p>
      </div>

      {/* Sleek List Grid (Persis seperti Genre page yang kamu suka!) */}
      <RevealStagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-0">
        {sortedCharacters.map((char: any) => (
          <Link
            key={char.slug}
            href={`/character/${char.slug}`}
            className="group flex items-center justify-between py-6 border-b border-border/40 hover:border-primary transition-colors"
          >
            <span className="text-xl md:text-2xl font-medium tracking-tight text-foreground group-hover:translate-x-2 transition-transform duration-300">
              {char.name}
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
