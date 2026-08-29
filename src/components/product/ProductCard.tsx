"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Product } from '@/lib/types';
import { cn } from '@/lib/utils';

import { Shirt } from 'lucide-react';

export default function ProductCard({ product }: { product: Product }) {
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const activeVariant = product.variants[selectedVariantIdx] || {
    color: "#708090",
    colorName: "Default",
    images: ["https://placehold.co/800x1200?text=No+Image"],
    sizes: []
  };
  const displayImage = activeVariant.images[isHovered ? 1 : 0] || activeVariant.images[0];
  const hasRealImage = activeVariant.images && activeVariant.images.length > 0 && !activeVariant.images[0].includes("placehold.co");

  const totalStock = product.variants.reduce(
    (sum, v) => sum + v.sizes.reduce((sSum, s) => sSum + s.stock, 0),
    0
  );
  const isOutOfStock = totalStock === 0;

  return (
    <div 
      className={cn(
        "group relative flex flex-col bg-transparent",
        isOutOfStock && "opacity-60 saturate-50 pointer-events-none"
      )}
      onMouseEnter={() => !isOutOfStock && setIsHovered(true)}
      onMouseLeave={() => !isOutOfStock && setIsHovered(false)}
    >
      <Link href={`/product/${product.id}`} className={cn("relative aspect-[4/5] overflow-hidden bg-secondary/50", !hasRealImage && "flex items-center justify-center bg-secondary/30")}>
        {hasRealImage ? (
          <Image
            src={displayImage}
            alt={product.name}
            fill
            className="object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-[1.5s] ease-out group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-muted-foreground/35 space-y-2 pointer-events-none select-none">
            <Shirt className="h-14 w-14 stroke-[1.2]" />
            <span className="text-[8px] font-bold tracking-[0.2em] uppercase">CEYRAA</span>
          </div>
        )}
        
        {/* Editorial Badges */}
        <div className="absolute top-4 left-4 flex flex-col space-y-2 pointer-events-none">
          {isOutOfStock ? (
            <span className="bg-black/85 backdrop-blur-md text-white text-[8px] font-bold tracking-[0.4em] px-3 py-1 uppercase">
              SOLD OUT
            </span>
          ) : (
            <>
              {product.isNew && (
                <span className="bg-primary/90 backdrop-blur-md text-white text-[8px] font-bold tracking-[0.4em] px-3 py-1 uppercase">
                  Limited
                </span>
              )}
              {product.discountPrice && (
                <span className="bg-accent/90 backdrop-blur-md text-white text-[8px] font-bold tracking-[0.4em] px-3 py-1 uppercase">
                  Reserved
                </span>
              )}
            </>
          )}
        </div>
      </Link>

      <div className="flex flex-col pt-6 space-y-3">
        {/* Color Switcher - Minimal */}
        <div className="flex items-center gap-2 h-4">
          {!isOutOfStock && product.variants.map((v, i) => (
            <button
              key={v.color}
              onClick={(e) => {
                e.preventDefault();
                setSelectedVariantIdx(i);
              }}
              className={cn(
                "h-1.5 w-1.5 rounded-full transition-all duration-500",
                selectedVariantIdx === i ? "bg-accent scale-[1.5]" : "bg-primary/20 hover:bg-primary/40"
              )}
              title={v.colorName}
            />
          ))}
        </div>

        <div className="space-y-1">
          <Link href={`/product/${product.id}`} className="block text-[10px] font-bold tracking-[0.3em] uppercase group-hover:text-accent transition-colors">
            {product.name}
          </Link>
          <div className="flex items-center space-x-3 text-[10px] tracking-[0.2em] font-medium text-muted-foreground">
             {product.discountPrice ? (
              <>
                <span className="line-through text-muted-foreground/50">${product.basePrice}</span>
                <span className="text-accent">${product.discountPrice}</span>
              </>
            ) : (
              <span>${product.basePrice}</span>
            )}
          </div>
        </div>
        
        <p className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-[0.4em]">
          {product.category}
        </p>
      </div>
    </div>
  );
}