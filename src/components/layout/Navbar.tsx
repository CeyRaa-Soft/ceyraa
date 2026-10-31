"use client";

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Menu, X, User as UserIcon, LogOut, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuthStore, useCartStore, useUIStore } from '@/store/useStore';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuthStore();
  const cartItems = useCartStore((state) => state.items);
  const { setAuthModal } = useUIStore();
  const { toast } = useToast();

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 z-[100] w-full transition-all duration-400 ${
      scrolled 
        ? 'h-20 bg-[#0A0612]/90 backdrop-blur-md border-b border-white/10 shadow-lg py-2' 
        : 'h-24 bg-transparent py-6'
    }`}>
      <div className="mx-auto flex h-full max-w-[1700px] items-center justify-between px-6 lg:px-12">
        {/* Navigation Left */}
        <nav className="hidden lg:flex flex-1 items-center space-x-7 xl:space-x-8 pr-6 lg:pr-10">
          <Link 
            href="/#balcony-view" 
            className="text-[11px] font-medium tracking-[0.2em] uppercase text-zinc-300 hover:text-white transition-colors hover-gold-line"
          >
            The Balcony
          </Link>
          <Link 
            href="/shop?wardrobe=Queen%27s%20Wardrobe" 
            className="text-[11px] font-medium tracking-[0.2em] uppercase text-zinc-300 hover:text-white transition-colors hover-gold-line"
          >
            Queen's Wardrobe
          </Link>
          <Link 
            href="/shop?wardrobe=King%27s%20Wardrobe" 
            className="text-[11px] font-medium tracking-[0.2em] uppercase text-zinc-300 hover:text-white transition-colors hover-gold-line"
          >
            King's Wardrobe
          </Link>
          <Link 
            href="/shop?category=New%20Arrivals" 
            className="text-[11px] font-medium tracking-[0.2em] uppercase text-zinc-300 hover:text-white transition-colors hover-gold-line"
          >
            New Arrivals
          </Link>
          <Link 
            href="/offers" 
            className="text-[11px] font-medium tracking-[0.2em] uppercase text-[#D4AF37] hover:text-[#F3E5AB] transition-colors hover-gold-line"
          >
            Offers
          </Link>
        </nav>

        {/* Brand Center with generous breathing room on both sides */}
        <div className="flex-shrink-0 text-center flex items-center justify-center px-10 lg:px-16 xl:px-20 mx-2">
          <Link href="/" className="group flex items-center justify-center" aria-label="CEYRAA Home">
            <div className="relative h-10 w-24 md:h-12 md:w-28 flex items-center justify-center">
              <Image
                src="/assets/3.3.3.png"
                alt="CEYRAA"
                fill
                priority
                className="object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          </Link>
        </div>

        {/* Navigation Right */}
        <div className="flex items-center justify-end flex-1 space-x-6 pl-6 lg:pl-10">
          <div className="hidden lg:flex items-center space-x-5">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 text-[11px] tracking-[0.2em] uppercase text-zinc-300 hover:text-white transition-colors font-medium border border-white/15 px-4 py-1.5 rounded-full hover:border-[#D4AF37]/50 focus:outline-none bg-white/5">
                  <UserIcon className="h-3 w-3 text-[#D4AF37]" />
                  <span>{user.name}</span>
                  <ChevronDown className="h-3 w-3 text-zinc-400" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52 bg-[#140C24] border border-white/15 text-white rounded-2xl p-1.5 shadow-2xl z-[120]">
                  <div className="px-3 py-2 border-b border-white/10">
                    <p className="text-[10px] uppercase tracking-wider text-zinc-400">Signed in as</p>
                    <p className="text-xs font-medium text-white truncate">{user.email}</p>
                  </div>
                  <DropdownMenuItem asChild>
                    <Link href="/account" className="flex items-center gap-2 px-3 py-2 text-xs text-zinc-200 hover:text-white hover:bg-white/10 rounded-xl cursor-pointer">
                      <UserIcon className="h-3.5 w-3.5 text-[#D4AF37]" />
                      <span>My Account</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/cart" className="flex items-center gap-2 px-3 py-2 text-xs text-zinc-200 hover:text-white hover:bg-white/10 rounded-xl cursor-pointer">
                      <ShoppingBag className="h-3.5 w-3.5 text-[#D4AF37]" />
                      <span>Shopping Bag ({cartCount})</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/10 my-1" />
                  <DropdownMenuItem
                    onClick={() => {
                      logout();
                      toast({
                        title: "Signed Out",
                        description: "You have been signed out successfully.",
                      });
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl cursor-pointer"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <button 
                onClick={() => setAuthModal(true)} 
                className="text-[11px] tracking-[0.2em] uppercase text-zinc-300 hover:text-white transition-colors font-medium"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Cart Bag */}
          <Link 
            href="/cart" 
            className="relative p-2 text-zinc-300 hover:text-white transition-colors"
            aria-label="View Shopping Bag"
          >
            <ShoppingBag className="h-5 w-5 stroke-[1.5]" />
            {cartCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#D4AF37] text-[9px] font-bold text-[#0A0612]">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="lg:hidden p-2 text-zinc-300 hover:text-white focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Clean Full-Screen Mobile Drawer */}
      <div className={`fixed inset-0 z-[110] bg-[#0A0612]/98 backdrop-blur-xl transition-all duration-300 ${
        isOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-4 pointer-events-none'
      }`}>
        <div className="p-6 flex justify-between items-center border-b border-white/10">
          <div className="relative h-9 w-20">
            <Image
              src="/assets/3.3.3.png"
              alt="CEYRAA"
              fill
              className="object-contain"
            />
          </div>
          <button 
            onClick={() => setIsOpen(false)} 
            className="p-2 text-zinc-400 hover:text-white rounded-full border border-white/15"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col items-center justify-center h-[70vh] space-y-7 px-6 text-center">
          <Link 
            href="/" 
            onClick={() => setIsOpen(false)} 
            className="text-xl font-headline tracking-widest text-zinc-200 hover:text-white"
          >
            Home
          </Link>
          <Link 
            href="/#balcony-view" 
            onClick={() => setIsOpen(false)} 
            className="text-xl font-headline tracking-widest text-zinc-200 hover:text-white"
          >
            The Balcony
          </Link>
          <Link 
            href="/shop?wardrobe=Queen%27s%20Wardrobe" 
            onClick={() => setIsOpen(false)} 
            className="text-xl font-headline tracking-widest text-zinc-200 hover:text-white"
          >
            Queen's Wardrobe
          </Link>
          <Link 
            href="/shop?wardrobe=King%27s%20Wardrobe" 
            onClick={() => setIsOpen(false)} 
            className="text-xl font-headline tracking-widest text-zinc-200 hover:text-white"
          >
            King's Wardrobe
          </Link>
          <Link 
            href="/offers" 
            onClick={() => setIsOpen(false)} 
            className="text-xl font-headline tracking-widest text-[#D4AF37] hover:text-[#F3E5AB]"
          >
            Exclusive Offers
          </Link>

          <div className="w-24 h-[1px] bg-white/10 my-2" />

          {user ? (
            <div className="flex flex-col items-center space-y-4 pt-2">
              <div className="text-xs tracking-widest uppercase text-zinc-400">
                Signed in as <span className="text-white font-medium">{user.name}</span>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full max-w-xs">
                <Link 
                  href="/account" 
                  onClick={() => setIsOpen(false)} 
                  className="calm-primary-btn w-full py-2.5 rounded-full text-xs tracking-widest uppercase font-semibold text-center"
                >
                  My Account
                </Link>
                <button 
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                    toast({
                      title: "Signed Out",
                      description: "You have been signed out successfully.",
                    });
                  }} 
                  className="w-full py-2.5 rounded-full border border-white/20 text-xs tracking-widest uppercase text-zinc-300 hover:text-white hover:border-white/40 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <button 
              onClick={() => { setIsOpen(false); setAuthModal(true); }} 
              className="calm-primary-btn px-8 py-2.5 rounded-full text-xs tracking-widest uppercase"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}