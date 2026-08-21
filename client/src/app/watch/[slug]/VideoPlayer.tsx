"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { CaretLeft, CaretRight, Warning } from "@phosphor-icons/react";
import { getStream } from "@/lib/api";

import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/video.css';
import { MediaPlayer, MediaProvider } from '@vidstack/react';
import type { HLSSrc } from '@vidstack/react';
import { defaultLayoutIcons, DefaultVideoLayout } from '@vidstack/react/player/layouts/default';

interface Server {
  label: string;
  quality: string;
  server: number;
  url: string;
}

interface VideoPlayerProps {
  title: string;
  defaultPlayer: string;
  servers: Server[];
  navigation: {
    prevEpisode: string | null;
    nextEpisode: string | null;
  };
}

/** Extract last path segment from an animasu URL to use as watch slug */
function toWatchSlug(epUrl: string): string {
  try {
    return new URL(epUrl).pathname.replace(/\/$/, "").split("/").pop() || "";
  } catch {
    return "";
  }
}

export function VideoPlayer({ title, defaultPlayer, servers, navigation }: VideoPlayerProps) {
  const initialUrl = defaultPlayer || servers?.find((s) => s.url.includes(".m3u8"))?.url || servers?.[0]?.url || "";
  const [currentUrl, setCurrentUrl] = useState(initialUrl);
  const [activeLabel, setActiveLabel] = useState(servers?.[0]?.label || "Default");

  const [streamData, setStreamData] = useState<any>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractError, setExtractError] = useState("");

  useEffect(() => {
    const extractable = currentUrl?.includes("vidhidepro.com") || currentUrl?.includes("vidhide.com");
    let mounted = true;

    async function fetchStream() {
      if (!extractable) {
        setStreamData(null);
        setExtractError("");
        return;
      }

      setIsExtracting(true);
      setExtractError("");
      setStreamData(null);

      try {
        const res = await getStream(currentUrl);
        if (mounted) {
          setStreamData(res);
        }
      } catch (err: any) {
        if (mounted) {
          setExtractError("Gagal mengekstrak video dari server ini.");
          console.error("Stream extraction error:", err);
        }
      } finally {
        if (mounted) {
          setIsExtracting(false);
        }
      }
    }

    fetchStream();

    return () => { mounted = false; };
  }, [currentUrl]);

  function toProxiedUrl(rawUrl: string): string {
    if (!rawUrl) return "";
    return `/api/proxy?url=${encodeURIComponent(rawUrl)}`;
  }

  function isHlsUrl(rawUrl: string): boolean {
    return rawUrl.includes(".m3u8");
  }

  function pickBestHls(hlsList: any[]): string {
    if (!hlsList?.length) return "";
    const master = hlsList.find((s: any) => s.url?.includes("master.m3u8"));
    if (master) return master.url;
    const m3u8 = hlsList.find((s: any) => s.url?.includes(".m3u8"));
    if (m3u8) return m3u8.url;
    return hlsList[0]?.url || "";
  }

  let videoSrc: string | HLSSrc = "";
  if (streamData) {
    const hlsList = streamData.streams?.hls || [];
    const mp4Stream = streamData.streams?.mp4?.[0]?.url;
    const rawSrc = pickBestHls(hlsList) || mp4Stream || "";
    if (rawSrc) {
      const proxied = toProxiedUrl(rawSrc);
      videoSrc = isHlsUrl(rawSrc)
        ? { src: proxied, type: "application/x-mpegurl" as const }
        : proxied;
    }
  }

  if (!currentUrl) {
    return (
      <div className="w-full aspect-video bg-muted flex flex-col items-center justify-center rounded-2xl border border-border/50">
        <Warning className="w-8 h-8 text-muted-foreground mb-2" />
        <p className="text-muted-foreground font-medium">Video tidak tersedia</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* 16:9 Video Container */}
      <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl ring-1 ring-border/50 flex items-center justify-center group">

        {isExtracting ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            <span className="text-sm font-medium text-muted-foreground">Mengekstrak Video...</span>
          </div>
        ) : extractError ? (
          <div className="flex flex-col items-center gap-3">
            <Warning className="w-8 h-8 text-destructive" />
            <span className="text-sm font-medium text-destructive">{extractError}</span>
            <button
              onClick={() => {
                setStreamData(null);
                setExtractError("");
              }}
              className="text-xs text-muted-foreground hover:text-foreground underline mt-2"
            >
              Gunakan mode normal (Iframe)
            </button>
          </div>
        ) : streamData && videoSrc ? (
          <MediaPlayer
            title={title}
            src={videoSrc}
            autoPlay={true}
            crossOrigin
            playsInline
            viewType="video"
            streamType="on-demand"
            keyTarget="document"
            className="media-player w-full h-full outline-none focus:outline-none focus-visible:outline-none ring-0"
          >
            <MediaProvider />
            <DefaultVideoLayout icons={defaultLayoutIcons} />
          </MediaPlayer>
        ) : (
          <iframe
            key={currentUrl}
            src={currentUrl}
            className="absolute inset-0 w-full h-full border-0"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        )}
      </div>

      {/* Controls & Server Selection */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card border border-border/50 p-4 rounded-2xl">

        {/* Servers */}
        <div className="flex-1 w-full overflow-x-auto pb-1 sm:pb-0 scrollbar-thin">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mr-2 shrink-0">
              Server:
            </span>
            {servers?.map((srv, i) => {
              const supportsExtraction = srv.url.includes("vidhidepro.com") || srv.url.includes("vidhide.com");
              return (
                <button
                  key={i}
                  onClick={() => {
                    setCurrentUrl(srv.url);
                    setActiveLabel(srv.label);
                  }}
                  className={cn(
                    "shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-all flex items-center gap-1.5",
                    activeLabel === srv.label
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground border border-transparent hover:border-border/60"
                  )}
                >
                  {srv.label}
                  {supportsExtraction && activeLabel !== srv.label && (
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" title="Native Player Supported" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-2 shrink-0">
          {navigation.prevEpisode ? (
            <Link
              href={`/watch/${toWatchSlug(navigation.prevEpisode)}`}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-9 rounded-lg")}
            >
              <CaretLeft weight="bold" className="w-4 h-4 mr-1" /> Prev
            </Link>
          ) : (
            <span className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-9 rounded-lg opacity-50 cursor-not-allowed")}>
              <CaretLeft weight="bold" className="w-4 h-4 mr-1" /> Prev
            </span>
          )}

          {navigation.nextEpisode ? (
            <Link
              href={`/watch/${toWatchSlug(navigation.nextEpisode)}`}
              className={cn(buttonVariants({ variant: "default", size: "sm" }), "h-9 rounded-lg")}
            >
              Next <CaretRight weight="bold" className="w-4 h-4 ml-1" />
            </Link>
          ) : (
            <span className={cn(buttonVariants({ variant: "secondary", size: "sm" }), "h-9 rounded-lg opacity-50 cursor-not-allowed")}>
              Next <CaretRight weight="bold" className="w-4 h-4 ml-1" />
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
