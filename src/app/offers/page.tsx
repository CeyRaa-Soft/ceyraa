"use client";

import Navbar from '@/components/layout/Navbar';
import AuthModal from '@/components/auth/AuthModal';
import { PRODUCTS } from '@/lib/data';
import ProductCard from '@/components/product/ProductCard';

export default function OffersPage() {
  const offerProducts = PRODUCTS.filter(p => p.discountPrice && p.discountPrice < p.basePrice);

  return (
    <div className="min-h-screen">
      <Navbar />
      <AuthModal />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex flex-col items-center text-center space-y-6 mb-20">
          <span className="text-accent text-[10px] tracking-[0.4em] font-bold uppercase">Exclusive Access</span>
          <h1 className="font-headline text-5xl tracking-tight leading-tight uppercase">SEASONAL OFFERS</h1>
          <p className="text-sm font-light text-muted-foreground max-w-lg tracking-widest uppercase">
            Timeless luxury at exceptional value. Limited quantity pieces from our archive and seasonal collections.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-1 gap-y-16">
          {offerProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {offerProducts.length === 0 && (
          <div className="py-40 text-center">
            <p className="text-sm font-light uppercase tracking-widest text-muted-foreground">There are currently no active offers. Please check back soon.</p>
          </div>
        )}
      </main>
    </div>
  );
}
