"use client";

import Navbar from '@/components/layout/Navbar';
import AuthModal from '@/components/auth/AuthModal';
import { PRODUCTS } from '@/lib/data';
import { Product } from '@/lib/types';
import { mapDesignToProduct } from '@/lib/productMapper';
import Image from 'next/image';
import Link from 'next/link';
import ProductCard from '@/components/product/ProductCard';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { ChevronRight, ArrowRight } from 'lucide-react';

export default function Home() {
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [backendLoaded, setBackendLoaded] = useState(false);
  const [activeCategoryIdx, setActiveCategoryIdx] = useState<number | null>(null);

  // Sync backend collection if reachable, or keep calm curated garments
  useEffect(() => {
    const fetchBackendData = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
        const [catsRes, designsRes] = await Promise.all([
          fetch(`${API_URL}/api/admin/dress-categories`),
          fetch(`${API_URL}/api/admin/designs`)
        ]);

        if (catsRes.ok && designsRes.ok) {
          const catsData = await catsRes.json();
          const designsData = await designsRes.json();
          if (Array.isArray(designsData) && designsData.length > 0) {
            const mapped = designsData.map((d: any) => mapDesignToProduct(d, catsData));
            setProducts(mapped);
            setBackendLoaded(true);
          }
        }
      } catch (err) {
        setProducts(PRODUCTS);
      }
    };

    fetchBackendData();
  }, []);

  // Smooth scroll observer for dynamic section reveals and in-view card lighting
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll('.reveal-on-scroll');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const balconyCategories = [
    {
      title: "Queen's Wardrobe",
      subtitle: "Fluid dresses, evening silhouettes, and relaxed tailoring",
      query: "Queen's Wardrobe",
      image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "King's Wardrobe",
      subtitle: "Clean poplin shirts, blazers, and modern everyday essentials",
      query: "King's Wardrobe",
      image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Outerwear",
      subtitle: "Structured wool coats, trench designs, and light layering",
      query: "Outerwear",
      image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "New Season",
      subtitle: "Fresh silhouettes crafted for the season ahead",
      query: "New Arrivals",
      image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80",
    },
  ];

  return (
    <div className="min-h-screen text-[#F7F5FA] overflow-x-hidden">
      <Navbar />
      <AuthModal />
      
      {/* =========================================================================
          HERO SECTION: CALM PALACE FOYER (FEATURING 3.3.3 AS REQUESTED)
          ========================================================================= */}
      <section className="relative min-h-[90vh] w-full flex items-center justify-center pt-28 pb-16">
        <div className="max-w-[1700px] w-full mx-auto px-6 lg:px-12 grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Hero Typography */}
          <div className="lg:col-span-7 z-20 space-y-8">
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-white/10 bg-[#160D28]/60 backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
              <span className="text-[10px] font-medium tracking-[0.25em] uppercase text-zinc-300">
                New Season Collection
              </span>
            </div>

            <div className="space-y-4">
              <h1 className="font-headline text-5xl sm:text-7xl lg:text-[5.5vw] font-normal leading-[1.05] tracking-tight text-white">
                Quiet luxury.<br />
                <span className="italic text-[#D4AF37]">Everyday elegance.</span>
              </h1>
              <p className="max-w-lg text-xs sm:text-sm tracking-wide text-zinc-300 font-light leading-relaxed">
                Refined silhouettes crafted with graceful proportions. Thoughtfully tailored for individuals who value calm presence and exceptional finish.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link href="/shop?category=Queen%27s%20Wardrobe">
                <Button className="calm-primary-btn px-8 py-6 rounded-full text-xs tracking-[0.2em] uppercase font-semibold">
                  Queen's Wardrobe
                </Button>
              </Link>
              <Link href="/shop?category=King%27s%20Wardrobe">
                <Button variant="outline" className="calm-secondary-btn px-8 py-6 rounded-full text-xs tracking-[0.2em] uppercase font-semibold">
                  King's Wardrobe
                </Button>
              </Link>
            </div>

            {/* Pillars */}
            <div className="pt-8 border-t border-white/10 grid grid-cols-3 gap-6 max-w-md">
              <div>
                <span className="block text-sm font-semibold text-white">Pure Fabrics</span>
                <span className="text-[10px] text-zinc-400">Curated materials</span>
              </div>
              <div>
                <span className="block text-sm font-semibold text-white">Precise Cut</span>
                <span className="text-[10px] text-zinc-400">Tailored drape</span>
              </div>
              <div>
                <span className="block text-sm font-semibold text-white">Direct Care</span>
                <span className="text-[10px] text-zinc-400">Personal treatment</span>
              </div>
            </div>
          </div>

          {/* Hero Main Fashion Visual */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto w-full max-w-[460px] aspect-[3/4] rounded-3xl overflow-hidden border border-white/10 bg-[#160D29] shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=80"
                alt="CEYRAA Wardrobe"
                fill
                priority
                className="object-cover transition-transform duration-700 hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0612]/70 via-transparent to-transparent pointer-events-none" />
              
              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl calm-glass">
                <span className="text-[9px] font-medium tracking-[0.25em] uppercase text-[#D4AF37] block">
                  CEYRAA Atelier
                </span>
                <h3 className="font-headline text-base font-normal tracking-wide text-white">
                  Effortless Day & Evening Pieces
                </h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          BALCONY VIEW: OVERLOOK ALL CATEGORIES (DYNAMIC SCROLL INTERACTION)
          ========================================================================= */}
      <section id="balcony-view" className="py-24 relative">
        <div className="max-w-[1700px] mx-auto px-6 lg:px-12">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 reveal-on-scroll">
            <div className="space-y-3">
              <span className="text-[10px] tracking-[0.25em] uppercase text-[#D4AF37] font-semibold">
                Overview
              </span>
              <h2 className="font-headline text-3xl sm:text-5xl font-normal tracking-tight text-white">
                The Balcony View
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 font-light max-w-md">
                Survey the wardrobe collections from one calm perspective.
              </p>
            </div>

            <div className="mt-4 md:mt-0">
              <Link 
                href="/shop" 
                className="inline-flex items-center gap-1.5 text-xs tracking-wider uppercase text-zinc-300 hover:text-white hover-gold-line pb-0.5"
              >
                View all categories <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Balcony Category Grid with Dynamic Scroll Depth */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {balconyCategories.map((cat, idx) => (
              <Link
                key={cat.title}
                href={`/shop?category=${encodeURIComponent(cat.query)}`}
                className={`group relative h-[420px] rounded-2xl overflow-hidden calm-card border border-white/5 hover:border-white/20 transition-all duration-700 reveal-on-scroll flex flex-col justify-end p-6 ${
                  idx % 2 !== 0 ? 'lg:translate-y-4' : ''
                }`}
                style={{ transitionDelay: `${idx * 120}ms` }}
              >
                <Image
                  src={cat.image}
                  alt={cat.title}
                  fill
                  className="object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0612]/90 via-[#0A0612]/40 to-transparent" />

                <div className="relative z-10 space-y-2">
                  <h3 className="font-headline text-2xl font-normal text-white group-hover:text-[#D4AF37] transition-colors">
                    {cat.title}
                  </h3>
                  <p className="text-[11px] text-zinc-300 font-light leading-relaxed line-clamp-2">
                    {cat.subtitle}
                  </p>
                  <span className="inline-flex items-center gap-1 text-[10px] tracking-widest uppercase text-[#D4AF37] pt-1">
                    Explore <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          CURATED COLLECTION: NEW ARRIVALS (DYNAMIC SCROLL GRID)
          ========================================================================= */}
      <section className="py-20 relative">
        <div className="max-w-[1700px] mx-auto px-6 lg:px-12">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-14 reveal-on-scroll">
            <div className="space-y-3">
              <span className="text-[10px] tracking-[0.25em] uppercase text-[#D4AF37] font-semibold">
                Curated
              </span>
              <h2 className="font-headline text-3xl sm:text-5xl font-normal tracking-tight text-white">
                New Arrivals
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 font-light">
                {backendLoaded ? "Live pieces catalogued directly from the atelier" : "Seasonal wardrobe essentials tailored for comfort and form"}
              </p>
            </div>

            <div className="mt-4 md:mt-0">
              <Link 
                href="/shop" 
                className="text-xs tracking-wider uppercase text-zinc-300 hover:text-white hover-gold-line pb-0.5"
              >
                Browse full wardrobe &rarr;
              </Link>
            </div>
          </div>

          {/* Product Grid with alternating dynamic scroll offsets */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {products.slice(0, 8).map((product, idx) => (
              <div 
                key={product.id} 
                className={`reveal-on-scroll ${idx % 2 !== 0 ? 'lg:translate-y-6' : ''}`}
                style={{ transitionDelay: `${(idx % 4) * 100}ms` }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          THE CEYRAA EXPERIENCE: CALM PALACE TOUCH
          ========================================================================= */}
      <section className="py-24 relative my-8">
        <div className="max-w-[1700px] mx-auto px-6 lg:px-12">
          <div className="relative rounded-3xl p-8 lg:p-16 calm-card border border-white/10 overflow-hidden">
            <div className="grid lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-7 space-y-6 reveal-on-scroll">
                <span className="text-[10px] tracking-[0.25em] uppercase text-[#D4AF37] font-semibold">
                  The CeyRaa Standard
                </span>

                <h2 className="font-headline text-3xl sm:text-4xl lg:text-5xl font-normal leading-tight text-white">
                  Elevated pieces, peaceful service.
                </h2>

                <p className="text-xs sm:text-sm text-zinc-300 font-light leading-relaxed">
                  We believe that what you wear every day should feel exceptional without being loud. 
                  Every dress, shirt, and tailored coat at CEYRAA is cut from balanced fabrics, 
                  finished with attentive craftsmanship, and delivered with the personal respect you deserve.
                </p>

                <div className="pt-2">
                  <Link href="/shop">
                    <Button className="calm-secondary-btn px-6 py-5 rounded-full text-xs tracking-widest uppercase font-semibold">
                      Explore The Collection
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-5 relative flex justify-center">
                <div className="relative w-full max-w-[360px] aspect-[4/5] rounded-2xl overflow-hidden border border-white/10 shadow-xl">
                  <Image
                    src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80"
                    alt="Atelier Detail"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0612]/80 via-transparent to-transparent" />
                  
                  {/* Subtle Brand Logo Watermark */}
                  <div className="absolute top-4 right-4 p-2.5 rounded-xl calm-glass">
                    <div className="relative h-5 w-16">
                      <Image
                        src="/assets/1.1.png"
                        alt="CEYRAA"
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          EXCLUSIVE OFFERS TEASER
          ========================================================================= */}
      <section className="py-16 relative">
        <div className="max-w-[1700px] mx-auto px-6 lg:px-12">
          <div className="relative rounded-2xl calm-card border border-white/10 p-8 sm:p-12 text-center">
            <div className="max-w-xl mx-auto space-y-4">
              <span className="text-[10px] tracking-[0.25em] uppercase text-[#D4AF37] font-semibold">
                Private Archive
              </span>
              <h2 className="font-headline text-3xl sm:text-4xl font-normal text-white">
                Exclusive Offers
              </h2>
              <p className="text-xs text-zinc-300 font-light leading-relaxed">
                Selected seasonal garments available at preferred pricing for our customers.
              </p>
              <div className="pt-2">
                <Link href="/offers">
                  <Button className="calm-primary-btn px-8 py-5 rounded-full text-xs tracking-widest uppercase font-semibold">
                    View Offers &rarr;
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          CALM FOOTER
          ========================================================================= */}
      <footer className="pt-20 pb-12 border-t border-white/10 bg-[#08040F] relative">
        <div className="max-w-[1700px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-white/5">
            {/* Brand */}
            <div className="md:col-span-5 space-y-4">
              <div className="relative h-8 w-32">
                <Image
                  src="/assets/1.1.png"
                  alt="CEYRAA"
                  fill
                  className="object-contain"
                />
              </div>
              <p className="max-w-sm text-xs text-zinc-400 font-light leading-relaxed">
                Elevated everyday fashion and timeless silhouettes. Designed for calm confidence and refined living.
              </p>
            </div>

            {/* Quick Links */}
            <div className="md:col-span-3 space-y-3">
              <h4 className="text-[11px] tracking-widest uppercase text-white font-medium">Collections</h4>
              <ul className="space-y-2 text-xs text-zinc-400 font-light">
                <li><Link href="/shop?category=Queen%27s%20Wardrobe" className="hover:text-white transition-colors">Queen's Wardrobe</Link></li>
                <li><Link href="/shop?category=King%27s%20Wardrobe" className="hover:text-white transition-colors">King's Wardrobe</Link></li>
                <li><Link href="/shop?category=Outerwear" className="hover:text-white transition-colors">Outerwear</Link></li>
                <li><Link href="/#balcony-view" className="hover:text-white transition-colors">The Balcony</Link></li>
              </ul>
            </div>

            {/* Assistance */}
            <div className="md:col-span-4 space-y-3">
              <h4 className="text-[11px] tracking-widest uppercase text-white font-medium">Customer Care</h4>
              <p className="text-xs text-zinc-400 font-light">
                Receive notices on new arrivals, seasonal edits, and exclusive offers.
              </p>
              <div className="flex items-center gap-2 pt-1 max-w-sm">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="bg-[#140C24] border border-white/15 rounded-full px-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/40 flex-1"
                />
                <button className="calm-primary-btn px-5 py-2 rounded-full text-[11px] uppercase tracking-wider font-semibold">
                  Subscribe
                </button>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="flex flex-col sm:flex-row justify-between items-center pt-8 text-[11px] text-zinc-500 font-light">
            <span>&copy; {new Date().getFullYear()} CEYRAA. All rights reserved.</span>
            <div className="flex space-x-6 mt-4 sm:mt-0">
              <Link href="#" className="hover:text-zinc-300 transition-colors">Privacy Policy</Link>
              <Link href="#" className="hover:text-zinc-300 transition-colors">Terms of Service</Link>
              <Link href="#" className="hover:text-zinc-300 transition-colors">Shipping & Returns</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
