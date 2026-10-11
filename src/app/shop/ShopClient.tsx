"use client";

import { useState, useMemo, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import AuthModal from "@/components/auth/AuthModal";
import ProductCard from "@/components/product/ProductCard";
import { mapDesignToProduct } from "@/lib/productMapper";
import { PRODUCTS } from "@/lib/data";
import { Product } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SlidersHorizontal } from "lucide-react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";

export default function ShopClient() {
  const searchParams = useSearchParams();

  const [sortBy, setBy] = useState("latest");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [priceRange] = useState<[number, number]>([0, 500000]);

  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [categories, setCategories] = useState<string[]>([
    "All",
    "Queen's Wardrobe",
    "King's Wardrobe",
    "Outerwear",
    "New Arrivals",
  ]);
  const [loading, setLoading] = useState(true);

  // Sync query parameter safely
  useEffect(() => {
    const category = searchParams.get("category");
    if (category) {
      setSelectedCategory(category);
    }
  }, [searchParams]);

  // Fetch categories and designs from backend with fallback
  useEffect(() => {
    const fetchCollection = async () => {
      try {
        setLoading(true);
        const API_URL =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
        const [catsRes, designsRes] = await Promise.all([
          fetch(`${API_URL}/api/admin/dress-categories`),
          fetch(`${API_URL}/api/admin/designs`),
        ]);

        if (catsRes.ok && designsRes.ok) {
          const catsData = await catsRes.json();
          const designsData = await designsRes.json();

          if (Array.isArray(catsData) && catsData.length > 0) {
            setCategories(["All", ...catsData.map((c: any) => c.name)]);
          }

          if (Array.isArray(designsData) && designsData.length > 0) {
            const mapped = designsData.map((design: any) =>
              mapDesignToProduct(design, catsData),
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

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (selectedCategory !== "All") {
      if (selectedCategory === "New Arrivals") {
        result = result.filter((p) => p.isNew);
      } else {
        const catLower = selectedCategory.toLowerCase();
        result = result.filter((p) => {
          const matchCategory =
            p.category?.toLowerCase().includes(catLower) ||
            catLower.includes(p.category?.toLowerCase() || "");
          const matchDefault =
            p.defaultCollection?.toLowerCase().includes(catLower) ||
            catLower.includes(p.defaultCollection?.toLowerCase() || "");
          const matchCustom =
            p.customCollection?.toLowerCase().includes(catLower) ||
            catLower.includes(p.customCollection?.toLowerCase() || "");
          return matchCategory || matchDefault || matchCustom;
        });
      }
    }

    result = result.filter(
      (p) =>
        (p.discountPrice || p.basePrice) >= priceRange[0] &&
        (p.discountPrice || p.basePrice) <= priceRange[1],
    );

    if (sortBy === "price-low") {
      result.sort(
        (a, b) =>
          (a.discountPrice || a.basePrice) - (b.discountPrice || b.basePrice),
      );
    }

    if (sortBy === "price-high") {
      result.sort(
        (a, b) =>
          (b.discountPrice || b.basePrice) - (a.discountPrice || a.basePrice),
      );
    }

    return result;
  }, [selectedCategory, priceRange, sortBy, products]);

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
            Loading Collection...
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
              <span className="text-[10px] tracking-[0.25em] text-[#D4AF37] uppercase font-medium">
                The Wardrobe
              </span>

              <h1 className="font-headline text-3xl sm:text-5xl font-normal text-white uppercase">
                {selectedCategory === "All"
                  ? "Full Collection"
                  : selectedCategory}
              </h1>
              <p className="text-xs tracking-wider text-zinc-400 font-light">
                Tailored dresses, shirts, and everyday refined attire
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

          {/* Category Filter Pills */}
          <div className="flex gap-2.5 overflow-x-auto pb-2 no-scrollbar">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-[11px] tracking-wider uppercase whitespace-nowrap px-5 py-2 rounded-full border transition-all duration-300 font-medium ${
                    isSelected
                      ? "calm-primary-btn border-white"
                      : "calm-glass text-zinc-300 border-white/10 hover:border-white/30 hover:text-white"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
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
