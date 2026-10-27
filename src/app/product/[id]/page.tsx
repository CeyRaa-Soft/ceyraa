"use client";

import { use, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import AuthModal from "@/components/auth/AuthModal";
import { useAuthStore, useCartStore, useUIStore } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import OutfitSuggestions from "@/components/ai/OutfitSuggestions";
import {
  ShoppingBag,
  Heart,
  ShieldCheck,
  Truck,
  ZoomIn,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  X,
  Play,
  Scan,
  Ruler,
} from "lucide-react";
import { Product } from "@/lib/types";
import { mapDesignToProduct } from "@/lib/productMapper";
import { PRODUCTS } from "@/lib/data";

export default function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user } = useAuthStore();
  const { setAuthModal } = useUIStore();
  const { addItem } = useCartStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  // Gallery & Interactive Zoom States
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [isVideoActive, setIsVideoActive] = useState(false);
  const [imageFit, setImageFit] = useState<"contain" | "cover">("cover");
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [zoomedIndex, setZoomedIndex] = useState<number | null>(null);
  const [zoomPoss, setZoomPoss] = useState<{ [idx: number]: { x: number; y: number } }>({});
  const [pendingAddToCart, setPendingAddToCart] = useState(false);

  // Reset active image when color variant changes
  useEffect(() => {
    setActiveImageIdx(0);
    setIsVideoActive(false);
  }, [selectedColorIdx]);

  useEffect(() => {
    const loadProductData = async () => {
      try {
        setLoading(true);
        const API_URL =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

        // Fetch categories and the specific design
        const [catsRes, designRes] = await Promise.all([
          fetch(`${API_URL}/api/admin/dress-categories`),
          fetch(`${API_URL}/api/admin/designs/${id}`),
        ]);

        if (catsRes.ok && designRes.ok) {
          const catsData = await catsRes.json();
          const design = await designRes.json();

          if (design && !design.error && design.id) {
            const mappedProduct = mapDesignToProduct(design, catsData);
            setProduct(mappedProduct);
            return;
          }
        }

        // Fallback to local data
        const localProd = PRODUCTS.find((p) => p.id === id) || PRODUCTS[0];
        setProduct(localProd);
      } catch (err) {
        const localProd = PRODUCTS.find((p) => p.id === id) || PRODUCTS[0];
        setProduct(localProd);
      } finally {
        setLoading(false);
      }
    };

    loadProductData();
  }, [id]);

  const currentVariant = product?.variants[selectedColorIdx] || {
    color: "#1E1236",
    colorName: "Classic",
    images: [
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80",
    ],
    sizes: [],
  };

  const imagesList = currentVariant.images || [];
  const currentVideo = currentVariant.mediaVideoUrl || product?.mediaVideoUrl;
  const hasRealImage =
    imagesList.length > 0 && !imagesList[0].includes("placehold.co");

  const handlePrevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsVideoActive(false);
    setActiveImageIdx((prev) =>
      prev === 0 ? imagesList.length - 1 : prev - 1,
    );
  };

  const handleNextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsVideoActive(false);
    setActiveImageIdx((prev) =>
      prev === imagesList.length - 1 ? 0 : prev + 1,
    );
  };

  // Keyboard navigation for Lightbox (called unconditionally)
  useEffect(() => {
    if (!isLightboxOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsLightboxOpen(false);
      if (e.key === "ArrowLeft") handlePrevImage();
      if (e.key === "ArrowRight") handleNextImage();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen, imagesList.length]);

  // Auto-add to bag when user logs in after attempting Add to Bag
  useEffect(() => {
    if (user && pendingAddToCart && product) {
      setPendingAddToCart(false);
      const curVariant = product.variants[selectedColorIdx] || product.variants[0];
      if (selectedSize && curVariant) {
        addItem({
          productId: product.id,
          productName: product.name,
          color: curVariant.colorName,
          size: selectedSize,
          price: product.discountPrice || product.basePrice,
          quantity: 1,
          image:
            curVariant.images[0] ||
            "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80",
        });

        toast({
          title: "Added to Bag",
          description: `${product.name} (${curVariant.colorName} / ${selectedSize}) has been added to your shopping bag.`,
        });
      }
    }
  }, [user, pendingAddToCart, product, selectedColorIdx, selectedSize, addItem]);

  // Auto-select size if only one size exists, or validate selectedSize
  useEffect(() => {
    if (!currentVariant?.sizes?.length) return;
    if (currentVariant.sizes.length === 1) {
      setSelectedSize(currentVariant.sizes[0].size);
    } else if (selectedSize) {
      const exists = currentVariant.sizes.some((s) => s.size === selectedSize);
      if (!exists) {
        setSelectedSize(null);
      }
    }
  }, [currentVariant?.sizes, selectedSize]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    });
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
            Loading Garment...
          </p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#0A0612] flex flex-col items-center justify-center text-center space-y-4">
        <Navbar />
        <h2 className="font-headline text-2xl font-normal text-white">
          Piece Not Found
        </h2>
        <p className="text-xs uppercase tracking-widest text-zinc-400">
          This garment is currently unavailable.
        </p>
        <Link
          href="/shop"
          className="calm-primary-btn px-6 py-2 rounded-full text-xs uppercase tracking-wider font-semibold"
        >
          Return to Collection
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast({
        title: "Select a Size",
        description: "Please choose your desired size.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      setPendingAddToCart(true);
      toast({
        title: "Sign In Required",
        description: "Please sign in or create an account to add items to your shopping bag.",
      });
      setAuthModal(true);
      return;
    }

    addItem({
      productId: product.id,
      productName: product.name,
      color: currentVariant.colorName,
      size: selectedSize,
      price: product.discountPrice || product.basePrice,
      quantity: 1,
      image:
        currentVariant.images[0] ||
        "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80",
    });

    toast({
      title: "Added to Bag",
      description: `${product.name} (${currentVariant.colorName} / ${selectedSize}) has been added to your shopping bag.`,
    });
  };

  // Toggle zoom on a specific image index

  const handleGalleryMouseMove = (idx: number, e: React.MouseEvent<HTMLDivElement>) => {
    if (zoomedIndex !== idx) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPoss((prev) => ({
      ...prev,
      [idx]: {
        x: Math.max(0, Math.min(100, x)),
        y: Math.max(0, Math.min(100, y)),
      },
    }));
  };

  const toggleZoomOnImage = (idx: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (zoomedIndex === idx) {
      setZoomedIndex(null);
    } else {
      setZoomedIndex(idx);
      if (!zoomPoss[idx]) {
        setZoomPoss((prev) => ({ ...prev, [idx]: { x: 50, y: 50 } }));
      }
    }
  };

  return (
    <div className="min-h-screen text-[#F7F5FA] pb-32">
      <Navbar />
      <AuthModal />

      <main className="max-w-[1600px] mx-auto pt-24 lg:pt-28 px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center space-x-2 text-[11px] text-zinc-400 mb-6">
          <Link href="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <span className="text-zinc-600">/</span>
          <Link href="/shop" className="hover:text-white transition-colors">
            Wardrobe
          </Link>
          <span className="text-zinc-600">/</span>
          <span className="text-zinc-200">{product.name}</span>
        </div>

        {/* 2/3 Gallery & 1/3 Details Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* 2/3 Gallery Column (lg:col-span-8) */}
          <div className="lg:col-span-8 w-full">
            {hasRealImage ? (
              <div className="space-y-4">
                {/* Independent Scrollable Gallery Container with 2 Images Per Row */}
                <div className="max-h-[calc(100vh-8.5rem)] overflow-y-auto pr-2 sm:pr-3 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 items-start">
                    {/* All Images in 2-per-row grid */}
                    {imagesList.map((img, idx) => {
                      const isCurZoomed = zoomedIndex === idx;
                      const curPos = zoomPoss[idx] || { x: 50, y: 50 };

                      return (
                        <div
                          key={idx}
                          className="relative w-full aspect-[3/4] bg-[#0E071A] overflow-hidden rounded-3xl border border-white/10 group shadow-xl"
                        >
                          <div
                            className={cn(
                              "relative w-full h-full overflow-hidden select-none transition-all",
                              isCurZoomed ? "cursor-zoom-out" : "cursor-zoom-in"
                            )}
                            onMouseMove={(e) => handleGalleryMouseMove(idx, e)}
                            onClick={(e) => toggleZoomOnImage(idx, e)}
                          >
                            <div
                              className="w-full h-full relative transition-transform duration-100 ease-out will-change-transform"
                              style={{
                                transformOrigin: `${curPos.x}% ${curPos.y}%`,
                                transform: isCurZoomed ? "scale(2.4)" : "scale(1)",
                              }}
                            >
                              <Image
                                src={img}
                                alt={`${product.name} view ${idx + 1}`}
                                fill
                                priority={idx === 0}
                                unoptimized={true}
                                sizes="(max-width: 1024px) 100vw, 600px"
                                className="object-cover object-top transition-all duration-300"
                              />
                            </div>

                            {/* Image Index Tag */}
                            <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 pointer-events-none">
                              <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-mono text-zinc-300 border border-white/10 shadow-sm">
                                0{idx + 1}
                              </span>
                            </div>

                            {/* Action Buttons: Zoom Icon & Fullscreen Lightbox */}
                            <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
                              {/* In-place Zoom Toggle Icon */}
                              <button
                                type="button"
                                onClick={(e) => toggleZoomOnImage(idx, e)}
                                className={cn(
                                  "p-2 rounded-full backdrop-blur-md border transition-all shadow-md flex items-center justify-center",
                                  isCurZoomed
                                    ? "bg-[#D4AF37] text-black border-[#D4AF37] ring-2 ring-[#D4AF37]/50"
                                    : "bg-black/60 hover:bg-black/85 text-zinc-300 hover:text-white border-white/10"
                                )}
                                title={isCurZoomed ? "Click to reset zoom" : "Click to zoom"}
                              >
                                <ZoomIn className={cn("w-3.5 h-3.5", isCurZoomed ? "text-black" : "text-[#D4AF37]")} />
                              </button>

                              {/* Fullscreen Expand */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveImageIdx(idx);
                                  setIsLightboxOpen(true);
                                }}
                                className="p-2 rounded-full bg-black/60 hover:bg-black/85 backdrop-blur-md text-zinc-300 hover:text-white border border-white/10 transition-all shadow-md"
                                title="Fullscreen high-res view"
                              >
                                <Maximize2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Zoom Status Hint */}
                            {isCurZoomed && (
                              <div className="absolute bottom-3 right-3 z-10 px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md text-[10px] font-medium text-[#D4AF37] border border-[#D4AF37]/50 pointer-events-none flex items-center gap-1">
                                <ZoomIn className="w-3 h-3 text-[#D4AF37]" />
                                <span>Zoomed (2.4x)</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {/* Color Variant GIF or Video Slot in the 2-per-row grid */}
                    {currentVideo && (
                      <div className="relative w-full aspect-[3/4] bg-[#0E071A] overflow-hidden rounded-3xl border border-white/10 shadow-xl group">
                        {currentVideo.match(/\.(gif)(\?.*)?$/i) ? (
                          <img
                            src={currentVideo}
                            alt={`${product.name} showcase`}
                            className="w-full h-full object-cover object-top"
                          />
                        ) : (
                          <video
                            src={currentVideo}
                            autoPlay
                            loop
                            muted
                            playsInline
                            controls
                            className="w-full h-full object-cover object-top"
                          />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative aspect-[3/4] w-full max-h-[calc(100vh-14rem)] bg-[#140C24] border border-white/10 rounded-3xl flex flex-col items-center justify-center p-8 space-y-3">
                <div className="relative h-7 w-28 opacity-40">
                  <Image
                    src="/assets/1.1.png"
                    alt="CEYRAA"
                    fill
                    className="object-contain"
                  />
                </div>
                <span className="text-xs uppercase tracking-widest text-zinc-400">
                  Product Image
                </span>
              </div>
            )}
          </div>

          {/* Details Column - Slim 1/3 Width (lg:col-span-4) */}
          <div className="lg:col-span-4 space-y-5 lg:sticky lg:top-28 calm-card p-5 sm:p-6 rounded-3xl border border-white/10 shadow-2xl">
            <div className="space-y-3">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <span className="text-[10px] tracking-widest uppercase text-[#D4AF37] block mb-1">
                    {product.category}
                  </span>
                  <h1 className="font-headline text-2xl sm:text-3xl font-normal text-white">
                    {product.name}
                  </h1>
                </div>
                <button
                  className="p-2.5 rounded-full calm-glass text-zinc-300 hover:text-white transition-colors"
                  aria-label="Save item"
                >
                  <Heart className="h-4 w-4" />
                </button>
              </div>

              {/* Pricing */}
              <div className="flex items-baseline space-x-3 pt-1">
                {product.discountPrice ? (
                  <>
                    <span className="text-xl font-medium text-[#D4AF37]">
                      LKR {product.discountPrice.toLocaleString()}
                    </span>
                    <span className="text-sm text-zinc-500 line-through">
                      LKR {product.basePrice.toLocaleString()}
                    </span>
                  </>
                ) : (
                  <span className="text-xl font-medium text-white">
                    LKR {product.basePrice.toLocaleString()}
                  </span>
                )}
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed font-light pt-2">
                {product.description}
              </p>
            </div>

            {/* Colors */}
            <div className="space-y-3 pt-2 border-t border-white/10">
              <div className="flex justify-between items-center text-xs tracking-wider uppercase font-medium">
                <span className="text-zinc-400">Color</span>
                <span className="text-white">{currentVariant.colorName}</span>
              </div>
              <div className="flex gap-2">
                {product.variants.map((v, i) => (
                  <button
                    key={`${v.color}-${i}`}
                    onClick={() => setSelectedColorIdx(i)}
                    className={cn(
                      "w-8 h-8 rounded-full border transition-all duration-200 overflow-hidden relative shadow-sm",
                      selectedColorIdx === i
                        ? "border-[#D4AF37] ring-2 ring-[#D4AF37]/50 scale-110"
                        : "border-white/20 opacity-70 hover:opacity-100",
                    )}
                    style={
                      !v.swatchUrl ? { backgroundColor: v.color } : undefined
                    }
                    title={v.colorName}
                  >
                    {v.swatchUrl && (
                      <img
                        src={v.swatchUrl}
                        alt={v.colorName}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Sizes */}
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center text-xs tracking-wider uppercase font-medium">
                <span className="text-zinc-400">Select Size</span>
                <button
                  type="button"
                  onClick={() => setIsSizeGuideOpen(true)}
                  className="text-xs text-[#D4AF37] hover:text-[#f3d46a] hover:underline cursor-pointer flex items-center gap-1 transition-colors"
                >
                  <Ruler className="w-3.5 h-3.5" />
                  <span>Size Guide</span>
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {currentVariant.sizes.map((s) => {
                  const isOutOfStock = s.stock === 0;
                  const isSelected = selectedSize === s.size;
                  return (
                    <button
                      key={s.size}
                      disabled={isOutOfStock}
                      onClick={() => setSelectedSize(s.size)}
                      className={cn(
                        "min-w-[2.75rem] h-11 px-3.5 rounded-xl border text-xs font-medium transition-all duration-200 flex items-center justify-center whitespace-nowrap",
                        isSelected
                          ? "calm-primary-btn border-white shadow-md shadow-[#D4AF37]/20"
                          : "calm-glass text-zinc-300 border-white/10 hover:border-white/30 hover:text-white",
                        isOutOfStock &&
                          "opacity-20 cursor-not-allowed line-through",
                      )}
                    >
                      {s.size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CTA */}
            <div className="pt-2">
              <Button
                onClick={handleAddToCart}
                className="w-full calm-primary-btn py-6 rounded-full text-xs tracking-widest uppercase font-semibold flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                Add to Bag
              </Button>
            </div>

            {/* Guarantees */}
            <div className="pt-4 border-t border-white/10 space-y-2 text-xs text-zinc-400 font-light">
              <div className="flex items-center gap-2.5">
                <Truck className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Complimentary Delivery Across Sri Lanka</span>
              </div>
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Simple 7-Day Exchange Guarantee</span>
              </div>
            </div>
          </div>
        </div>

        {/* AI Recommendations */}
        <section className="mt-32">
          <OutfitSuggestions currentItems={[product]} />
        </section>
      </main>

      {/* Fullscreen Lightbox Modal */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-between p-4 sm:p-8 animate-in fade-in duration-200 select-none"
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* Top Header */}
          <div
            className="w-full flex items-center justify-between z-10 max-w-6xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <h3 className="font-headline text-lg text-white font-light">
                {product.name}
              </h3>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/10 text-[#D4AF37] font-medium">
                {currentVariant.colorName}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-zinc-400 font-mono">
                {activeImageIdx + 1} / {imagesList.length}
              </span>
              <button
                type="button"
                onClick={() => setIsLightboxOpen(false)}
                className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="Close (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Center Image View */}
          <div
            className="relative w-full max-w-5xl h-[75vh] flex items-center justify-center my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={imagesList[activeImageIdx] || imagesList[0]}
              alt={`${product.name} fullscreen view`}
              fill
              className="object-contain"
              priority
              unoptimized={true}
              sizes="100vw"
            />

            {imagesList.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrevImage}
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/70 hover:bg-black text-white border border-white/20 transition-all z-20 shadow-lg"
                  title="Previous (Left arrow)"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  onClick={handleNextImage}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/70 hover:bg-black text-white border border-white/20 transition-all z-20 shadow-lg"
                  title="Next (Right arrow)"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          {/* Bottom Thumbnails Strip */}
          {imagesList.length > 1 && (
            <div
              className="flex items-center gap-2.5 overflow-x-auto max-w-xl pb-2 z-10"
              onClick={(e) => e.stopPropagation()}
            >
              {imagesList.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImageIdx(idx)}
                  className={cn(
                    "relative w-14 h-20 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 bg-[#120B20]",
                    activeImageIdx === idx
                      ? "border-[#D4AF37] scale-105"
                      : "border-white/20 opacity-50 hover:opacity-100",
                  )}
                >
                  <Image
                    src={img}
                    alt={`Thumb ${idx + 1}`}
                    fill
                    className="object-contain p-0.5"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Right-Hand Sliding Size Guide Sidebar */}
      {isSizeGuideOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end animate-in fade-in duration-200"
          onClick={() => setIsSizeGuideOpen(false)}
        >
          <div
            className="w-full sm:max-w-xl md:max-w-2xl lg:max-w-[720px] xl:max-w-[780px] bg-[#0E071A] border-l border-white/10 h-full overflow-y-auto p-6 sm:p-8 md:p-10 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300 select-text"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-5 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#D4AF37]/10 text-[#D4AF37]">
                  <Ruler className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-headline text-lg sm:text-xl font-normal text-white">
                    Size & Fitting Guide
                  </h3>
                  <p className="text-[11px] text-zinc-400 font-light">
                    {product.name} ({product.category})
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsSizeGuideOpen(false)}
                className="p-2 rounded-full bg-white/5 hover:bg-white/15 text-zinc-300 hover:text-white transition-colors"
                title="Close (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Area */}
            <div className="py-6 space-y-6 flex-1">
              {/* Guidance / Measurement text */}
              {product.sizeChartText ? (
                <div className="calm-card p-4 sm:p-5 rounded-2xl border border-white/10 space-y-2">
                  <span className="text-[10px] uppercase tracking-widest font-semibold text-[#D4AF37]">
                    Measurements & Sizing Advice
                  </span>
                  <p className="text-xs sm:text-sm text-zinc-200 font-light leading-relaxed whitespace-pre-line">
                    {product.sizeChartText}
                  </p>
                </div>
              ) : (
                <div className="calm-card p-4 sm:p-5 rounded-2xl border border-white/10 space-y-2">
                  <span className="text-[10px] uppercase tracking-widest font-semibold text-[#D4AF37]">
                    General Fit Information
                  </span>
                  <p className="text-xs text-zinc-300 font-light leading-relaxed">
                    Designed to standard international sizing. For relaxed looks or if you are between two sizes, we recommend sizing up.
                  </p>
                </div>
              )}

              {/* Size Chart Image or Diagram - Displayed in full native resolution without cropping */}
              {product.sizeChartImageUrl ? (
                <div className="space-y-2.5">
                  <span className="text-[10px] uppercase tracking-widest font-semibold text-zinc-400 block">
                    Garment Size Chart
                  </span>

                  {/* Clean uncropped container preserving natural width/height ratio and crisp text */}
                  <div className="relative w-full rounded-2xl overflow-hidden border border-white/10 bg-[#120B20] p-2 sm:p-3 shadow-xl">
                    <img
                      src={product.sizeChartImageUrl}
                      alt={`${product.name} size chart`}
                      className="w-full h-auto max-h-[75vh] object-contain rounded-xl mx-auto"
                    />
                  </div>
                </div>
              ) : (
                /* Fallback standard garment chart preview if no custom diagram is uploaded */
                <div className="space-y-3">
                  <span className="text-[10px] uppercase tracking-widest font-semibold text-zinc-400 block">
                    Standard Measurements Reference (Inches)
                  </span>
                  <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#120B20]">
                    <table className="w-full text-[11px] text-left">
                      <thead className="bg-white/5 text-[#D4AF37] uppercase text-[10px] tracking-wider">
                        <tr>
                          <th className="px-4 py-3">Size</th>
                          <th className="px-4 py-3">Bust / Chest</th>
                          <th className="px-4 py-3">Waist</th>
                          <th className="px-4 py-3">Hips</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-zinc-300 font-light">
                        <tr>
                          <td className="px-4 py-2.5 font-medium text-white">XS</td>
                          <td className="px-4 py-2.5">31 - 32&quot;</td>
                          <td className="px-4 py-2.5">24 - 25&quot;</td>
                          <td className="px-4 py-2.5">34 - 35&quot;</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2.5 font-medium text-white">S</td>
                          <td className="px-4 py-2.5">33 - 34&quot;</td>
                          <td className="px-4 py-2.5">26 - 27&quot;</td>
                          <td className="px-4 py-2.5">36 - 37&quot;</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2.5 font-medium text-white">M</td>
                          <td className="px-4 py-2.5">35 - 36&quot;</td>
                          <td className="px-4 py-2.5">28 - 29&quot;</td>
                          <td className="px-4 py-2.5">38 - 39&quot;</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2.5 font-medium text-white">L</td>
                          <td className="px-4 py-2.5">37 - 39&quot;</td>
                          <td className="px-4 py-2.5">30 - 32&quot;</td>
                          <td className="px-4 py-2.5">40 - 42&quot;</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2.5 font-medium text-white">XL</td>
                          <td className="px-4 py-2.5">40 - 42&quot;</td>
                          <td className="px-4 py-2.5">33 - 35&quot;</td>
                          <td className="px-4 py-2.5">43 - 45&quot;</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Tips Section */}
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-1.5 text-xs text-zinc-400 font-light">
                <span className="font-medium text-white text-[11px] block">How to Measure:</span>
                <p>• <strong>Bust / Chest:</strong> Measure around the fullest part of your chest.</p>
                <p>• <strong>Waist:</strong> Measure around your natural waistline.</p>
                <p>• <strong>Hips:</strong> Measure around the fullest point of your hips.</p>
              </div>
            </div>

            {/* Bottom button */}
            <div className="pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsSizeGuideOpen(false)}
                className="w-full calm-primary-btn py-3.5 rounded-full text-xs uppercase tracking-widest font-semibold"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
