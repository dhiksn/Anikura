"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useEffect, useCallback } from "react";
import { MagnifyingGlass } from "@phosphor-icons/react";

// ─── Options ──────────────────────────────────────────────────────────────────

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

// ─── Reusable dropdown ────────────────────────────────────────────────────────

function MultiSelect({ label, options, selected, onChange }: {
  label: string;
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (v: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const display = selected.length === 0 ? `${label}: Semua` : `${label}: ${selected.length} dipilih`;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex w-full items-center justify-between gap-2 rounded-md bg-muted/40 border border-border/50 px-3 py-2 text-xs font-medium hover:bg-muted transition-colors"
      >
        <span className={selected.length ? "text-foreground" : "text-muted-foreground"}>{display}</span>
        <span className={`text-muted-foreground text-[10px] transition-transform ${open ? "rotate-180" : ""}`}>▼</span>
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 z-50 w-full">
          <div className="rounded-lg border border-border/60 bg-background shadow-lg max-h-48 overflow-y-auto scrollbar-thin py-1">
            {options.map(opt => (
              <label key={opt.value} className="flex items-center gap-2 px-3 py-1.5 text-xs cursor-pointer hover:bg-muted/60">
                <input
                  type="checkbox"
                  className="accent-primary"
                  checked={selected.includes(opt.value)}
                  onChange={() => {
                    if (selected.includes(opt.value)) onChange(selected.filter(v => v !== opt.value));
                    else onChange([...selected, opt.value]);
                    setOpen(false);
                  }}
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SingleSelect({ label, options, value, onChange }: {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const display = options.find(o => o.value === value)?.label || "Semua";

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex w-full items-center justify-between gap-2 rounded-md bg-muted/40 border border-border/50 px-3 py-2 text-xs font-medium hover:bg-muted transition-colors"
      >
        <span className={value ? "text-foreground" : "text-muted-foreground"}>{label}: {display}</span>
        <span className={`text-muted-foreground text-[10px] transition-transform ${open ? "rotate-180" : ""}`}>▼</span>
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 z-50 w-full">
          <div className="rounded-lg border border-border/60 bg-background shadow-lg py-1">
            {options.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={`flex w-full px-3 py-1.5 text-xs hover:bg-muted/60 transition-colors ${value === opt.value ? "text-primary font-semibold" : "text-foreground/80"}`}
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

// ─── Main ─────────────────────────────────────────────────────────────────────

export function SidebarFilterPanel() {
  const router = useRouter();

  const [genre,    setGenre]    = useState<string[]>([]);
  const [karakter, setKarakter] = useState<string[]>([]);
  const [status,   setStatus]   = useState("");
  const [tipe,     setTipe]     = useState("");
  const [urutan,   setUrutan]   = useState("");

  const handleSearch = useCallback(() => {
    const params = new URLSearchParams();
    genre.forEach(g    => params.append("genre[]", g));
    karakter.forEach(k => params.append("karakter[]", k));
    if (status) params.set("status", status);
    if (tipe)   params.set("tipe", tipe);
    params.set("urutan", urutan || "default");
    router.push(`/anime-list?${params.toString()}`);
  }, [router, genre, karakter, status, tipe, urutan]);

  return (
    <div className="rounded-xl border border-border/50 bg-muted/20">
      <div className="px-4 py-3 border-b border-border/40 bg-muted/30 rounded-t-xl">
        <h3 className="text-sm font-semibold text-foreground">Pencarian Sesuai Kriteria</h3>
      </div>
      <div className="p-3 flex flex-col gap-2">
        <MultiSelect  label="Genre"    options={GENRE_OPTIONS}    selected={genre}    onChange={setGenre} />
        <MultiSelect  label="Karakter" options={KARAKTER_OPTIONS} selected={karakter} onChange={setKarakter} />
        <SingleSelect label="Status"   options={STATUS_OPTIONS}   value={status}      onChange={setStatus} />
        <SingleSelect label="Tipe"     options={TIPE_OPTIONS}     value={tipe}        onChange={setTipe} />
        <SingleSelect label="Urutan"   options={URUTAN_OPTIONS}   value={urutan}      onChange={setUrutan} />

        <button
          type="button"
          onClick={handleSearch}
          className="mt-1 w-full flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground py-2 text-xs font-semibold hover:bg-primary/90 transition-colors"
        >
          <MagnifyingGlass className="h-3.5 w-3.5" />
          Cari Sesuai Kriteria
        </button>
      </div>
    </div>
  );
}
