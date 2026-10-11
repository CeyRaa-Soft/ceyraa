"use client";

import { use, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import AuthModal from '@/components/auth/AuthModal';
import { useAuthStore, useCartStore, useUIStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import OutfitSuggestions from '@/components/ai/OutfitSuggestions';
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
  Scan 
} from 'lucide-react';
import { Product } from '@/lib/types';
import { mapDesignToProduct } from '@/lib/productMapper';
import { PRODUCTS } from '@/lib/data';

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
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
  const [imageFit, setImageFit] = useState<'contain' | 'cover'>('contain');
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Reset active image when color variant changes
  useEffect(() => {
    setActiveImageIdx(0);
    setIsVideoActive(false);
  }, [selectedColorIdx]);

  useEffect(() => {
    const loadProductData = async () => {
      try {
        setLoading(true);
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
        
        // Fetch categories and the specific design
        const [catsRes, designRes] = await Promise.all([
          fetch(`${API_URL}/api/admin/dress-categories`),
          fetch(`${API_URL}/api/admin/designs/${id}`)
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
        <h2 className="font-headline text-2xl font-normal text-white">Piece Not Found</h2>
        <p className="text-xs uppercase tracking-widest text-zinc-400">This garment is currently unavailable.</p>
        <Link href="/shop" className="calm-primary-btn px-6 py-2 rounded-full text-xs uppercase tracking-wider font-semibold">
          Return to Collection
        </Link>
      </div>
    );
  }

  const currentVariant = product.variants[selectedColorIdx] || {
    color: "#1E1236",
    colorName: "Classic",
    images: ["https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80"],
    sizes: []
  };

  const imagesList = currentVariant.images || [];
  const hasRealImage = imagesList.length > 0 && !imagesList[0].includes("placehold.co");

  const handlePrevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsVideoActive(false);
    setActiveImageIdx((prev) => (prev === 0 ? imagesList.length - 1 : prev - 1));
  };

  const handleNextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsVideoActive(false);
    setActiveImageIdx((prev) => (prev === imagesList.length - 1 ? 0 : prev + 1));
  };

  useEffect(() => {
    if (!isLightboxOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsLightboxOpen(false);
      if (e.key === 'ArrowLeft') handlePrevImage();
      if (e.key === 'ArrowRight') handleNextImage();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, imagesList.length]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    });
  };

  const handleAddToCart = () => {
    if (!user) {
      setAuthModal(true);
      return;
    }
    if (!selectedSize) {
      toast({ title: "Select a Size", description: "Please choose your desired size.", variant: "destructive" });
      return;
    }
    
    addItem({
      productId: product.id,
      productName: product.name,
      color: currentVariant.colorName,
      size: selectedSize,
      price: product.discountPrice || product.basePrice,
      quantity: 1,
      image: currentVariant.images[0] || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80"
    });

    toast({ 
      title: "Added to Bag", 
      description: `${product.name} (${currentVariant.colorName} / ${selectedSize}) has been added.` 
    });
  };

  return (
    <div className="min-h-screen text-[#F7F5FA] pb-32">
      <Navbar />
      <AuthModal />
      
      <main className="max-w-[1700px] mx-auto pt-32 px-6 lg:px-12">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center space-x-2 text-[11px] text-zinc-400 mb-10">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <span className="text-zinc-600">/</span>
          <Link href="/shop" className="hover:text-white transition-colors">Wardrobe</Link>
          <span className="text-zinc-600">/</span>
          <span className="text-zinc-200">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Gallery View */}
          <div className="lg:col-span-7 space-y-4">
            {hasRealImage ? (
              <>
                {/* Main Image Stage with Interactive Hover Zoom */}
                <div className="relative aspect-[3/4] w-full bg-[#120B20] overflow-hidden rounded-3xl border border-white/10 group select-none shadow-2xl">
                  {isVideoActive && product.mediaVideoUrl ? (
                    <div className="w-full h-full flex items-center justify-center bg-black/80">
                      <video
                        src={product.mediaVideoUrl}
                        autoPlay
                        loop
                        muted
                        playsInline
                        controls
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ) : (
                    <div
                      className="relative w-full h-full overflow-hidden cursor-crosshair"
                      onMouseMove={handleMouseMove}
                      onMouseEnter={() => setIsZoomed(true)}
                      onMouseLeave={() => {
                        setIsZoomed(false);
                        setZoomPos({ x: 50, y: 50 });
                      }}
                      onClick={() => setIsLightboxOpen(true)}
                    >
                      <div
                        className="w-full h-full relative transition-transform duration-100 ease-out will-change-transform"
                        style={{
                          transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                          transform: isZoomed ? 'scale(2.3)' : 'scale(1)',
                        }}
                      >
                        <Image
                          src={imagesList[activeImageIdx] || imagesList[0]}
                          alt={`${product.name} view ${activeImageIdx + 1}`}
                          fill
                          priority
                          sizes="(max-width: 1024px) 100vw, 60vw"
                          className={cn(
                            "transition-all duration-300",
                            imageFit === 'contain'
                              ? "object-contain p-2 sm:p-4"
                              : "object-cover object-center"
                          )}
                        />
                      </div>

                      {/* Top Badges: Fit Mode Toggle & Fullscreen */}
                      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 pointer-events-auto">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setImageFit((prev) => (prev === 'contain' ? 'cover' : 'contain'));
                          }}
                          className="px-3 py-1.5 rounded-full bg-black/60 hover:bg-black/85 backdrop-blur-md text-[11px] font-medium tracking-wide text-zinc-300 hover:text-white border border-white/10 flex items-center gap-1.5 transition-all shadow-sm"
                          title={imageFit === 'contain' ? "Switch to Fill Frame" : "Switch to Uncropped Full Dress View"}
                        >
                          <Scan className="w-3.5 h-3.5 text-[#D4AF37]" />
                          <span>{imageFit === 'contain' ? "Full Dress (Uncropped)" : "Fill Frame"}</span>
                        </button>
                      </div>

                      <div className="absolute top-4 right-4 z-10 flex items-center gap-2 pointer-events-auto">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsLightboxOpen(true);
                          }}
                          className="p-2.5 rounded-full bg-black/60 hover:bg-black/85 backdrop-blur-md text-zinc-300 hover:text-white border border-white/10 transition-all shadow-sm"
                          title="Fullscreen high-res view"
                        >
                          <Maximize2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Hover Zoom Hint */}
                      <div 
                        className={cn(
                          "absolute bottom-4 right-4 z-10 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-[11px] font-medium tracking-wide text-zinc-300 border border-white/10 flex items-center gap-1.5 pointer-events-none transition-opacity duration-200",
                          isZoomed ? "opacity-0" : "opacity-90"
                        )}
                      >
                        <ZoomIn className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>Hover to zoom</span>
                      </div>

                      {/* Previous / Next chevrons */}
                      {imagesList.length > 1 && (
                        <>
                          <button
                            type="button"
                            onClick={handlePrevImage}
                            className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity z-20"
                            title="Previous image"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          <button
                            type="button"
                            onClick={handleNextImage}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity z-20"
                            title="Next image"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Thumbnails Strip */}
                {(imagesList.length > 1 || product.mediaVideoUrl) && (
                  <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1 scrollbar-thin">
                    {imagesList.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setActiveImageIdx(idx);
                          setIsVideoActive(false);
                        }}
                        className={cn(
                          "relative w-20 h-28 rounded-2xl overflow-hidden border-2 transition-all flex-shrink-0 bg-[#120B20] group/thumb",
                          !isVideoActive && activeImageIdx === idx
                            ? "border-[#D4AF37] ring-2 ring-[#D4AF37]/30 scale-[1.03]"
                            : "border-white/10 opacity-60 hover:opacity-100 hover:border-white/30"
                        )}
                      >
                        <Image
                          src={img}
                          alt={`Thumbnail ${idx + 1}`}
                          fill
                          className="object-contain p-1"
                        />
                        <div className="absolute inset-0 bg-black/10 group-hover/thumb:bg-transparent transition-colors" />
                        <span className="absolute bottom-1 right-1.5 text-[9px] font-mono text-zinc-400 bg-black/60 px-1 rounded">
                          {idx + 1}
                        </span>
                      </button>
                    ))}

                    {product.mediaVideoUrl && (
                      <button
                        type="button"
                        onClick={() => setIsVideoActive(true)}
                        className={cn(
                          "relative w-20 h-28 rounded-2xl overflow-hidden border-2 transition-all flex-shrink-0 bg-[#120B20] flex flex-col items-center justify-center gap-1.5",
                          isVideoActive
                            ? "border-[#D4AF37] ring-2 ring-[#D4AF37]/30 scale-[1.03] text-[#D4AF37]"
                            : "border-white/10 opacity-60 hover:opacity-100 hover:border-white/30 text-white"
                        )}
                      >
                        <div className="p-2 rounded-full bg-white/10">
                          <Play className="w-4 h-4 fill-current ml-0.5" />
                        </div>
                        <span className="text-[10px] font-semibold uppercase tracking-wider">Video</span>
                      </button>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="relative aspect-[3/4] w-full bg-[#140C24] border border-white/10 rounded-3xl flex flex-col items-center justify-center p-8 space-y-3">
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

          {/* Details Column */}
          <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-32 calm-card p-8 rounded-3xl border border-white/10">
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
                        : "border-white/20 opacity-70 hover:opacity-100"
                    )}
                    style={!v.swatchUrl ? { backgroundColor: v.color } : undefined}
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
                <span className="text-xs text-[#D4AF37] hover:underline cursor-pointer">
                  Size Guide
                </span>
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
                        "w-11 h-11 rounded-xl border text-xs font-medium transition-all duration-200 flex items-center justify-center",
                        isSelected 
                          ? "calm-primary-btn border-white" 
                          : "calm-glass text-zinc-300 border-white/10 hover:border-white/30 hover:text-white",
                        isOutOfStock && "opacity-20 cursor-not-allowed line-through"
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
          <div className="w-full flex items-center justify-between z-10 max-w-6xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3">
              <h3 className="font-headline text-lg text-white font-light">{product.name}</h3>
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
              sizes="90vw"
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
                      : "border-white/20 opacity-50 hover:opacity-100"
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
    </div>
  );
}
