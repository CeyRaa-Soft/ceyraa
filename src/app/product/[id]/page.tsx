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
import { ShoppingBag, Heart, ShieldCheck, Truck } from 'lucide-react';
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

  const hasRealImage = currentVariant.images && currentVariant.images.length > 0 && !currentVariant.images[0].includes("placehold.co");

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
          <div className="lg:col-span-7 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {hasRealImage ? (
                currentVariant.images.map((img, i) => (
                  <div 
                    key={i} 
                    className={cn(
                      "relative aspect-[3/4] bg-[#140C24] overflow-hidden rounded-2xl border border-white/5",
                      i === 0 ? "md:col-span-2 md:aspect-[4/3]" : ""
                    )}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} view ${i + 1}`}
                      fill
                      className="object-cover"
                      priority={i === 0}
                    />
                  </div>
                ))
              ) : (
                <div className="col-span-2 relative aspect-[16/10] bg-[#140C24] border border-white/10 rounded-2xl flex flex-col items-center justify-center p-8 space-y-3">
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
                      "w-8 h-8 rounded-full border transition-all duration-200",
                      selectedColorIdx === i 
                        ? "border-[#D4AF37] ring-1 ring-[#D4AF37] scale-110" 
                        : "border-white/20 opacity-70 hover:opacity-100"
                    )}
                    style={{ backgroundColor: v.color }}
                    title={v.colorName}
                  />
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
    </div>
  );
}
