import Link from "next/link";
import { getSidebar } from "@/lib/api";
import { SidebarFilterPanel } from "@/components/SidebarFilterPanel";

export async function Sidebar({ hideKarakter = false, showFilter = false }: { hideKarakter?: boolean; showFilter?: boolean } = {}) {
  let data: any = null;

  try {
    const res = await getSidebar();
    data = res.data;
  } catch {
    return null;
  }

  if (!data) return null;

  const { rekomendasi, karakter } = data;

  return (
    <aside className="flex flex-col gap-6 w-full">

      {/* Filter Pencarian Kriteria — hanya tampil jika showFilter=true */}
      {showFilter && <SidebarFilterPanel />}

      {/* Link Rekomendasi */}
      {rekomendasi?.length > 0 && (
        <div className="rounded-xl border border-border/50 bg-muted/20 overflow-hidden">
          <div className="px-4 py-3 border-b border-border/40 bg-muted/30">
            <h3 className="text-sm font-semibold text-foreground">≡ Link Rekomendasi</h3>
          </div>
          <div className="flex flex-col divide-y divide-border/30">
            {rekomendasi.map((item: any, i: number) => (
              <Link
                key={i}
                href={toInternalUrl(item.url)}
                className="px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
              >
                》 {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Tipe Karakter (MC) */}
      {!hideKarakter && karakter?.length > 0 && (
        <div className="rounded-xl border border-border/50 bg-muted/20 overflow-hidden">
          <div className="px-4 py-3 border-b border-border/40 bg-muted/30">
            <h3 className="text-sm font-semibold text-foreground">Tipe Karakter (MC)</h3>
          </div>
          <div className="p-3 grid grid-cols-3 gap-px bg-border/30">
            {karakter.map((char: any, i: number) => (
              <Link
                key={i}
                href={`/character/${char.slug}`}
                className="bg-background/80 hover:bg-muted/60 transition-colors text-center px-1 py-2 text-xs text-foreground/80 hover:text-foreground"
                title={char.count ? `${char.count} anime` : undefined}
              >
                {char.name}
              </Link>
            ))}
          </div>
        </div>
      )}

    </aside>
  );
}

/**
 * Konversi URL absolut ANIKURA.love ke URL internal client.
 * Mis. https://ANIKURA.love/karakter/overpower/ → /character/overpower
 */
function toInternalUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const path   = parsed.pathname;

    if (path.startsWith("/karakter/"))  return `/character/${path.replace("/karakter/", "").replace(/\/$/, "")}`;
    if (path.startsWith("/genre/"))     return `/genre/${path.replace("/genre/", "").replace(/\/$/, "")}`;
    if (path.startsWith("/studio/"))    return `/studio/${path.replace("/studio/", "").replace(/\/$/, "")}`;
    if (path.startsWith("/penulis/"))   return `/author/${path.replace("/penulis/", "").replace(/\/$/, "")}`;
    if (path.startsWith("/pencarian/")) return `/anime-list${parsed.search}`;
    if (path.startsWith("/tipe-karakter/")) return `/character`;

    return url;
  } catch {
    return url;
  }
}
