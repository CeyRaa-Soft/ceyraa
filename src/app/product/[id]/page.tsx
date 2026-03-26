"use client";

import { use, useState, useEffect } from 'react';
import Image from 'next/image';
import { PRODUCTS } from '@/lib/data';
import Navbar from '@/components/layout/Navbar';
import AuthModal from '@/components/auth/AuthModal';
import { useAuthStore, useCartStore, useUIStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import OutfitSuggestions from '@/components/ai/OutfitSuggestions';
import { ShoppingBag, ChevronRight, Heart } from 'lucide-react';

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const product = PRODUCTS.find(p => p.id === id);
  const { user } = useAuthStore();
  const { setAuthModal } = useUIStore();
  const { addItem } = useCartStore();

  const [selectedColorIdx, setSelectedColorIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  if (!product) return <div>Product not found.</div>;

  const currentVariant = product.variants[selectedColorIdx];

  const handleAddToCart = () => {
    if (!user) {
      setAuthModal(true);
      return;
    }
    if (!selectedSize) {
      toast({ title: "Please select a size", variant: "destructive" });
      return;
    }
    
    addItem({
      productId: product.id,
      productName: product.name,
      color: currentVariant.colorName,
      size: selectedSize,
      price: product.discountPrice || product.basePrice,
      quantity: 1,
      image: currentVariant.images[0]
    });

    toast({ title: "Added to cart", description: `${product.name} in ${currentVariant.colorName} - ${selectedSize}` });
  };

  return (
    <div className="min-h-screen bg-mesh pb-40">
      <Navbar />
      <AuthModal />
      
      <main className="max-w-[1600px] mx-auto pt-16 px-6 lg:px-12">
        <div className="flex items-center space-x-4 text-[9px] tracking-[0.4em] font-bold text-muted-foreground mb-16 uppercase">
          <a href="/" className="hover:text-accent transition-colors">Home</a>
          <span className="opacity-20">/</span>
          <a href="/shop" className="hover:text-accent transition-colors">Shop</a>
          <span className="opacity-20">/</span>
          <span className="text-foreground">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
          {/* Gallery - Organic layout */}
          <div className="lg:col-span-7 space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentVariant.images.map((img, i) => (
                <div key={i} className={cn(
                  "relative aspect-[3/4] bg-secondary/30 overflow-hidden shadow-2xl",
                  i % 3 === 0 ? "rounded-[3rem] md:rounded-[5rem]" : "rounded-[2rem] md:rounded-[3rem]"
                )}>
                  <Image
                    src={img}
                    alt={`${product.name} - ${i}`}
                    fill
                    className="object-cover transition-transform duration-[2s] hover:scale-110"
                    priority={i === 0}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Details - Floating Glass Card */}
          <div className="lg:col-span-5 space-y-12 lg:sticky lg:top-32 self-start glass-card p-10 rounded-[3rem]">
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                 <h1 className="font-headline text-4xl md:text-5xl tracking-tighter leading-none uppercase">{product.name}</h1>
                 <button className="p-3 bg-secondary/50 rounded-full hover:bg-accent/10 hover:text-accent transition-all">
                    <Heart className="h-5 w-5 stroke-[1.5px]" />
                 </button>
              </div>
              
              <div className="flex items-center space-x-6">
                {product.discountPrice ? (
                  <>
                    <span className="text-2xl text-accent font-bold tracking-tight">${product.discountPrice}</span>
                    <span className="text-xl text-muted-foreground/50 line-through font-light tracking-tight">${product.basePrice}</span>
                  </>
                ) : (
                  <span className="text-2xl font-bold tracking-tight">${product.basePrice}</span>
                )}
              </div>
              <p className="text-xs font-medium leading-relaxed text-muted-foreground/80 tracking-wide uppercase">
                {product.description}
              </p>
            </div>

            {/* Colors */}
            <div className="space-y-6">
              <h3 className="text-[10px] tracking-[0.4em] uppercase font-black text-foreground/40">Color <span className="text-foreground ml-2">{currentVariant.colorName}</span></h3>
              <div className="flex gap-4">
                {product.variants.map((v, i) => (
                  <button
                    key={v.color}
                    onClick={() => setSelectedColorIdx(i)}
                    className={cn(
                      "w-10 h-10 rounded-full border border-black/5 ring-2 ring-offset-4 transition-all duration-500",
                      selectedColorIdx === i ? "ring-accent" : "ring-transparent hover:ring-black/10"
                    )}
                    style={{ backgroundColor: v.color }}
                  />
                ))}
              </div>
            </div>

            {/* Sizes */}
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-[10px] tracking-[0.4em] uppercase font-black text-foreground/40">Select Size</h3>
                <button className="text-[10px] tracking-[0.3em] font-bold text-accent underline underline-offset-8">SIZE GUIDE</button>
              </div>
              <div className="flex flex-wrap gap-3">
                {currentVariant.sizes.map((s) => {
                  const isOutOfStock = s.stock === 0;
                  return (
                    <button
                      key={s.size}
                      disabled={isOutOfStock}
                      onClick={() => setSelectedSize(s.size)}
                      className={cn(
                        "w-14 h-14 rounded-full border text-[10px] font-bold transition-all duration-500 flex items-center justify-center",
                        selectedSize === s.size 
                          ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
                          : "bg-white/50 text-primary border-transparent hover:border-accent",
                        isOutOfStock && "opacity-20 cursor-not-allowed line-through"
                      )}
                    >
                      {s.size}
                    </button>
                  );
                })}
              </div>
            </div>

            <Button
              onClick={handleAddToCart}
              className="w-full rounded-full py-10 text-[10px] tracking-[0.5em] font-bold transition-all group shadow-2xl hover:shadow-accent/30 bg-primary hover:bg-accent"
            >
              <ShoppingBag className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" />
              ADD TO BAG
            </Button>

            <div className="pt-8 space-y-2 border-t border-primary/5">
              <details className="group">
                <summary className="list-none flex justify-between items-center cursor-pointer py-4 text-[10px] font-black tracking-[0.3em] uppercase">
                  Care & Composition
                  <ChevronRight className="h-4 w-4 group-open:rotate-90 transition-transform" />
                </summary>
                <div className="pb-6 text-[11px] font-medium leading-relaxed text-muted-foreground/70 uppercase tracking-widest">
                  Made in Italy. 100% Virgin Wool. <br/> Dry clean only. Iron at low temperature.
                </div>
              </details>
            </div>
          </div>
        </div>

        {/* AI Recommendations */}
        <section className="mt-60">
          <OutfitSuggestions currentItems={[product]} />
        </section>
      </main>
    </div>
  );
}
