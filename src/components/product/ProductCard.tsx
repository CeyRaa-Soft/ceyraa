"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { Product } from '@/lib/types';
import { cn } from '@/lib/utils';

export default function ProductCard({ product }: { product: Product }) {
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const activeVariant = product.variants[selectedVariantIdx] || {
    color: "#1E1236",
    colorName: "Classic",
    images: ["https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80"],
    sizes: []
  };

  // Dynamic animation trigger: activate when card scrolls through center of viewport
  useEffect(() => {
    const cardEl = cardRef.current;
    if (!cardEl) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Active when card is nicely in view
        if (entry.isIntersecting && entry.intersectionRatio >= 0.35) {
          setIsInView(true);
        } else if (!entry.isIntersecting || entry.intersectionRatio < 0.15) {
          setIsInView(false);
        }
      },
      {
        threshold: [0.15, 0.35, 0.6],
        rootMargin: "-40px 0px -40px 0px"
      }
    );

    observer.observe(cardEl);
    return () => observer.disconnect();
  }, []);

  const isAnimated = isHovered || isInView;
  const displayImage = activeVariant.images[isHovered && activeVariant.images.length > 1 ? 1 : 0] || activeVariant.images[0];
  const hasRealImage = activeVariant.images && activeVariant.images.length > 0 && !activeVariant.images[0].includes("placehold.co");

  const totalStock = product.variants.reduce(
    (sum, v) => sum + v.sizes.reduce((sSum, s) => sSum + s.stock, 0),
    0
  );
  const isOutOfStock = totalStock === 0;

  return (
    <div 
      ref={cardRef}
      className={cn(
        "group relative flex flex-col bg-transparent transition-all duration-700 ease-out transform-gpu",
        isInView && "translate-y-[-4px]",
        isOutOfStock && "opacity-60"
      )}
      onMouseEnter={() => !isOutOfStock && setIsHovered(true)}
      onMouseLeave={() => !isOutOfStock && setIsHovered(false)}
    >
      {/* Product Image Frame with Dynamic Scroll & Hover Response */}
      <Link 
        href={`/product/${product.id}`} 
        className={cn(
          "relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-[#140C24] transition-all duration-700",
          isAnimated 
            ? "border border-[#D4AF37]/35 shadow-[0_16px_36px_-12px_rgba(212,175,55,0.12),0_8px_20px_rgba(0,0,0,0.4)]" 
            : "border border-white/5 shadow-none"
        )}
      >
        {hasRealImage ? (
          <Image
            src={displayImage}
            alt={product.name}
            fill
            className={cn(
              "object-cover transition-transform duration-1000 ease-out transform-gpu",
              isAnimated ? "scale-[1.04]" : "scale-100"
            )}
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-2">
            <div className="relative h-6 w-20 opacity-40">
              <Image 
                src="/assets/1.1.png" 
                alt="CEYRAA" 
                fill 
                className="object-contain"
              />
            </div>
            <span className="text-[10px] uppercase tracking-widest text-zinc-500">
              {product.category}
            </span>
          </div>
        )}

        {/* Ambient Dark Vignette that reacts on scroll and hover */}
        <div 
          className={cn(
            "absolute inset-0 bg-gradient-to-t from-[#0A0612]/70 via-transparent to-transparent transition-opacity duration-500 pointer-events-none",
            isAnimated ? "opacity-90" : "opacity-0"
          )} 
        />

        {/* Minimal Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none z-10">
          {isOutOfStock ? (
            <span className="bg-black/80 backdrop-blur-sm text-zinc-300 text-[9px] font-medium tracking-widest px-2.5 py-1 rounded-full uppercase">
              Sold Out
            </span>
          ) : (
            <>
              {product.isNew && (
                <span className="bg-[#1C0F33]/85 backdrop-blur-sm text-zinc-200 text-[9px] font-medium tracking-widest px-2.5 py-1 rounded-full uppercase border border-white/10">
                  New
                </span>
              )}
              {product.discountPrice && (
                <span className="bg-[#D4AF37]/90 text-[#0A0612] text-[9px] font-bold tracking-widest px-2.5 py-1 rounded-full uppercase">
                  Sale
                </span>
              )}
            </>
          )}
        </div>
      </Link>

      {/* Product Details */}
      <div className="flex flex-col pt-4 space-y-1.5">
        {/* Color Palette Dots */}
        <div className="flex items-center gap-1.5 h-3">
          {!isOutOfStock && product.variants.map((v, i) => (
            <button
              key={`${v.color}-${i}`}
              onClick={(e) => {
                e.preventDefault();
                setSelectedVariantIdx(i);
              }}
              className={cn(
                "h-2 w-2 rounded-full transition-all duration-300 border",
                selectedVariantIdx === i 
                  ? "border-[#D4AF37] scale-125" 
                  : "border-white/20 opacity-60 hover:opacity-100"
              )}
              style={{ backgroundColor: v.color }}
              title={v.colorName}
              aria-label={`Select ${v.colorName}`}
            />
          ))}
        </div>

        {/* Product Title */}
        <Link 
          href={`/product/${product.id}`} 
          className={cn(
            "font-headline text-sm font-medium tracking-wide transition-colors line-clamp-1",
            isAnimated ? "text-white" : "text-zinc-200 hover:text-[#D4AF37]"
          )}
        >
          {product.name}
        </Link>

        {/* Price Tag */}
        <div className="flex items-baseline gap-2 pt-0.5">
          {product.discountPrice ? (
            <>
              <span className="text-xs font-semibold text-[#D4AF37]">
                LKR {product.discountPrice.toLocaleString()}
              </span>
              <span className="text-[10px] text-zinc-500 line-through">
                LKR {product.basePrice.toLocaleString()}
              </span>
            </>
          ) : (
            <span className="text-xs font-medium text-zinc-200">
              LKR {product.basePrice.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}