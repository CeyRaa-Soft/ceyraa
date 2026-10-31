"use client";

import { useState, useMemo, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import AuthModal from "@/components/auth/AuthModal";
import ProductCard from "@/components/product/ProductCard";
import { mapDesignToProduct } from "@/lib/productMapper";
import { PRODUCTS } from "@/lib/data";
import { Product, DressCategory } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SlidersHorizontal, ArrowLeft } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default function ShopClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [sortBy, setBy] = useState("latest");
  const [isCollectionsMode, setIsCollectionsMode] = useState(false);
  const [activeWardrobe, setActiveWardrobe] = useState<string | null>(null);
  const [activeCollection, setActiveCollection] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [priceRange] = useState<[number, number]>([0, 500000]);

  const [products, setProducts] = useState<Product[]>([]);
  const [backendCategories, setBackendCategories] = useState<DressCategory[]>([]);
  const [customCollectionsList, setCustomCollectionsList] = useState<{ id: string; name: string; description?: string }[]>([]);
  const [loading, setLoading] = useState(true);

  // Parse and sync query parameters safely
  useEffect(() => {
    const wardrobeParam = searchParams.get("wardrobe");
    const collectionParam = searchParams.get("collection");
    const categoryParam = searchParams.get("category");
    const viewParam = searchParams.get("view");

    if (viewParam === "collections" || collectionParam) {
      setIsCollectionsMode(true);
      setActiveCollection(collectionParam || null);
      setActiveWardrobe(null);
      setSelectedCategory("All");
    } else if (wardrobeParam) {
      setIsCollectionsMode(false);
      setActiveWardrobe(wardrobeParam);
      setActiveCollection(null);
      setSelectedCategory(categoryParam || "All");
    } else if (categoryParam) {
      setIsCollectionsMode(false);
      const lower = categoryParam.trim().toLowerCase();
      if (lower.includes("queen")) {
        setActiveWardrobe("Queen's Wardrobe");
        setActiveCollection(null);
        setSelectedCategory("All");
      } else if (lower.includes("king")) {
        setActiveWardrobe("King's Wardrobe");
        setActiveCollection(null);
        setSelectedCategory("All");
      } else {
        // Check if matches known custom collection
        const isCustom = customCollectionsList.some(
          (c) => c.name.toLowerCase() === lower
        );
        if (isCustom) {
          setIsCollectionsMode(true);
          setActiveCollection(categoryParam);
          setActiveWardrobe(null);
          setSelectedCategory("All");
        } else {
          setSelectedCategory(categoryParam);
        }
      }
    } else {
      setIsCollectionsMode(false);
      setActiveWardrobe(null);
      setActiveCollection(null);
      setSelectedCategory("All");
    }
  }, [searchParams, customCollectionsList]);

  // Fetch categories, designs, and collections from backend with fallback
  useEffect(() => {
    const fetchCollection = async () => {
      try {
        setLoading(true);
        const API_URL =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
        const [catsRes, designsRes, collsRes] = await Promise.all([
          fetch(`${API_URL}/api/admin/dress-categories`),
          fetch(`${API_URL}/api/admin/designs`),
          fetch(`${API_URL}/api/admin/collections`).catch(() => null),
        ]);

        if (catsRes.ok && designsRes.ok) {
          const catsData: DressCategory[] = await catsRes.json();
          const designsData = await designsRes.json();
          const collsData = collsRes && collsRes.ok ? await collsRes.json() : [];

          setBackendCategories(Array.isArray(catsData) ? catsData : []);
          setCustomCollectionsList(Array.isArray(collsData) ? collsData : []);

          if (Array.isArray(designsData) && designsData.length > 0) {
            const mapped = designsData.map((design: any) =>
              mapDesignToProduct(design, catsData)
            );
            setProducts(mapped);
          } else {
            setProducts(PRODUCTS);
          }
        } else {
          setProducts(PRODUCTS);
        }
      } catch (err) {
        setProducts(PRODUCTS);
      } finally {
        setLoading(false);
      }
    };

    fetchCollection();
  }, []);

  // Compute dynamic filter pills (Collections pills in Collections mode, or Category pills in Wardrobe mode)
  const filterPills = useMemo(() => {
    if (isCollectionsMode) {
      // Collections view: show the collections as filters!
      const colNames = Array.from(
        new Set(customCollectionsList.map((c) => c.name).filter(Boolean))
      );
      return ["All", ...colNames];
    }

    if (activeWardrobe) {
      const isKing = activeWardrobe.toLowerCase().includes("king");
      const filteredCats = backendCategories.filter((c) => {
        const catWardrobe = c.wardrobeType || "Queen's Wardrobe";
        return isKing
          ? catWardrobe.toLowerCase().includes("king")
          : catWardrobe.toLowerCase().includes("queen");
      });

      const catNames = Array.from(new Set(filteredCats.map((c) => c.name)));
      return ["All", ...catNames];
    }

    // Default: viewing all wardrobe types
    return [
      "All",
      "Queen's Wardrobe",
      "King's Wardrobe",
      ...Array.from(new Set(backendCategories.map((c) => c.name))),
    ];
  }, [
    isCollectionsMode,
    activeWardrobe,
    customCollectionsList,
    backendCategories,
    products,
  ]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // 1. Collections Mode: Scope by Custom Collection
    if (isCollectionsMode) {
      if (activeCollection && activeCollection !== "All") {
        const colLower = activeCollection.trim().toLowerCase();
        result = result.filter((p) => {
          const pCustom = (p.customCollection || "").trim().toLowerCase();
          return pCustom === colLower || pCustom.includes(colLower);
        });
      } else {
        // "All" collections: prioritize garments belonging to custom collections
        const colGarments = result.filter((p) => Boolean(p.customCollection));
        if (colGarments.length > 0) {
          result = colGarments;
        }
      }
    }
    // 2. Scope by Wardrobe Type
    else if (activeWardrobe) {
      const isKing = activeWardrobe.toLowerCase().includes("king");
      result = result.filter((p) => {
        const pDefault = (p.defaultCollection || "Queen's Wardrobe").toLowerCase();
        return isKing ? pDefault.includes("king") : pDefault.includes("queen");
      });

      // Filter by category within that wardrobe
      if (selectedCategory !== "All") {
        const catLower = selectedCategory.trim().toLowerCase();
        result = result.filter(
          (p) => (p.category || "").trim().toLowerCase() === catLower
        );
      }
    }
    // 3. Fallback general category filter
    else if (selectedCategory !== "All") {
      const catLower = selectedCategory.trim().toLowerCase();
      if (catLower.includes("queen")) {
        result = result.filter((p) =>
          (p.defaultCollection || "Queen's Wardrobe").toLowerCase().includes("queen")
        );
      } else if (catLower.includes("king")) {
        result = result.filter((p) =>
          (p.defaultCollection || "Queen's Wardrobe").toLowerCase().includes("king")
        );
      } else {
        result = result.filter(
          (p) => (p.category || "").trim().toLowerCase() === catLower
        );
      }
    }

    // Price filtering
    result = result.filter(
      (p) =>
        (p.discountPrice || p.basePrice) >= priceRange[0] &&
        (p.discountPrice || p.basePrice) <= priceRange[1]
    );

    // Sorting
    if (sortBy === "price-low") {
      result.sort(
        (a, b) =>
          (a.discountPrice || a.basePrice) - (b.discountPrice || b.basePrice)
      );
    } else if (sortBy === "price-high") {
      result.sort(
        (a, b) =>
          (b.discountPrice || b.basePrice) - (a.discountPrice || a.basePrice)
      );
    }

    return result;
  }, [
    isCollectionsMode,
    activeCollection,
    activeWardrobe,
    selectedCategory,
    priceRange,
    sortBy,
    products,
  ]);

  const activeCollectionObj = useMemo(() => {
    if (!activeCollection) return null;
    return customCollectionsList.find(
      (c) => c.name.toLowerCase() === activeCollection.toLowerCase()
    );
  }, [activeCollection, customCollectionsList]);

  const handlePillClick = (pill: string) => {
    if (isCollectionsMode) {
      if (pill === "All") {
        setActiveCollection(null);
        router.push("/shop?view=collections");
      } else {
        setActiveCollection(pill);
        router.push(
          `/shop?view=collections&collection=${encodeURIComponent(pill)}`
        );
      }
      return;
    }

    if (!activeWardrobe) {
      if (pill.includes("Queen")) {
        setActiveWardrobe("Queen's Wardrobe");
        setSelectedCategory("All");
        router.push("/shop?wardrobe=Queen%27s%20Wardrobe");
        return;
      }
      if (pill.includes("King")) {
        setActiveWardrobe("King's Wardrobe");
        setSelectedCategory("All");
        router.push("/shop?wardrobe=King%27s%20Wardrobe");
        return;
      }
    }

    setSelectedCategory(pill);
    if (activeWardrobe) {
      if (pill === "All") {
        router.push(`/shop?wardrobe=${encodeURIComponent(activeWardrobe)}`);
      } else {
        router.push(
          `/shop?wardrobe=${encodeURIComponent(activeWardrobe)}&category=${encodeURIComponent(pill)}`
        );
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0612] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative h-8 w-28 mx-auto animate-pulse">
            <Image
              src="/assets/1.1.png"
              alt="CEYRAA"
              fill
              className="object-contain"
            />
          </div>
          <p className="text-xs uppercase tracking-[0.25em] text-zinc-400 font-light">
            Loading Wardrobe...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-[#F7F5FA]">
      <Navbar />
      <AuthModal />

      <main className="max-w-[1700px] mx-auto px-6 sm:px-10 lg:px-12 pt-32 pb-24">
        {/* Header Section */}
        <div className="flex flex-col space-y-8 mb-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/10 pb-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] tracking-[0.25em] text-[#D4AF37] uppercase font-semibold">
                  {isCollectionsMode
                    ? "Curated Series"
                    : activeWardrobe || "The Wardrobe"}
                </span>
                {isCollectionsMode && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] font-medium border border-[#D4AF37]/30">
                    Collections
                  </span>
                )}
                {activeWardrobe && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-zinc-300 font-medium border border-white/10">
                    {activeWardrobe}
                  </span>
                )}
              </div>

              <h1 className="font-headline text-3xl sm:text-5xl font-normal text-white uppercase tracking-tight">
                {isCollectionsMode
                  ? activeCollection || "Atelier Collections"
                  : activeWardrobe
                  ? selectedCategory === "All"
                    ? activeWardrobe
                    : selectedCategory
                  : selectedCategory === "All"
                  ? "Full Collection"
                  : selectedCategory}
              </h1>

              <p className="text-xs tracking-wider text-zinc-400 font-light max-w-xl">
                {activeCollectionObj?.description
                  ? activeCollectionObj.description
                  : isCollectionsMode
                  ? "Explore curated seasonal capsules and thematic atelier collections."
                  : activeWardrobe?.includes("King")
                  ? "Refined tailoring, poplin shirts, and modern everyday essentials."
                  : activeWardrobe?.includes("Queen")
                  ? "Fluid dresses, evening silhouettes, and relaxed everyday grace."
                  : "Tailored dresses, shirts, and everyday refined attire."}
              </p>
            </div>

            {/* Total Count & Sorting */}
            <div className="flex items-center gap-4">
              <span className="text-xs tracking-wider text-zinc-400 font-light">
                {filteredProducts.length} Pieces
              </span>

              <div className="flex items-center gap-2 calm-glass px-4 py-2 rounded-full border border-white/10">
                <span className="text-[11px] text-zinc-400 font-light">
                  Sort:
                </span>

                <Select value={sortBy} onValueChange={setBy}>
                  <SelectTrigger className="w-[130px] border-none bg-transparent rounded-none text-xs tracking-wider focus:ring-0 h-auto p-0 font-medium text-white">
                    <SelectValue placeholder="Latest" />
                  </SelectTrigger>

                  <SelectContent className="rounded-xl border border-white/15 bg-[#140C24] text-white shadow-xl">
                    <SelectItem value="latest">Latest</SelectItem>
                    <SelectItem value="price-low">
                      Price: Low to High
                    </SelectItem>
                    <SelectItem value="price-high">
                      Price: High to Low
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Category / Collection Filter Pills */}
          {filterPills.length > 0 && (
            <div className="flex gap-2.5 overflow-x-auto pb-2 no-scrollbar">
              {filterPills.map((pill) => {
                const isSelected = isCollectionsMode
                  ? (activeCollection ? activeCollection.toLowerCase() === pill.toLowerCase() : pill === "All")
                  : selectedCategory === pill;
                return (
                  <button
                    key={pill}
                    onClick={() => handlePillClick(pill)}
                    className={`text-[11px] tracking-wider uppercase whitespace-nowrap px-5 py-2 rounded-full border transition-all duration-300 font-medium ${
                      isSelected
                        ? "calm-primary-btn border-white shadow-md shadow-[#D4AF37]/10"
                        : "calm-glass text-zinc-300 border-white/10 hover:border-white/30 hover:text-white"
                    }`}
                  >
                    {pill}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 space-y-4 text-center calm-card rounded-2xl p-10 my-8">
            <SlidersHorizontal className="h-6 w-6 text-zinc-500" />
            <p className="text-xs uppercase tracking-widest text-zinc-400 font-light">
              No garments found matching this selection
            </p>
            <button
              onClick={() => setSelectedCategory("All")}
              className="calm-secondary-btn px-6 py-2 rounded-full text-xs uppercase tracking-wider font-medium"
            >
              Reset Filters
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
