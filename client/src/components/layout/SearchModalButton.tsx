"use client";

import { useState, useEffect } from "react";
import { MagnifyingGlass, X } from "@phosphor-icons/react/dist/ssr";
import { useRouter } from "next/navigation";

export function SearchModalButton() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  // Keyboard shortcuts (Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Dispatch custom event so Header can react without prop drilling
  // Also lock scroll when modal is open
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("search-modal", { detail: { open: isOpen } }));
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const q = formData.get("q") as string;
    if (q && q.length >= 2) {
      setIsOpen(false);
      router.push(`/search?q=${encodeURIComponent(q)}`);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-muted/50 transition-colors text-foreground/80 hover:text-foreground"
        title="Cari (Cmd+K)"
      >
        <MagnifyingGlass weight="bold" className="h-[18px] w-[18px]" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-24 px-4 bg-black/60 animate-in fade-in duration-200">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 cursor-pointer" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Modal Content */}
          <div className="relative w-full max-w-2xl bg-card border border-border/60 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <form onSubmit={handleSubmit} className="flex items-center">
              <MagnifyingGlass className="absolute left-5 h-6 w-6 text-muted-foreground" />
              <input 
                type="search"
                name="q"
                placeholder="Cari judul anime... (Tekan Enter)"
                className="w-full bg-transparent pl-14 pr-16 py-5 text-xl font-medium outline-none placeholder:text-muted-foreground/50 [&::-webkit-search-cancel-button]:appearance-none"
                autoFocus
                required
                minLength={2}
              />
              <button 
                type="button" 
                onClick={() => setIsOpen(false)}
                className="absolute right-4 p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                <X weight="bold" className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
