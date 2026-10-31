"use client";

import Navbar from "@/components/layout/Navbar";
import AuthModal from "@/components/auth/AuthModal";
import { PRODUCTS } from "@/lib/data";
import { Product, DressCategory } from "@/lib/types";
import { mapDesignToProduct } from "@/lib/productMapper";
import Image from "next/image";
import Link from "next/link";
import ProductCard from "@/components/product/ProductCard";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useMemo } from "react";
import { ChevronRight, ArrowRight, Sparkles, Crown, Layers } from "lucide-react";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [backendLoaded, setBackendLoaded] = useState(false);
  const [activeCategoryIdx, setActiveCategoryIdx] = useState<number | null>(
    null,
  );

  const [backendCategories, setBackendCategories] = useState<DressCategory[]>([]);
  const [customCollections, setCustomCollections] = useState<any[]>([]);
  const [activeBalconyWardrobe, setActiveBalconyWardrobe] = useState<"Queen's Wardrobe" | "King's Wardrobe">("Queen's Wardrobe");

  // Sync backend collection if reachable, or keep calm curated garments
  useEffect(() => {
    const fetchBackendData = async () => {
      try {
        const API_URL =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
        const [catsRes, designsRes, collsRes] = await Promise.all([
          fetch(`${API_URL}/api/admin/dress-categories`),
          fetch(`${API_URL}/api/admin/designs`),
          fetch(`${API_URL}/api/admin/collections`).catch(() => null),
        ]);

        const collsData = collsRes && collsRes.ok ? await collsRes.json() : [];
        const catsData = catsRes && catsRes.ok ? await catsRes.json() : [];
        const designsData = designsRes && designsRes.ok ? await designsRes.json() : [];

        if (Array.isArray(collsData)) {
          const sortedColls = [...collsData].sort(
            (a, b) =>
              new Date(b.createdAt || 0).getTime() -
              new Date(a.createdAt || 0).getTime()
          );
          setCustomCollections(sortedColls);
        }

        if (Array.isArray(catsData)) {
          setBackendCategories(catsData);
        }

        if (Array.isArray(designsData) && designsData.length > 0) {
          const mapped = designsData.map((d: any) =>
            mapDesignToProduct(d, catsData),
          );
          // Sort newest designs first for New Arrivals
          mapped.sort(
            (a, b) =>
              new Date(b.createdAt || 0).getTime() -
              new Date(a.createdAt || 0).getTime()
          );
          setProducts(mapped);
          setBackendLoaded(true);
        } else {
          setProducts([]);
        }
      } catch (err) {
        setProducts([]);
      }
    };

    fetchBackendData();
  }, []);

  // Smooth scroll observer for dynamic section reveals and in-view card lighting
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.05 },
    );

    const elements = document.querySelectorAll(".reveal-on-scroll");
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [customCollections, products]);

  // Fallback high-fashion stock images
  const fallbackCuratedImages = [
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1554412933-514a83d2f3c8?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80",
  ];

  interface BalconyCategoryItem {
    id: string;
    title: string;
    subtitle: string;
    query: string;
    wardrobe: string;
    image: string;
    designCount?: number;
  }

  // Real category showcase for The Balcony View filtered by active wardrobe (no hardcoded entries)
  const balconyCategories: BalconyCategoryItem[] = useMemo(() => {
    const isKing = activeBalconyWardrobe.toLowerCase().includes("king");
    const filteredCats = backendCategories.filter((c) => {
      const wType = (c.wardrobeType || "Queen's Wardrobe").toLowerCase();
      return isKing ? wType.includes("king") : wType.includes("queen");
    });

    // Deduplicate categories by normalized name to ensure distinct category cards
    const uniqueCatsMap = new Map<string, { id?: string; name: string }>();
    for (const c of filteredCats) {
      const normalizedName = (c.name || "").trim();
      const lower = normalizedName.toLowerCase();
      if (lower && !uniqueCatsMap.has(lower)) {
        uniqueCatsMap.set(lower, { id: c.id, name: normalizedName });
      }
    }

    const realCategories = Array.from(uniqueCatsMap.values());

    return realCategories.map((cat, idx) => {
      // Find matching design from products state for real imagery
      const matching = products.find((p) => {
        const catMatch = (p.category || "").toLowerCase() === cat.name.toLowerCase();
        const wardMatch = isKing
          ? (p.defaultCollection || "").toLowerCase().includes("king")
          : (p.defaultCollection || "Queen's Wardrobe").toLowerCase().includes("queen");
        return catMatch && wardMatch;
      });

      const designImage = matching?.variants?.[0]?.images?.[0];
      const count = products.filter((p) => {
        const catMatch = (p.category || "").toLowerCase() === cat.name.toLowerCase();
        const wardMatch = isKing
          ? (p.defaultCollection || "").toLowerCase().includes("king")
          : (p.defaultCollection || "Queen's Wardrobe").toLowerCase().includes("queen");
        return catMatch && wardMatch;
      }).length;

      return {
        id: cat.id ? `${cat.id}-${idx}` : `balcony-${activeBalconyWardrobe}-${cat.name}-${idx}`,
        title: cat.name,
        subtitle: count > 0 ? `${count} tailored piece${count === 1 ? "" : "s"}` : "Atelier tailored cut",
        query: cat.name,
        wardrobe: activeBalconyWardrobe,
        image: designImage || "",
        designCount: count > 0 ? count : undefined,
      };
    });
  }, [activeBalconyWardrobe, backendCategories, products]);

  // Dynamic real categories for footer
  const footerCategories = useMemo(() => {
    const uniqueMap = new Map<string, { name: string; wardrobe: string }>();
    for (const c of backendCategories) {
      const name = (c.name || "").trim();
      const lower = name.toLowerCase();
      if (lower && !uniqueMap.has(lower)) {
        uniqueMap.set(lower, {
          name,
          wardrobe: c.wardrobeType || "Queen's Wardrobe",
        });
      }
    }
    return Array.from(uniqueMap.values());
  }, [backendCategories]);

  return (
    <div className="min-h-screen text-[#F7F5FA] overflow-x-hidden">
      <Navbar />
      <AuthModal />

      {/* =========================================================================
          HERO SECTION: CALM PALACE FOYER (FEATURING 3.3.3 AS REQUESTED)
          ========================================================================= */}
      <section className="relative min-h-[90vh] w-full flex items-center justify-center pt-28 pb-16">
        <div className="max-w-[1700px] w-full mx-auto px-6 lg:px-12 grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Hero Typography */}
          <div className="lg:col-span-7 z-20 space-y-8">
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-white/10 bg-[#160D28]/60 backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
              <span className="text-[10px] font-medium tracking-[0.25em] uppercase text-zinc-300">
                New Season Collection
              </span>
            </div>

            <div className="space-y-4">
              <h1 className="font-headline text-5xl sm:text-7xl lg:text-[5.5vw] font-normal leading-[1.05] tracking-tight text-white">
                Quiet luxury.
                <br />
                <span className="italic text-[#D4AF37]">
                  Everyday elegance.
                </span>
              </h1>
              <p className="max-w-lg text-xs sm:text-sm tracking-wide text-zinc-300 font-light leading-relaxed">
                Refined silhouettes crafted with graceful proportions.
                Thoughtfully tailored for individuals who value calm presence
                and exceptional finish.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link href="/shop?category=Queen%27s%20Wardrobe">
                <Button className="calm-primary-btn px-8 py-6 rounded-full text-xs tracking-[0.2em] uppercase font-semibold">
                  Queen's Wardrobe
                </Button>
              </Link>
              <Link href="/shop?category=King%27s%20Wardrobe">
                <Button
                  variant="outline"
                  className="calm-secondary-btn px-8 py-6 rounded-full text-xs tracking-[0.2em] uppercase font-semibold"
                >
                  King's Wardrobe
                </Button>
              </Link>
            </div>

            {/* Pillars */}
            <div className="pt-8 border-t border-white/10 grid grid-cols-3 gap-6 max-w-md">
              <div>
                <span className="block text-sm font-semibold text-white">
                  Pure Fabrics
                </span>
                <span className="text-[10px] text-zinc-400">
                  Curated materials
                </span>
              </div>
              <div>
                <span className="block text-sm font-semibold text-white">
                  Precise Cut
                </span>
                <span className="text-[10px] text-zinc-400">
                  Tailored drape
                </span>
              </div>
              <div>
                <span className="block text-sm font-semibold text-white">
                  Direct Care
                </span>
                <span className="text-[10px] text-zinc-400">
                  Personal treatment
                </span>
              </div>
            </div>
          </div>

          {/* Hero Main Fashion Visual */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto w-full max-w-[460px] aspect-[3/4] rounded-3xl overflow-hidden border border-white/10 bg-[#160D29] shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=80"
                alt="CEYRAA Wardrobe"
                fill
                priority
                className="object-cover transition-transform duration-700 hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0612]/70 via-transparent to-transparent pointer-events-none" />

              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl calm-glass">
                <span className="text-[9px] font-medium tracking-[0.25em] uppercase text-[#D4AF37] block">
                  CEYRAA Atelier
                </span>
                <h3 className="font-headline text-base font-normal tracking-wide text-white">
                  Effortless Day & Evening Pieces
                </h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          BALCONY VIEW: OVERLOOK ALL CATEGORIES (DYNAMIC SCROLL INTERACTION)
          ========================================================================= */}
      <section id="balcony-view" className="py-24 relative">
        <div className="max-w-[1700px] mx-auto px-6 lg:px-12">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 reveal-on-scroll">
            <div className="space-y-3">
              <span className="text-[10px] tracking-[0.25em] uppercase text-[#D4AF37] font-semibold">
                Overview
              </span>
              <h2 className="font-headline text-3xl sm:text-5xl font-normal tracking-tight text-white">
                The Balcony View
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 font-light max-w-md">
                Survey the garment categories from one calm perspective.
              </p>
            </div>

            <div className="mt-4 md:mt-0 shrink-0">
              <Link
                href={`/shop?wardrobe=${encodeURIComponent(activeBalconyWardrobe)}`}
                className="group inline-flex items-center gap-2 text-xs tracking-wider uppercase text-zinc-300 hover:text-white whitespace-nowrap shrink-0"
              >
                <span className="hover-gold-line pb-0.5">
                  View all {activeBalconyWardrobe.includes("King") ? "King's" : "Queen's"} categories
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-[#D4AF37] group-hover:translate-x-1 transition-transform shrink-0" />
              </Link>
            </div>
          </div>

          {/* Expansive Ultra-Slim Wardrobe Selector Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 w-full">
            {/* Queen's Wardrobe Card */}
            <button
              type="button"
              onClick={() => setActiveBalconyWardrobe("Queen's Wardrobe")}
              className={`group relative h-[90px] sm:h-[105px] rounded-2xl overflow-hidden calm-card border text-left transition-all duration-300 flex items-center justify-between p-4 sm:p-5 cursor-pointer ${
                activeBalconyWardrobe === "Queen's Wardrobe"
                  ? "border-[#D4AF37] ring-1 ring-[#D4AF37]/50 shadow-[0_4px_20px_rgba(212,175,55,0.2)]"
                  : "border-white/10 hover:border-white/25 opacity-75 hover:opacity-100"
              }`}
            >
              <Image
                src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80"
                alt="Queen's Wardrobe"
                fill
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0A0612]/95 via-[#0A0612]/75 to-[#0A0612]/40" />
              {activeBalconyWardrobe === "Queen's Wardrobe" && (
                <div className="absolute inset-0 bg-[#D4AF37]/5 pointer-events-none" />
              )}

              {/* Left Content */}
              <div className="relative z-10 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded-md bg-[#D4AF37]/20 text-[#D4AF37]">
                    <Sparkles className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-[10px] tracking-widest uppercase text-[#D4AF37] font-semibold">
                    Women&apos;s
                  </span>
                </div>
                <h3 className="font-headline text-lg sm:text-xl font-normal text-white group-hover:text-[#D4AF37] transition-colors leading-tight">
                  Queen&apos;s Wardrobe
                </h3>
                <p className="text-[11px] text-zinc-300 font-light line-clamp-1">
                  Fluid dresses, evening silhouettes, and relaxed tailoring
                </p>
              </div>

              {/* Right Content: Active Badge & Arrow */}
              <div className="relative z-10 flex flex-col items-end justify-between h-full py-0.5 shrink-0 pl-3">
                {activeBalconyWardrobe === "Queen's Wardrobe" ? (
                  <span className="text-[9px] font-bold tracking-widest uppercase px-2.5 py-0.5 rounded-full bg-[#D4AF37] text-black">
                    Active
                  </span>
                ) : (
                  <span className="text-[9px] font-medium tracking-widest uppercase px-2.5 py-0.5 rounded-full bg-white/10 text-zinc-300 group-hover:bg-white/20">
                    Switch
                  </span>
                )}
                <ArrowRight className="w-4 h-4 text-[#D4AF37] group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            {/* King's Wardrobe Card */}
            <button
              type="button"
              onClick={() => setActiveBalconyWardrobe("King's Wardrobe")}
              className={`group relative h-[90px] sm:h-[105px] rounded-2xl overflow-hidden calm-card border text-left transition-all duration-300 flex items-center justify-between p-4 sm:p-5 cursor-pointer ${
                activeBalconyWardrobe === "King's Wardrobe"
                  ? "border-[#D4AF37] ring-1 ring-[#D4AF37]/50 shadow-[0_4px_20px_rgba(212,175,55,0.2)]"
                  : "border-white/10 hover:border-white/25 opacity-75 hover:opacity-100"
              }`}
            >
              <Image
                src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80"
                alt="King's Wardrobe"
                fill
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0A0612]/95 via-[#0A0612]/75 to-[#0A0612]/40" />
              {activeBalconyWardrobe === "King's Wardrobe" && (
                <div className="absolute inset-0 bg-[#D4AF37]/5 pointer-events-none" />
              )}

              {/* Left Content */}
              <div className="relative z-10 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded-md bg-[#D4AF37]/20 text-[#D4AF37]">
                    <Crown className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-[10px] tracking-widest uppercase text-[#D4AF37] font-semibold">
                    Men&apos;s
                  </span>
                </div>
                <h3 className="font-headline text-lg sm:text-xl font-normal text-white group-hover:text-[#D4AF37] transition-colors leading-tight">
                  King&apos;s Wardrobe
                </h3>
                <p className="text-[11px] text-zinc-300 font-light line-clamp-1">
                  Clean poplin shirts, trousers, and modern essentials
                </p>
              </div>

              {/* Right Content: Active Badge & Arrow */}
              <div className="relative z-10 flex flex-col items-end justify-between h-full py-0.5 shrink-0 pl-3">
                {activeBalconyWardrobe === "King's Wardrobe" ? (
                  <span className="text-[9px] font-bold tracking-widest uppercase px-2.5 py-0.5 rounded-full bg-[#D4AF37] text-black">
                    Active
                  </span>
                ) : (
                  <span className="text-[9px] font-medium tracking-widest uppercase px-2.5 py-0.5 rounded-full bg-white/10 text-zinc-300 group-hover:bg-white/20">
                    Switch
                  </span>
                )}
                <ArrowRight className="w-4 h-4 text-[#D4AF37] group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          </div>

          {/* Balcony Category Grid (Real Categories from Database) */}
          {balconyCategories.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {balconyCategories.map((cat, idx) => (
                <Link
                  key={cat.id || `balcony-${cat.wardrobe}-${cat.title}-${idx}`}
                  href={`/shop?wardrobe=${encodeURIComponent(cat.wardrobe)}&category=${encodeURIComponent(cat.query)}`}
                  className={`group relative h-[420px] rounded-2xl overflow-hidden calm-card border border-white/10 hover:border-[#D4AF37]/50 transition-all duration-700 flex flex-col justify-end p-6 ${
                    idx % 2 !== 0 ? "lg:translate-y-4" : ""
                  }`}
                  style={{ transitionDelay: `${idx * 120}ms` }}
                >
                  {cat.image ? (
                    <Image
                      src={cat.image}
                      alt={cat.title}
                      fill
                      className="object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-[#1C1033] via-[#0E071D] to-[#0A0612] flex items-center justify-center p-6">
                      <span className="text-zinc-500 uppercase tracking-widest text-[11px] font-medium">
                        {cat.title}
                      </span>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0612]/95 via-[#0A0612]/50 to-transparent" />

                  <div className="relative z-10 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] tracking-widest uppercase text-[#D4AF37] font-semibold">
                        {cat.wardrobe.includes("King") ? "King's Wardrobe" : "Queen's Wardrobe"}
                      </span>
                      {typeof cat.designCount === "number" && cat.designCount > 0 && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-zinc-300">
                          {cat.designCount} {cat.designCount === 1 ? "piece" : "pieces"}
                        </span>
                      )}
                    </div>
                    <h3 className="font-headline text-2xl font-normal text-white group-hover:text-[#D4AF37] transition-colors">
                      {cat.title}
                    </h3>
                    <p className="text-[11px] text-zinc-300 font-light leading-relaxed line-clamp-2">
                      {cat.subtitle}
                    </p>
                    <span className="inline-flex items-center gap-1 text-[10px] tracking-widest uppercase text-[#D4AF37] pt-1">
                      Explore Category{" "}
                      <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center calm-card rounded-2xl border border-white/10 p-8 max-w-lg mx-auto">
              <p className="text-xs tracking-widest uppercase text-[#D4AF37] font-semibold mb-2">
                {activeBalconyWardrobe}
              </p>
              <p className="text-sm text-zinc-300 font-light">
                No categories catalogued yet in this wardrobe. Check back soon for new releases.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* =========================================================================
          CURATED COLLECTION: NEW ARRIVALS (DYNAMIC SCROLL GRID)
          ========================================================================= */}
      <section className="py-20 relative border-t border-white/5">
        <div className="max-w-[1700px] mx-auto px-6 lg:px-12">
          {/* Header */}
          <div className="mb-14 reveal-on-scroll space-y-3">
            <span className="text-[10px] tracking-[0.25em] uppercase text-[#D4AF37] font-semibold">
              Curated
            </span>
            <h2 className="font-headline text-3xl sm:text-5xl font-normal tracking-tight text-white">
              New Arrivals
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 font-light">
              {backendLoaded
                ? "Live pieces catalogued directly from the atelier"
                : "Seasonal wardrobe essentials tailored for comfort and form"}
            </p>
          </div>

          {/* Product Grid with alternating dynamic scroll offsets */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {products.slice(0, 8).map((product, idx) => (
              <div
                key={product.id}
                className={`reveal-on-scroll ${idx % 2 !== 0 ? "lg:translate-y-6" : ""}`}
                style={{ transitionDelay: `${(idx % 4) * 100}ms` }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          CURATED ATELIER COLLECTIONS (DEDICATED SECTION)
          ========================================================================= */}
      {customCollections.length > 0 && (
        <section className="py-20 relative border-t border-white/5">
          <div className="max-w-[1700px] mx-auto px-6 lg:px-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 reveal-on-scroll">
              <div className="space-y-3">
                <span className="text-[10px] tracking-[0.25em] uppercase text-[#D4AF37] font-semibold">
                  Curated Series
                </span>
                <h2 className="font-headline text-3xl sm:text-5xl font-normal tracking-tight text-white">
                  Atelier Collections
                </h2>
                <p className="text-xs sm:text-sm text-zinc-400 font-light max-w-md">
                  Exclusive seasonal capsules and thematic silhouette collections.
                </p>
              </div>

              <div className="mt-4 md:mt-0 shrink-0">
                <Link
                  href="/shop?view=collections"
                  className="group inline-flex items-center gap-2 text-xs tracking-wider uppercase text-zinc-300 hover:text-white whitespace-nowrap shrink-0"
                >
                  <span className="hover-gold-line pb-0.5">Explore collections</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#D4AF37] group-hover:translate-x-1 transition-transform shrink-0" />
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {customCollections.slice(0, 4).map((col, idx) => {
                const matching = products.find(
                  (p) =>
                    p.customCollection &&
                    p.customCollection.toLowerCase() === col.name.toLowerCase()
                );
                const colImage =
                  col.imageUrl ||
                  matching?.variants?.[0]?.images?.[0] ||
                  fallbackCuratedImages[idx % fallbackCuratedImages.length];

                return (
                  <Link
                    key={col.id ? `${col.id}-${idx}` : `${col.name}-${idx}`}
                    href={`/shop?view=collections&collection=${encodeURIComponent(col.name)}`}
                    className="group relative h-[380px] rounded-3xl overflow-hidden calm-card border border-white/10 hover:border-[#D4AF37]/50 transition-all duration-700 reveal-on-scroll flex flex-col justify-end p-6 sm:p-8"
                  >
                    <Image
                      src={colImage}
                      alt={col.name}
                      fill
                      className="object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0612]/95 via-[#0A0612]/40 to-transparent" />

                    <div className="relative z-10 space-y-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] tracking-widest uppercase font-semibold px-2.5 py-1 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30">
                          Curated Drop
                        </span>
                        {col.designCount ? (
                          <span className="text-[10px] text-zinc-300 font-light">
                            {col.designCount} Silhouettes
                          </span>
                        ) : null}
                      </div>

                      <h3 className="font-headline text-2xl sm:text-3xl text-white group-hover:text-[#D4AF37] transition-colors">
                        {col.name}
                      </h3>

                      {col.description && (
                        <p className="text-xs text-zinc-300 font-light line-clamp-2 leading-relaxed">
                          {col.description}
                        </p>
                      )}

                      <span className="inline-flex items-center gap-1.5 text-[10px] tracking-widest uppercase text-[#D4AF37] font-semibold pt-1">
                        View Collection <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* =========================================================================
          THE CEYRAA EXPERIENCE: CALM PALACE TOUCH
          ========================================================================= */}
      <section className="py-24 relative my-8">
        <div className="max-w-[1700px] mx-auto px-6 lg:px-12">
          <div className="relative rounded-3xl p-8 lg:p-16 calm-card border border-white/10 overflow-hidden">
            <div className="grid lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-7 space-y-6 reveal-on-scroll">
                <span className="text-[10px] tracking-[0.25em] uppercase text-[#D4AF37] font-semibold">
                  The CeyRaa Standard
                </span>

                <h2 className="font-headline text-3xl sm:text-4xl lg:text-5xl font-normal leading-tight text-white">
                  Elevated pieces, peaceful service.
                </h2>

                <p className="text-xs sm:text-sm text-zinc-300 font-light leading-relaxed">
                  We believe that what you wear every day should feel
                  exceptional without being loud. Every dress, shirt, and
                  tailored coat at CEYRAA is cut from balanced fabrics, finished
                  with attentive craftsmanship, and delivered with the personal
                  respect you deserve.
                </p>

                <div className="pt-2">
                  <Link href="/shop?view=collections">
                    <Button className="calm-secondary-btn px-6 py-5 rounded-full text-xs tracking-widest uppercase font-semibold whitespace-nowrap inline-flex items-center gap-2">
                      <span>Explore Collections</span>
                      <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-5 relative flex justify-center">
                <div className="relative w-full max-w-[360px] aspect-[4/5] rounded-2xl overflow-hidden border border-white/10 shadow-xl">
                  <Image
                    src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80"
                    alt="Atelier Detail"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0612]/80 via-transparent to-transparent" />

                  {/* Subtle Brand Logo Watermark */}
                  <div className="absolute top-4 right-4 p-2.5 rounded-xl calm-glass">
                    <div className="relative h-5 w-16">
                      <Image
                        src="/assets/1.1.png"
                        alt="CEYRAA"
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          EXCLUSIVE OFFERS TEASER
          ========================================================================= */}
      <section className="py-16 relative">
        <div className="max-w-[1700px] mx-auto px-6 lg:px-12">
          <div className="relative rounded-2xl calm-card border border-white/10 p-8 sm:p-12 text-center">
            <div className="max-w-xl mx-auto space-y-4">
              <span className="text-[10px] tracking-[0.25em] uppercase text-[#D4AF37] font-semibold">
                Private Archive
              </span>
              <h2 className="font-headline text-3xl sm:text-4xl font-normal text-white">
                Exclusive Offers
              </h2>
              <p className="text-xs text-zinc-300 font-light leading-relaxed">
                Selected seasonal garments available at preferred pricing for
                our customers.
              </p>
              <div className="pt-2">
                <Link href="/offers">
                  <Button className="calm-primary-btn px-8 py-5 rounded-full text-xs tracking-widest uppercase font-semibold">
                    View Offers &rarr;
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          CALM FOOTER
          ========================================================================= */}
      <footer className="pt-20 pb-12 border-t border-white/10 bg-[#08040F] relative">
        <div className="max-w-[1700px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-white/5">
            {/* Brand */}
            <div className="md:col-span-4 space-y-4">
              <div className="relative h-8 w-32">
                <Image
                  src="/assets/1.1.png"
                  alt="CEYRAA"
                  fill
                  className="object-contain"
                />
              </div>
              <p className="max-w-sm text-xs text-zinc-400 font-light leading-relaxed">
                Elevated everyday fashion and timeless silhouettes. Designed for
                calm confidence and refined living.
              </p>
            </div>

            {/* Dynamic Categories */}
            <div className="md:col-span-3 space-y-3">
              <h4 className="text-[11px] tracking-widest uppercase text-white font-medium">
                Categories
              </h4>
              <ul className="space-y-2 text-xs text-zinc-400 font-light">
                {footerCategories.length > 0 ? (
                  footerCategories.map((cat) => (
                    <li key={cat.name}>
                      <Link
                        href={`/shop?wardrobe=${encodeURIComponent(cat.wardrobe)}&category=${encodeURIComponent(cat.name)}`}
                        className="hover:text-white transition-colors capitalize"
                      >
                        {cat.name}
                      </Link>
                    </li>
                  ))
                ) : (
                  <li>
                    <Link
                      href="/shop"
                      className="hover:text-white transition-colors"
                    >
                      All Garments
                    </Link>
                  </li>
                )}
                <li>
                  <Link
                    href="/#balcony-view"
                    className="hover:text-[#D4AF37] transition-colors text-[11px] uppercase tracking-wider block pt-1"
                  >
                    The Balcony View &rarr;
                  </Link>
                </li>
              </ul>
            </div>

            {/* Dynamic Collections */}
            <div className="md:col-span-2 space-y-3">
              <h4 className="text-[11px] tracking-widest uppercase text-white font-medium">
                Collections
              </h4>
              <ul className="space-y-2 text-xs text-zinc-400 font-light">
                {customCollections.length > 0 ? (
                  customCollections.slice(0, 4).map((col) => (
                    <li key={col.id || col.name}>
                      <Link
                        href={`/shop?view=collections&collection=${encodeURIComponent(col.name)}`}
                        className="hover:text-white transition-colors capitalize"
                      >
                        {col.name}
                      </Link>
                    </li>
                  ))
                ) : (
                  <li>
                    <Link
                      href="/shop?view=collections"
                      className="hover:text-white transition-colors"
                    >
                      Atelier Drops
                    </Link>
                  </li>
                )}
                <li>
                  <Link
                    href="/shop?view=collections"
                    className="hover:text-[#D4AF37] transition-colors text-[11px] uppercase tracking-wider block pt-1"
                  >
                    All Collections &rarr;
                  </Link>
                </li>
              </ul>
            </div>

            {/* Assistance */}
            <div className="md:col-span-3 space-y-3">
              <h4 className="text-[11px] tracking-widest uppercase text-white font-medium">
                Customer Care
              </h4>
              <p className="text-xs text-zinc-400 font-light">
                Receive notices on new arrivals, seasonal edits, and exclusive
                offers.
              </p>
              <div className="flex items-center gap-2 pt-1 max-w-sm">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="bg-[#140C24] border border-white/15 rounded-full px-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/40 flex-1"
                />
                <button className="calm-primary-btn px-5 py-2 rounded-full text-[11px] uppercase tracking-wider font-semibold">
                  Subscribe
                </button>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="flex flex-col sm:flex-row justify-between items-center pt-8 text-[11px] text-zinc-500 font-light">
            <span>
              &copy; {new Date().getFullYear()} CEYRAA. All rights reserved.
            </span>
            <div className="flex space-x-6 mt-4 sm:mt-0">
              <Link href="#" className="hover:text-zinc-300 transition-colors">
                Privacy Policy
              </Link>
              <Link href="#" className="hover:text-zinc-300 transition-colors">
                Terms of Service
              </Link>
              <Link href="#" className="hover:text-zinc-300 transition-colors">
                Shipping & Returns
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
