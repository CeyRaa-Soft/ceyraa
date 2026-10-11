"use client";

import Navbar from '@/components/layout/Navbar';
import AuthModal from '@/components/auth/AuthModal';
import { PRODUCTS } from '@/lib/data';
import ProductCard from '@/components/product/ProductCard';

export default function OffersPage() {
  const offerProducts = PRODUCTS.filter(p => p.discountPrice && p.discountPrice < p.basePrice);

  return (
    <div className="min-h-screen text-[#F7F5FA]">
      <Navbar />
      <AuthModal />
      
      <main className="max-w-[1700px] mx-auto px-6 sm:px-8 lg:px-12 pt-32 pb-24">
        {/* Banner */}
        <div className="relative rounded-2xl calm-card border border-white/10 p-8 md:p-14 mb-16 text-center">
          <div className="max-w-xl mx-auto space-y-3">
            <span className="text-[10px] tracking-widest uppercase text-[#D4AF37] font-medium">
              Private Edit
            </span>
            
            <h1 className="font-headline text-3xl sm:text-5xl font-normal text-white uppercase">
              Exclusive Offers
            </h1>
            
            <p className="text-xs sm:text-sm font-light text-zinc-300 leading-relaxed">
              Selected seasonal garments available at preferred pricing for our customers.
            </p>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
          {offerProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {offerProducts.length === 0 && (
          <div className="py-24 text-center calm-card rounded-2xl p-8 border border-white/10">
            <p className="text-xs uppercase tracking-widest text-zinc-400 font-light">
              There are currently no active offers. Please check back soon.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
