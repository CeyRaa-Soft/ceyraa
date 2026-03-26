"use client";

import Navbar from '@/components/layout/Navbar';
import AuthModal from '@/components/auth/AuthModal';
import { BANNERS, PRODUCTS } from '@/lib/data';
import Image from 'next/image';
import Link from 'next/link';
import ProductCard from '@/components/product/ProductCard';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';

export default function Home() {
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

  return (
    <div className="min-h-screen">
      <Navbar />
      <AuthModal />
      
      {/* Editorial Hero Section */}
      <section className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
        <div className="max-w-[1800px] w-full px-6 lg:px-12 grid lg:grid-cols-12 gap-8 items-center pt-20">
          <div className="lg:col-span-6 z-20 space-y-16">
            <div className="space-y-6">
              <span className="block text-[9px] font-black tracking-[1em] uppercase text-accent animate-in fade-in slide-in-from-left-4 duration-1000">
                The Archive Collection
              </span>
              <h1 className="font-headline text-7xl md:text-[10vw] leading-[0.8] tracking-tighter text-primary animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                TIMELESS<br/>
                <span className="italic pl-16 lg:pl-48 text-accent/60">FORM</span>
              </h1>
            </div>
            
            <p className="max-w-sm text-[10px] font-semibold tracking-[0.3em] uppercase leading-loose text-muted-foreground animate-in fade-in duration-1000 delay-500">
              A curated study of silhouette, material purity, and the poetry of modern movement.
            </p>
            
            <div className="pt-4 animate-in fade-in duration-1000 delay-700">
              <Link href="/shop">
                <Button className="group rounded-full bg-primary text-white px-20 py-10 text-[9px] font-black tracking-[0.5em] hover:bg-accent transition-all shadow-[0_24px_48px_-12px_rgba(0,0,0,0.15)] hover:shadow-accent/30">
                  DISCOVER THE ARCHIVE
                  <div className="w-0 group-hover:w-10 h-[1px] bg-white ml-0 group-hover:ml-6 transition-all duration-700"></div>
                </Button>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6 relative h-[70vh] lg:h-[90vh] group px-4">
            <div className="absolute inset-0 bg-accent/5 rounded-[6rem] -translate-x-8 translate-y-8 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-[2s]"></div>
            <div className="relative h-full w-full overflow-hidden rounded-[5rem] shadow-[0_48px_100px_-24px_rgba(0,0,0,0.1)]">
              <Image
                src={BANNERS[0].imageUrl}
                alt="Editorial Main"
                fill
                priority
                className="object-cover transition-transform duration-[4s] group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Selected Works - Staggered Editorial Grid */}
      <section className="py-64 relative">
        <div className="max-w-[1800px] mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row justify-between items-end mb-48 reveal-on-scroll">
            <div className="space-y-8">
              <h2 className="text-6xl md:text-[8vw] font-headline tracking-tighter uppercase leading-[0.9]">Curated<br/><span className="italic pl-16 text-accent">Editions</span></h2>
              <div className="flex items-center gap-6">
                <div className="w-12 h-[1px] bg-accent/40"></div>
                <p className="text-[9px] tracking-[0.5em] font-black text-muted-foreground uppercase">Volume I • Spring 24</p>
              </div>
            </div>
            <Link href="/shop" className="text-[9px] tracking-[0.6em] font-black uppercase border-b border-primary/10 pb-6 hover:text-accent hover:border-accent transition-all duration-700">
              Explore All Pieces
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-16 lg:gap-10">
            {PRODUCTS.filter(p => p.isNew).slice(0, 4).map((product, idx) => (
              <div key={product.id} className={`reveal-on-scroll delay-${idx * 200} ${idx % 2 !== 0 ? 'lg:translate-y-32' : ''}`}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Narrative Section - Minimalist Contrast */}
      <section className="relative py-80 overflow-hidden bg-white/40 backdrop-blur-3xl rounded-[12rem] mx-6 lg:mx-12 my-24 border border-white/60 shadow-2xl">
        <div className="absolute inset-0 opacity-[0.03]">
           <svg className="w-full h-full animate-float-slow" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
             <circle cx="500" cy="500" r="450" fill="none" stroke="currentColor" strokeWidth="0.5" />
             <path d="M500 50 L500 950 M50 500 L950 500" stroke="currentColor" strokeWidth="0.5" />
           </svg>
        </div>
        <div className="max-w-[1200px] mx-auto px-6 text-center reveal-on-scroll">
          <h2 className="font-headline text-5xl md:text-[7vw] leading-[1.05] tracking-tighter mb-16 text-primary/80">
            "Artistry in the<br/>
            <span className="italic text-accent">absence</span> of excess."
          </h2>
          <div className="w-24 h-[1px] bg-accent/30 mx-auto mb-16"></div>
          <p className="text-[10px] uppercase tracking-[0.8em] text-muted-foreground font-black">The CeyRaa Vision</p>
        </div>
      </section>

      {/* Secondary Feature - Curved Frame */}
      <section className="reveal-on-scroll py-48">
        <div className="max-w-[1800px] mx-auto px-6 lg:px-12">
          <div className="relative h-[90vh] w-full overflow-hidden rounded-[6rem] shadow-[0_64px_128px_-32px_rgba(0,0,0,0.08)] group">
            <Image
              src={BANNERS[1].imageUrl}
              alt="Narrative Image"
              fill
              className="object-cover transition-transform duration-[5s] group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 flex flex-col items-center justify-center text-white p-6">
              <span className="text-[9px] tracking-[1.2em] font-black uppercase mb-12 text-white/90">Limited Series</span>
              <h2 className="font-headline text-6xl md:text-[9vw] tracking-tighter leading-none mb-20 text-center">
                ARCHIVE<br/><span className="italic opacity-80 pl-24">STUDIES</span>
              </h2>
              <Link href="/shop">
                <Button className="rounded-full bg-white/10 backdrop-blur-3xl border border-white/20 px-20 py-12 text-[9px] font-black tracking-[0.6em] uppercase hover:bg-white hover:text-black transition-all shadow-2xl">
                  VIEW THE RELEASE
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Minimalist Luxury */}
      <footer className="bg-white/40 backdrop-blur-3xl pt-64 pb-20 relative overflow-hidden rounded-t-[12rem] border-t border-white/60">
        <div className="max-w-[1800px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-24 border-b border-primary/5 pb-48">
            <div className="md:col-span-2 space-y-16">
              <span className="font-headline text-6xl tracking-[0.2em] block text-primary/80">CEYRAA</span>
              <p className="max-w-md text-[10px] font-semibold text-muted-foreground leading-loose uppercase tracking-[0.4em]">
                Crafting modern icons with a focus on material integrity and the pursuit of refined simplicity.
              </p>
            </div>
            <div className="space-y-12">
              <h4 className="text-[10px] tracking-[0.6em] font-black text-accent uppercase">CURATION</h4>
              <ul className="space-y-6 text-[10px] tracking-[0.4em] uppercase font-bold text-muted-foreground">
                <li><Link href="/shop" className="hover:text-accent transition-colors">Outerwear</Link></li>
                <li><Link href="/shop" className="hover:text-accent transition-colors">Tailoring</Link></li>
                <li><Link href="/shop" className="hover:text-accent transition-colors">Archival Pieces</Link></li>
              </ul>
            </div>
            <div className="space-y-12">
              <h4 className="text-[10px] tracking-[0.6em] font-black text-accent uppercase">CONNECT</h4>
              <div className="flex flex-col space-y-6 text-[10px] tracking-[0.4em] uppercase font-bold text-muted-foreground">
                <a href="#" className="hover:text-accent">Instagram</a>
                <a href="#" className="hover:text-accent">Archive Studio</a>
              </div>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center pt-16 text-[9px] tracking-[0.6em] text-muted-foreground/50 uppercase font-black">
            <span>&copy; 2024 CeyRaa Luxury Group</span>
            <div className="flex space-x-20 mt-8 md:mt-0">
              <Link href="#" className="hover:text-primary transition-colors">Privacy</Link>
              <Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
