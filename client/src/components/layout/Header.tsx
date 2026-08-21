"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { CaretDown } from "@phosphor-icons/react";
import { SearchModalButton } from "./SearchModalButton";
import logoIcon from "@/app/icon.png";

const NAV_GROUPS = [
  {
    label: "Jelajahi",
    items: [
      { href: "/ongoing",    label: "Sedang Tayang 🔥" },
      { href: "/complete",   label: "Selesai Tayang ✓" },
      { href: "/popular",    label: "Terpopuler 😍" },
      { href: "/timeline",   label: "Timeline Rilis 📅" },
    ],
  },
  {
    label: "Kategori",
    items: [
      { href: "/genre",     label: "Genre" },
      { href: "/character", label: "Tipe Karakter" },
    ],
  },
];

export function Header() {
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      setSearchOpen((e as CustomEvent<{ open: boolean }>).detail.open);
    };
    window.addEventListener("search-modal", handler);
    return () => window.removeEventListener("search-modal", handler);
  }, []);

  return (
    <div className="fixed top-4 left-0 right-0 z-[200] w-full px-4 sm:px-6 pointer-events-none">
      <header
        className={[
          "mx-auto flex h-14 w-fit items-center gap-6 md:gap-10 rounded-full border border-border/40 shadow-xl px-4 sm:px-6 pointer-events-auto transition-colors duration-200",
          // When search modal is open, use a solid opaque background so the
          // overlay behind doesn't bleed through backdrop-blur
          searchOpen
            ? "bg-background"
            : "bg-background/80 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60",
        ].join(" ")}
      >

        {/* Left — logo + nav */}
        <div className="flex items-center gap-2 sm:gap-6">
          <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <Image src={logoIcon} alt="Logo" width={28} height={28} className="rounded-md object-cover" />
            <span className="hidden sm:inline-block font-sans font-bold tracking-tight text-lg">ANIKURA</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            <Link href="/" className="px-3 py-1.5 rounded-full text-foreground/80 hover:text-foreground hover:bg-muted/60 transition-colors">
              Beranda
            </Link>
            <Link href="/anime-list" className="px-3 py-1.5 rounded-full text-foreground/80 hover:text-foreground hover:bg-muted/60 transition-colors">
              Daftar Anime
            </Link>
            <Link href="/daftar-anime" className="px-3 py-1.5 rounded-full text-foreground/80 hover:text-foreground hover:bg-muted/60 transition-colors">
              A–Z
            </Link>
            <Link href="/jadwal" className="px-3 py-1.5 rounded-full text-foreground/80 hover:text-foreground hover:bg-muted/60 transition-colors">
              Jadwal
            </Link>
            <Link href="/movie" className="px-3 py-1.5 rounded-full text-foreground/80 hover:text-foreground hover:bg-muted/60 transition-colors">
              Movie
            </Link>

            {NAV_GROUPS.map((group) => (
              <div key={group.label} className="relative group">
                <button className="flex items-center gap-1 px-3 py-1.5 rounded-full text-foreground/80 hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer select-none">
                  {group.label}
                  <CaretDown className="h-3 w-3 transition-transform duration-200 group-hover:rotate-180" />
                </button>
                <div className="absolute left-0 top-full pt-4 hidden group-hover:block z-50">
                  <div className="min-w-[180px] rounded-2xl border border-border/60 bg-background/95 backdrop-blur shadow-2xl py-2 overflow-hidden">
                    {group.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-center px-4 py-2 text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-muted/60 transition-colors"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Right — search icon triggering modal */}
        <div className="flex items-center gap-2">
          <SearchModalButton />
        </div>

      </header>
    </div>
  );
}
