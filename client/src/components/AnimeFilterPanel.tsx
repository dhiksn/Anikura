"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useState, useRef, useEffect } from "react";
import { MagnifyingGlass } from "@phosphor-icons/react";

// ─── Static filter options (dari /api/filter-options) ─────────────────────────

const GENRE_OPTIONS = [
  { value: "aksi", label: "Aksi" }, { value: "anak-anak", label: "Anak-Anak" },
  { value: "luar-angkasa", label: "Antariksa" }, { value: "avant-garde", label: "Avant Garde" },
  { value: "dementia", label: "Dimensia" }, { value: "donghua", label: "Donghua" },
  { value: "drama", label: "Drama" }, { value: "ecchi", label: "Ecchi" },
  { value: "fantasi", label: "Fantasi" }, { value: "fantasi-urban", label: "Fantasi Urban" },
  { value: "game", label: "Game" }, { value: "gourmet", label: "Gourmet" },
  { value: "harem", label: "Harem" }, { value: "horror", label: "Horror" },
  { value: "iblis", label: "Iblis" }, { value: "isekai", label: "Isekai" },
  { value: "josei", label: "Josei" }, { value: "suspense", label: "Ketegangan" },
  { value: "komedi", label: "Komedi" }, { value: "live-action", label: "Live Action" },
  { value: "makanan", label: "Makanan" }, { value: "martial-arts", label: "Martial Arts" },
  { value: "medical", label: "Medis" }, { value: "militer", label: "Militer" },
  { value: "misteri", label: "Misteri" }, { value: "mitologi", label: "Mitologi" },
  { value: "mobil", label: "Mobil" }, { value: "musik", label: "Musik" },
  { value: "olahraga", label: "Olahraga" }, { value: "parodi", label: "Parodi" },
  { value: "perang", label: "Perang" }, { value: "petualangan", label: "Petualangan" },
  { value: "polisi", label: "Polisi" }, { value: "politik", label: "Politik" },
  { value: "psikologis", label: "Psikologis" }, { value: "reincarnation", label: "Reinkarnasi" },
  { value: "mecha", label: "Robot" }, { value: "romansa", label: "Romansa" },
  { value: "samurai", label: "Samurai" }, { value: "sci-fi", label: "Sci-Fi" },
  { value: "seinen", label: "Seinen" }, { value: "sejarah", label: "Sejarah" },
  { value: "sekolahan", label: "Sekolahan" }, { value: "shoujo", label: "Shoujo" },
  { value: "shoujo-ai", label: "Shoujo Ai" }, { value: "shounen", label: "Shounen" },
  { value: "shounen-ai", label: "Shounen Ai" }, { value: "sihir", label: "Sihir" },
  { value: "slice-of-life", label: "Slice of Life" }, { value: "super-power", label: "Super Power" },
  { value: "supranatural", label: "Supranatural" }, { value: "thriller", label: "Thriller" },
  { value: "time-travel", label: "Time Travel" }, { value: "vampir", label: "Vampir" },
  { value: "wuxia", label: "Wuxia" }, { value: "yaoi", label: "Yaoi" },
];

const KARAKTER_OPTIONS = [
  { value: "ambisius", label: "Ambisi" }, { value: "anak-anak", label: "Anak-Anak" },
  { value: "anti-sosial", label: "Anti-Sosial" }, { value: "badass", label: "Badass" },
  { value: "berbisnis", label: "Berbisnis" }, { value: "berisik", label: "Berisik" },
  { value: "berjuang", label: "Berjuang" }, { value: "beruntung", label: "Beruntung" },
  { value: "blakblakan", label: "Blakblakan" }, { value: "bounty-hunter", label: "Bounty Hunter" },
  { value: "cerewet", label: "Cerewet" }, { value: "ceria", label: "Ceria" },
  { value: "ceroboh", label: "Ceroboh" }, { value: "perempuan", label: "Cewek" },
  { value: "couple", label: "Couple" }, { value: "laki-laki", label: "Cowok" },
  { value: "dewa", label: "Dewa" }, { value: "dikagumi", label: "Dikagumi" },
  { value: "disepelekan", label: "Disepelekan" }, { value: "ditakuti", label: "Ditakuti" },
  { value: "iblis", label: "Iblis" }, { value: "jenius", label: "Jenius" },
  { value: "kejam", label: "Kejam" }, { value: "legenda", label: "Legenda" },
  { value: "licik", label: "Licik" }, { value: "loli", label: "Loli" },
  { value: "mencolok", label: "Mencolok" }, { value: "menyebalkan", label: "Menyebalkan" },
  { value: "mesum", label: "Mesum" }, { value: "monster", label: "Monster" },
  { value: "narsis", label: "Narsis" }, { value: "optimis", label: "Optimis" },
  { value: "overpower", label: "Overpower" }, { value: "pemalas", label: "Pemalas" },
  { value: "pemalu", label: "Pemalu" }, { value: "pemarah", label: "Pemarah" },
  { value: "pemimpin", label: "Pemimpin" }, { value: "penakut", label: "Penakut" },
  { value: "pendendam", label: "Pendendam" }, { value: "pendiam", label: "Pendiam" },
  { value: "pesimis", label: "Pesimis" }, { value: "polos", label: "Polos" },
  { value: "semangat", label: "Semangat" }, { value: "setia", label: "Setia" },
  { value: "slengekan", label: "Slengekan" }, { value: "sopan", label: "Sopan" },
  { value: "suram", label: "Suram" }, { value: "terkutuk", label: "Terkutuk" },
  { value: "totalitas", label: "Totalitas" }, { value: "tsundere", label: "Tsundere" },
  { value: "vampir", label: "Vampir" }, { value: "yandere", label: "Yandere" },
  { value: "zero-to-hero", label: "Zero To Hero" },
];

const STATUS_OPTIONS = [
  { value: "", label: "Semua" },
  { value: "upcoming", label: "Segera Tayang" },
  { value: "ongoing", label: "Sedang Tayang" },
  { value: "completed", label: "Selesai Tayang" },
];

const TIPE_OPTIONS = [
  { value: "", label: "Semua" },
  { value: "TV", label: "Serial TV" },
  { value: "Live Action", label: "Live Action" },
  { value: "Movie", label: "Movie" },
  { value: "OVA", label: "OVA" },
  { value: "ONA", label: "ONA" },
  { value: "Special", label: "Spesial" },
  { value: "Music", label: "Musik" },
  { value: "Drama Jepang", label: "Drama Jepang" },
  { value: "Drama China", label: "Drama China" },
];

const URUTAN_OPTIONS = [
  { value: "", label: "Standar" },
  { value: "baru", label: "Rilis Terbaru" },
  { value: "lama", label: "Rilis Terlawas" },
  { value: "update", label: "Baru Diupdate" },
  { value: "publikasi", label: "Baru Ditambah" },
  { value: "populer", label: "Terpopuler" },
  { value: "rating", label: "Rating" },
  { value: "abjad", label: "Judul A→Z" },
  { value: "dari-z", label: "Judul Z→A" },
];

// ─── Helper — baca array param dari searchParams ───────────────────────────────
function getArrayParam(searchParams: URLSearchParams, key: string): string[] {
  const vals: string[] = [];
  searchParams.forEach((v, k) => {
    if (k === key || k === `${key}[]`) vals.push(v);
  });
  return vals;
}

// ─── Sub-komponen: Dropdown pill dengan checklist ─────────────────────────────
function MultiSelectDropdown({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (vals: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Tutup saat klik di luar
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const displayLabel = selected.length === 0
    ? `${label}: Semua`
    : `${label}: ${selected.length} dipilih`;

  const toggle = (val: string) => {
    if (selected.includes(val)) onChange(selected.filter((v) => v !== val));
    else onChange([...selected, val]);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 rounded-lg bg-muted/50 border border-border/50 px-4 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
      >
        <span className={selected.length ? "text-foreground" : "text-muted-foreground"}>{displayLabel}</span>
        <span className={`text-muted-foreground text-xs transition-transform duration-200 ${open ? "rotate-180" : ""}`}>▼</span>
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 z-50 w-full min-w-[220px]">
          <div className="rounded-xl border border-border/60 bg-background shadow-lg max-h-64 overflow-y-auto scrollbar-thin py-1">
            {options.map((opt) => (
              <label
                key={opt.value}
                className="flex items-center gap-2.5 px-3 py-1.5 text-sm cursor-pointer hover:bg-muted/60 transition-colors"
              >
                <input
                  type="checkbox"
                  className="accent-primary"
                  checked={selected.includes(opt.value)}
                  onChange={() => { toggle(opt.value); setOpen(false); }}
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SingleSelectDropdown({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (val: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const displayLabel = options.find((o) => o.value === value)?.label || "Semua";

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 rounded-lg bg-muted/50 border border-border/50 px-4 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
      >
        <span className={value ? "text-foreground" : "text-muted-foreground"}>
          {label}: {displayLabel}
        </span>
        <span className={`text-muted-foreground text-xs transition-transform duration-200 ${open ? "rotate-180" : ""}`}>▼</span>
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 z-50 w-full min-w-[200px]">
          <div className="rounded-xl border border-border/60 bg-background shadow-lg py-1">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={`flex w-full items-center px-3 py-1.5 text-sm hover:bg-muted/60 transition-colors ${
                  value === opt.value ? "text-primary font-semibold" : "text-foreground/80"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Filter Panel ────────────────────────────────────────────────────────
export function AnimeFilterPanel({
  initialParams,
}: {
  initialParams: Record<string, string | string[]>;
}) {
  const router      = useRouter();
  const pathname    = usePathname();
  const searchParams = useSearchParams();

  // Baca nilai awal dari URL
  const getArr = (key: string) => {
    const v = initialParams[key] || initialParams[`${key}[]`] || [];
    return Array.isArray(v) ? v : [v].filter(Boolean);
  };
  const getStr = (key: string) =>
    (Array.isArray(initialParams[key]) ? initialParams[key][0] : initialParams[key]) || "";

  const genre    = getArr("genre");
  const karakter = getArr("karakter");
  const status   = getStr("status");
  const tipe     = getStr("tipe");
  // "default" dari home filter = standar, kosong dari /anime-list langsung = rilis terbaru
  const urutanRaw = getStr("urutan");
  const urutan    = urutanRaw === "default" ? "" : (urutanRaw || "baru");

  const applyFilter = useCallback(
    (updates: Record<string, string | string[]>) => {
      const params = new URLSearchParams();

      const merged = { genre, karakter, status, tipe, urutan, ...updates };

      (merged.genre as string[]).forEach((g) => params.append("genre[]", g));
      (merged.karakter as string[]).forEach((k) => params.append("karakter[]", k));
      if (merged.status) params.set("status", merged.status as string);
      if (merged.tipe)   params.set("tipe",   merged.tipe   as string);
      params.set("urutan", (merged.urutan as string) || "default");

      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, genre, karakter, status, tipe, urutan]
  );

  const resetAll = () => router.push(`${pathname}?urutan=baru`);

  const hasFilter = genre.length || karakter.length || status || tipe || (urutan && urutan !== "baru");

  return (
    <div className="rounded-xl border border-border/50 bg-muted/20 p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-sm text-foreground/70 uppercase tracking-wider">
          Pencarian Sesuai Kriteria
        </h2>
      </div>

      {/* Filter grid — 2 kolom di md+ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <MultiSelectDropdown
          label="Genre"
          options={GENRE_OPTIONS}
          selected={genre}
          onChange={(v) => applyFilter({ genre: v })}
        />
        <MultiSelectDropdown
          label="Karakter"
          options={KARAKTER_OPTIONS}
          selected={karakter}
          onChange={(v) => applyFilter({ karakter: v })}
        />
        <SingleSelectDropdown
          label="Status"
          options={STATUS_OPTIONS}
          value={status}
          onChange={(v) => applyFilter({ status: v })}
        />
        <SingleSelectDropdown
          label="Tipe"
          options={TIPE_OPTIONS}
          value={tipe}
          onChange={(v) => applyFilter({ tipe: v })}
        />
        <SingleSelectDropdown
          label="Urutan"
          options={URUTAN_OPTIONS}
          value={urutan}
          onChange={(v) => applyFilter({ urutan: v })}
        />
        {hasFilter && (
          <button
            onClick={resetAll}
            className="flex items-center justify-center gap-1.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/30 text-xs font-medium transition-colors px-4 py-2.5"
          >
            ✕ Reset Filter
          </button>
        )}
      </div>
    </div>
  );
}
