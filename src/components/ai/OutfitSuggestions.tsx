"use client";

import { useEffect, useState, useRef } from 'react';
import { suggestOutfit, OutfitSuggestionOutput } from '@/ai/flows/ai-powered-outfit-suggestions';
import { Product } from '@/lib/types';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';

export default function OutfitSuggestions({ currentItems }: { currentItems: Product[] }) {
  const [suggestions, setSuggestions] = useState<OutfitSuggestionOutput | null>(null);
  const [loading, setLoading] = useState(true);
  const fetchedKeyRef = useRef<string>("");

  const itemIds = currentItems
    .map(item => item?.id)
    .filter(Boolean)
    .join(",");

  useEffect(() => {
    if (!itemIds || fetchedKeyRef.current === itemIds) {
      return;
    }

    fetchedKeyRef.current = itemIds;
    let isCancelled = false;

    async function fetchSuggestions() {
      try {
        setLoading(true);
        const input = {
          currentItems: currentItems.map(item => ({
            productId: item.id,
            name: item.name,
            description: item.description,
            category: item.category,
            color: item.variants[0]?.colorName || "Classic",
            imageUrl: item.variants[0]?.images[0] || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80",
            price: item.discountPrice || item.basePrice
          }))
        };
        const result = await suggestOutfit(input);
        if (!isCancelled) {
          setSuggestions(result);
        }
      } catch (error) {
        if (!isCancelled) {
          setSuggestions(null);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    fetchSuggestions();

    return () => {
      isCancelled = true;
    };
  }, [itemIds]);

  if (!loading && (!suggestions || !suggestions.suggestions || suggestions.suggestions.length === 0)) return null;

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center text-center space-y-2">
        <span className="text-[10px] tracking-widest uppercase text-[#D4AF37] font-medium">
          Styling Notes
        </span>
        <h2 className="font-headline text-2xl sm:text-3xl font-normal text-white uppercase">
          Complete The Look
        </h2>
        <p className="text-xs text-zinc-400 font-light max-w-sm">
          Complementary pieces curated to pair with your selection.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="calm-card p-4 rounded-2xl space-y-3">
              <Skeleton className="aspect-[2/3] w-full bg-[#180F2A] rounded-xl" />
              <Skeleton className="h-4 w-2/3 mx-auto bg-[#180F2A]" />
              <Skeleton className="h-3 w-1/2 mx-auto bg-[#180F2A]" />
            </div>
          ))
        ) : (
          suggestions?.suggestions.map((item, idx) => (
            <div key={idx} className="group relative flex flex-col items-center text-center space-y-3 calm-card p-4 rounded-2xl border border-white/5">
              <div className="relative aspect-[2/3] w-full bg-[#140C24] rounded-xl overflow-hidden">
                <Image
                  src={item.imageUrl || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80"}
                  alt={item.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="space-y-1.5 px-2 pb-1">
                <h3 className="font-headline text-sm font-medium text-white">{item.name}</h3>
                <p className="text-[11px] text-zinc-400 font-light leading-relaxed italic">
                  "{item.reason}"
                </p>
                <span className="block text-xs font-medium text-[#D4AF37]">LKR {item.price.toLocaleString()}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
