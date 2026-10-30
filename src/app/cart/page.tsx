"use client";

import { useCartStore, useAuthStore, useUIStore } from '@/store/useStore';
import Navbar from '@/components/layout/Navbar';
import AuthModal from '@/components/auth/AuthModal';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Trash2, Minus, Plus, ShoppingBag, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useEffect } from 'react';

export default function CartPage() {
  const { items, updateQuantity, removeItem } = useCartStore();
  const { user } = useAuthStore();
  const { setAuthModal } = useUIStore();

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  useEffect(() => {
    if (!user) {
      setAuthModal(true);
    }
  }, [user, setAuthModal]);

  if (!user) {
    return (
      <div className="min-h-screen text-[#F7F5FA] flex flex-col justify-center items-center">
        <Navbar />
        <AuthModal />
        <div className="flex flex-col items-center justify-center py-40 text-center space-y-6 calm-card p-10 rounded-2xl border border-white/10 max-w-md mx-6">
          <div className="relative h-7 w-28">
            <Image
              src="/assets/1.1.png"
              alt="CEYRAA"
              fill
              className="object-contain"
            />
          </div>
          <h2 className="font-headline text-2xl font-normal text-white uppercase">
            Sign In Required
          </h2>
          <p className="text-xs text-zinc-400 font-light leading-relaxed">
            Please sign in to view your shopping bag and proceed to checkout.
          </p>
          <Button 
            onClick={() => setAuthModal(true)} 
            className="calm-primary-btn rounded-full px-8 py-5 text-xs tracking-widest uppercase font-semibold"
          >
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen text-[#F7F5FA] flex flex-col justify-center items-center">
        <Navbar />
        <AuthModal />
        <div className="flex flex-col items-center justify-center py-40 text-center space-y-6 calm-card p-10 rounded-2xl border border-white/10 max-w-md mx-6">
          <div className="w-16 h-16 rounded-full calm-glass flex items-center justify-center">
            <ShoppingBag className="h-6 w-6 text-zinc-400" />
          </div>
          <h2 className="font-headline text-2xl font-normal text-white uppercase">
            Your Bag is Empty
          </h2>
          <p className="text-xs text-zinc-400 font-light leading-relaxed">
            Explore our collection to add elevated pieces to your wardrobe.
          </p>
          <Link href="/shop">
            <Button className="calm-primary-btn rounded-full px-8 py-5 text-xs tracking-widest uppercase font-semibold">
              Explore Collection
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-[#F7F5FA]">
      <Navbar />
      <AuthModal />
      
      <main className="max-w-[1700px] mx-auto px-6 lg:px-12 pt-32 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Items Column */}
          <div className="lg:col-span-8 space-y-8">
            <div className="space-y-2 border-b border-white/10 pb-6">
              <span className="text-[10px] tracking-widest uppercase text-[#D4AF37] font-medium">
                Shopping Bag
              </span>
              <h1 className="font-headline text-3xl sm:text-4xl font-normal text-white uppercase">
                Your Bag ({items.length})
              </h1>
            </div>
            
            <div className="space-y-4">
              {items.map((item) => (
                <div 
                  key={`${item.productId}-${item.color}-${item.size}`} 
                  className="flex flex-col sm:flex-row gap-5 calm-card p-5 rounded-2xl border border-white/10"
                >
                  <div className="relative aspect-[2/3] w-full sm:w-32 flex-shrink-0 bg-[#140C24] rounded-xl overflow-hidden">
                    <Image 
                      src={item.image || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80"} 
                      alt={item.productName} 
                      fill 
                      className="object-cover" 
                    />
                  </div>
                  
                  <div className="flex flex-col justify-between flex-grow py-1">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start gap-4">
                        <Link 
                          href={`/product/${item.productId}`} 
                          className="font-headline text-lg font-medium text-white hover:text-[#D4AF37] transition-colors"
                        >
                          {item.productName}
                        </Link>
                        <span className="text-base font-medium text-[#D4AF37]">
                          LKR {(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex gap-3 text-xs text-zinc-400 font-light">
                        <span>Color: <strong className="text-zinc-200 font-normal">{item.color}</strong></span>
                        <span>/</span>
                        <span>Size: <strong className="text-zinc-200 font-normal">{item.size}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
                      <div className="flex items-center calm-glass rounded-full px-3 py-1 border border-white/10">
                        <button 
                          onClick={() => updateQuantity(item.productId, item.color, item.size, -1)}
                          className="p-1 text-zinc-400 hover:text-white transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center text-xs text-white">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.productId, item.color, item.size, 1)}
                          className="p-1 text-zinc-400 hover:text-white transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      
                      <button 
                        onClick={() => removeItem(item.productId, item.color, item.size)}
                        className="p-2 text-zinc-400 hover:text-red-400 transition-colors"
                        title="Remove Item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary Column */}
          <div className="lg:col-span-4 lg:sticky lg:top-32">
            <div className="calm-card p-6 sm:p-8 rounded-2xl border border-white/10 space-y-6">
              <h2 className="text-xs tracking-widest font-medium uppercase text-white border-b border-white/10 pb-3">
                Order Summary
              </h2>
              
              <div className="space-y-3 text-xs">
                <div className="flex justify-between text-zinc-400 font-light">
                  <span>Subtotal</span>
                  <span className="text-white font-normal">LKR {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-zinc-400 font-light">
                  <span>Delivery</span>
                  <span className="text-[#D4AF37]">Complimentary</span>
                </div>
                <div className="pt-3 border-t border-white/10 flex justify-between items-baseline">
                  <span className="text-xs uppercase tracking-wider text-white font-medium">Total</span>
                  <span className="text-xl font-headline text-white font-normal">
                    LKR {subtotal.toLocaleString()}
                  </span>
                </div>
              </div>

              <Button className="w-full calm-primary-btn py-5 rounded-full text-xs tracking-widest font-semibold uppercase">
                Proceed to Checkout
              </Button>
              
              <div className="pt-1 text-center">
                <div className="flex items-center justify-center gap-2 text-[11px] text-zinc-400 font-light">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Secure & Encrypted Checkout</span>
                </div>
              </div>
            </div>
            
            <Link 
              href="/shop" 
              className="flex items-center justify-center gap-2 mt-6 text-xs text-zinc-400 hover:text-white transition-colors font-light"
            >
              <ArrowLeft className="h-3 w-3" />
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
