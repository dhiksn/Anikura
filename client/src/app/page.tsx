import { getHomeData } from "@/lib/api";
import { HomeHero } from "@/components/HomeHero";
import { AnimeCard } from "@/components/AnimeCard";
import { RevealStagger } from "@/components/RevealStagger";
import { Sidebar } from "@/components/Sidebar";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRight, CaretLeft, CaretRight } from "@phosphor-icons/react/dist/ssr";

export const revalidate = 60;

export default async function HomePage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const page = typeof searchParams.page === "string" ? parseInt(searchParams.page, 10) : 1;

  try {
    const [homeData, pageData] = await Promise.all([
      getHomeData(1),
      page > 1 ? getHomeData(page) : null,
    ]);

    const currentPageData = pageData || homeData;
    const heroAnimes = homeData?.sedangTayang?.slice(0, 5) || homeData?.baruDiperbarui?.slice(0, 5) || [];

    return (
      <div className="flex flex-col pb-24 -mt-24">
        {heroAnimes.length > 0 && <HomeHero animes={heroAnimes} />}

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl mt-20">
          <div className="flex flex-col lg:flex-row gap-10">

            {/* Konten utama */}
            <div className="flex-1 min-w-0 flex flex-col gap-12">

              {/* Sedang Tayang */}
              {homeData?.sedangTayang?.length > 0 && (
                <section className="flex flex-col gap-8">
                  <div className="flex items-end justify-between">
                    <div>
                      <h2 className="text-3xl font-bold tracking-tight">Sedang Tayang</h2>
                      <p className="text-muted-foreground mt-1 text-sm">Episode terbaru dari serial yang sedang tayang.</p>
                    </div>
                    <Link href="/ongoing" className={buttonVariants({ variant: "outline", size: "sm" })}>
                      Lihat Semua <ArrowRight className="ml-1.5 h-4 w-4" />
                    </Link>
                  </div>
                  <RevealStagger className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-5 gap-3">
                    {homeData.sedangTayang.map((anime, i) => (
                      <AnimeCard key={i} anime={anime} priority={i < 4} />
                    ))}
                  </RevealStagger>
                </section>
              )}

              {/* Baru Ditambah & Diperbarui */}
              {currentPageData?.baruDiperbarui?.length > 0 && (
                <section className="flex flex-col gap-8">
                  <div className="flex items-end justify-between">
                    <div>
                      <h2 className="text-3xl font-bold tracking-tight">Baru Ditambah &amp; Diperbarui</h2>
                      <p className="text-muted-foreground mt-1 text-sm">Anime yang baru ditambahkan atau diperbarui.</p>
                    </div>
                    <Link href="/anime-list?urutan=update" className={buttonVariants({ variant: "outline", size: "sm" })}>
                      Lihat Semua <ArrowRight className="ml-1.5 h-4 w-4" />
                    </Link>
                  </div>

                  <RevealStagger className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-5 gap-3">
                    {currentPageData.baruDiperbarui.map((anime, i) => (
                      <AnimeCard key={i} anime={anime} index={i} />
                    ))}
                  </RevealStagger>

                  {/* Pagination */}
                  {currentPageData.pagination && (currentPageData.pagination.hasNextPage || currentPageData.pagination.hasPrevPage) && (
                    <div className="grid grid-cols-2 gap-px border border-primary overflow-hidden rounded-sm">
                      {currentPageData.pagination.hasPrevPage ? (
                        <Link
                          href={currentPageData.pagination.prevPage === 1 ? "/" : `/?page=${currentPageData.pagination.prevPage}`}
                          className="flex items-center justify-center gap-2 py-3 bg-primary/10 hover:bg-primary/20 text-sm font-bold text-primary transition-colors"
                        >
                          <CaretLeft className="h-4 w-4" /> Lebih Baru
                        </Link>
                      ) : (
                        <span className="flex items-center justify-center gap-2 py-3 bg-muted/20 text-sm font-bold text-muted-foreground cursor-not-allowed">
                          <CaretLeft className="h-4 w-4" /> Lebih Baru
                        </span>
                      )}

                      {currentPageData.pagination.hasNextPage ? (
                        <Link
                          href={`/?page=${currentPageData.pagination.nextPage}#terupdate`}
                          className="flex items-center justify-center gap-2 py-3 bg-primary/10 hover:bg-primary/20 text-sm font-bold text-primary transition-colors border-l border-primary"
                        >
                          Lebih Lama <CaretRight className="h-4 w-4" />
                        </Link>
                      ) : (
                        <span className="flex items-center justify-center gap-2 py-3 bg-muted/20 text-sm font-bold text-muted-foreground cursor-not-allowed border-l border-primary/30">
                          Lebih Lama <CaretRight className="h-4 w-4" />
                        </span>
                      )}
                    </div>
                  )}
                </section>
              )}

            </div>

            {/* Sidebar */}
            <div className="w-full lg:w-80 xl:w-96 shrink-0">
              <Sidebar showFilter />
            </div>

          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Failed to fetch home data", error);
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Layanan Tidak Tersedia</h1>
        <p className="text-muted-foreground mb-8">Tidak dapat terhubung ke API. Apakah server sedang berjalan?</p>
      </div>
    );
  }
}
