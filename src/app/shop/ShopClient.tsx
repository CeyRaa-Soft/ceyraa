"use client";

import { useState, useMemo, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import AuthModal from "@/components/auth/AuthModal";
import { PRODUCTS } from "@/lib/data";
import ProductCard from "@/components/product/ProductCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SlidersHorizontal } from "lucide-react";
import { useSearchParams } from "next/navigation";

export default function ShopClient() {
  const searchParams = useSearchParams();

  const [sortBy, setBy] = useState("latest");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);

  const categories = [
    "All",
    "Outerwear",
    "Dresses",
    "Knitwear",
    "Accessories",
    "Footwear",
  ];

  // ✅ FIX: sync query param safely (no hydration issue)
  useEffect(() => {
    const category = searchParams.get("category");
    if (category) {
      setSelectedCategory(category);
    }
  }, [searchParams]);

  const filteredProducts = useMemo(() => {
    let result = [...PRODUCTS];

    if (selectedCategory !== "All") {
      if (selectedCategory === "New Arrivals") {
        result = result.filter((p) => p.isNew);
      } else {
        result = result.filter((p) => p.category === selectedCategory);
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
  }, [selectedCategory, priceRange, sortBy]);

  return (
    <div className="min-h-screen bg-mesh">
      <Navbar />
      <AuthModal />

      <main className="max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-12 py-20">
        {/* HEADER */}
        <div className="flex flex-col space-y-12 mb-20">
          <div className="flex flex-col md:flex-row justify-between items-end gap-8">
            <div className="space-y-4">
              <span className="text-[10px] tracking-[0.5em] font-bold text-accent uppercase">
                Explore
              </span>

              <h1 className="font-headline text-5xl md:text-7xl tracking-tighter uppercase leading-none">
                {selectedCategory === "All"
                  ? "The Collection"
                  : selectedCategory}
              </h1>
            </div>

            <div className="flex flex-col md:items-end gap-4">
              <span className="text-[10px] tracking-widest text-muted-foreground uppercase font-bold">
                {filteredProducts.length} Pieces
              </span>

              <div className="flex items-center gap-4 bg-white/50 backdrop-blur-md px-6 py-3 rounded-full border border-white/40 shadow-sm">
                <span className="text-[10px] tracking-widest text-muted-foreground uppercase font-black">
                  Sort By
                </span>

                <Select value={sortBy} onValueChange={setBy}>
                  <SelectTrigger className="w-[180px] border-none bg-transparent rounded-none text-[10px] uppercase tracking-[0.2em] focus:ring-0 h-auto p-0 font-bold">
                    <SelectValue placeholder="Latest" />
                  </SelectTrigger>

                  <SelectContent className="rounded-2xl border-none shadow-2xl">
                    <SelectItem value="latest">Latest</SelectItem>
                    <SelectItem value="price-low">Price Low</SelectItem>
                    <SelectItem value="price-high">Price High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* CATEGORY FILTER */}
          <div className="flex flex-wrap items-center gap-4 py-6 border-y border-primary/5">
            <div className="flex gap-4 overflow-x-auto no-scrollbar py-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-[10px] tracking-[0.3em] uppercase whitespace-nowrap px-8 py-3 rounded-full border transition-all duration-500 font-bold ${
                    selectedCategory === cat
                      ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                      : "bg-white/40 text-primary border-transparent hover:border-accent hover:text-accent"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* PRODUCTS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-24">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* EMPTY STATE */}
        {filteredProducts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-60 space-y-8">
            <div className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center">
              <SlidersHorizontal className="h-6 w-6 text-muted-foreground/30" />
            </div>

            <p className="text-xs font-medium uppercase tracking-[0.4em] text-muted-foreground/60">
              No pieces match your selection
            </p>

            <button
              onClick={() => setSelectedCategory("All")}
              className="text-[10px] tracking-[0.4em] uppercase font-bold text-accent hover:underline underline-offset-8"
            >
              Reset Filters
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
