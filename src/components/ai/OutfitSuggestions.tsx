"use client";

import { useEffect, useState } from 'react';
import { suggestOutfit, OutfitSuggestionOutput } from '@/ai/flows/ai-powered-outfit-suggestions';
import { Product } from '@/lib/types';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles } from 'lucide-react';

export default function OutfitSuggestions({ currentItems }: { currentItems: Product[] }) {
  const [suggestions, setSuggestions] = useState<OutfitSuggestionOutput | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSuggestions() {
      try {
        const input = {
          currentItems: currentItems.map(item => ({
            productId: item.id,
            name: item.name,
            description: item.description,
            category: item.category,
            color: item.variants[0].colorName,
            imageUrl: item.variants[0].images[0],
            price: item.discountPrice || item.basePrice
          }))
        };
        const result = await suggestOutfit(input);
        setSuggestions(result);
      } catch (error) {
        console.error("AI suggestion failed:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchSuggestions();
  }, [currentItems]);

  if (!loading && (!suggestions || !suggestions.suggestions || suggestions.suggestions.length === 0)) return null;

  return (
    <div className="space-y-12">
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="flex items-center gap-2 text-accent">
          <Sparkles className="h-4 w-4" />
          <span className="text-[10px] font-bold tracking-[0.3em] uppercase">Stylist Recommendation</span>
        </div>
        <h2 className="font-headline text-3xl tracking-tight">ELEVATE YOUR LOOK</h2>
        <p className="text-xs font-light text-muted-foreground max-w-md tracking-wider">
          Our AI stylist curated these complementary pieces to perfectly pair with your selection.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {loading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="space-y-4">
              <Skeleton className="aspect-[3/4] w-full bg-secondary" />
              <Skeleton className="h-4 w-2/3 mx-auto" />
              <Skeleton className="h-3 w-1/2 mx-auto" />
            </div>
          ))
        ) : (
          suggestions?.suggestions.map((item, idx) => (
            <div key={idx} className="group relative flex flex-col items-center text-center space-y-4">
              <div className="relative aspect-[3/4] w-full bg-secondary overflow-hidden">
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
              <div className="space-y-2 px-4">
                <h3 className="text-[11px] font-bold tracking-widest uppercase">{item.name}</h3>
                <p className="text-[10px] text-muted-foreground font-light leading-relaxed italic">
                  "{item.reason}"
                </p>
                <span className="block text-xs font-medium text-accent">${item.price}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
