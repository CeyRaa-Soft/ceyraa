"use client";

import Link from 'next/link';
import { ShoppingBag, User, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuthStore, useCartStore, useUIStore } from '@/store/useStore';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user } = useAuthStore();
  const cartItems = useCartStore((state) => state.items);
  const { setAuthModal } = useUIStore();

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 z-[100] w-full transition-all duration-700 ${
      scrolled ? 'h-16 luxury-blur border-b border-border/20 py-2' : 'h-24 bg-transparent py-8'
    }`}>
      <div className="mx-auto flex h-full max-w-[1800px] items-center justify-between px-6 lg:px-12">
        {/* Nav Links Left */}
        <div className="hidden lg:flex flex-1 space-x-10">
          <Link href="/shop" className="text-[10px] font-bold tracking-[0.4em] uppercase hover-underline-luxury">Collection</Link>
          <Link href="/shop?category=New Arrivals" className="text-[10px] font-bold tracking-[0.4em] uppercase hover-underline-luxury">New Drops</Link>
        </div>

        {/* Logo Center */}
        <div className="flex-shrink-0 text-center">
          <Link href="/" className="font-headline text-2xl lg:text-3xl tracking-[0.3em] font-light">
            CEYRAA
          </Link>
        </div>

        {/* Icons Right */}
        <div className="flex items-center justify-end flex-1 space-x-8">
          <div className="hidden lg:flex items-center space-x-6">
            {user ? (
              <Link href="/account" className="text-[10px] tracking-[0.3em] uppercase hover:text-accent transition-colors font-medium">
                {user.name}
              </Link>
            ) : (
              <button 
                onClick={() => setAuthModal(true)} 
                className="text-[10px] tracking-[0.3em] uppercase hover:text-accent transition-colors font-medium"
              >
                Sign In
              </button>
            )}
          </div>

          <Link href="/cart" className="relative group">
            <ShoppingBag className="h-5 w-5 stroke-[1px] group-hover:text-accent transition-colors" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-accent text-[8px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </Link>

          <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden">
            <Menu className="h-6 w-6 stroke-[1px]" />
          </button>
        </div>
      </div>

      {/* Full Screen Mobile Menu */}
      <div className={`fixed inset-0 z-[110] bg-background transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="p-8 flex justify-between items-center">
          <span className="font-headline text-xl tracking-widest">CEYRAA</span>
          <button onClick={() => setIsOpen(false)}>
            <X className="h-8 w-8 stroke-[1px]" />
          </button>
        </div>
        <div className="flex flex-col items-center justify-center h-[70vh] space-y-12">
          <Link href="/shop" onClick={() => setIsOpen(false)} className="text-4xl font-headline tracking-tighter">Collections</Link>
          <Link href="/shop?category=New Arrivals" onClick={() => setIsOpen(false)} className="text-4xl font-headline tracking-tighter">New Arrivals</Link>
          <Link href="/offers" onClick={() => setIsOpen(false)} className="text-4xl font-headline tracking-tighter text-accent">Private Sale</Link>
          <button onClick={() => { setIsOpen(false); setAuthModal(true); }} className="text-[10px] tracking-[0.5em] uppercase border-b border-foreground/20 pb-2">My Account</button>
        </div>
      </div>
    </nav>
  );
}