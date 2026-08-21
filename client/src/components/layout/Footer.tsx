import Link from "next/link";
import { PlayCircle } from "@phosphor-icons/react/dist/ssr";

export function Footer() {
  return (
    <footer className="border-t border-border/40 mt-auto">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <PlayCircle weight="fill" className="text-primary text-2xl" />
              <span className="font-sans font-bold tracking-tight text-lg">ANIKURA</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-[40ch]">
              Temukan dan tonton anime terbaru. Frontend tidak resmi untuk animasu.love yang dibangun dengan Next.js dan shadcn/ui.
            </p>
          </div>
          <div>
            <h3 className="font-medium mb-4 text-sm">Navigasi</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/" className="hover:text-foreground transition-colors">Beranda</Link></li>
              <li><Link href="/genre" className="hover:text-foreground transition-colors">Genre</Link></li>
              <li><Link href="/search" className="hover:text-foreground transition-colors">Cari</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-4 text-sm">Legal</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><span className="cursor-not-allowed">Syarat Layanan</span></li>
              <li><span className="cursor-not-allowed">Kebijakan Privasi</span></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} ANIKURA Web. Hak cipta dilindungi.</p>
        </div>
      </div>
    </footer>
  );
}
