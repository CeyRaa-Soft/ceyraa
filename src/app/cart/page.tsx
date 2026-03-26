"use client";

import { useCartStore, useAuthStore, useUIStore } from '@/store/useStore';
import Navbar from '@/components/layout/Navbar';
import AuthModal from '@/components/auth/AuthModal';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Trash2, Minus, Plus, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const { items, updateQuantity, removeItem } = useCartStore();
  const { user } = useAuthStore();
  const { setAuthModal } = useUIStore();
  const router = useRouter();

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  useEffect(() => {
    if (!user) {
      setAuthModal(true);
    }
  }, [user, setAuthModal]);

  if (!user) {
    return (
      <div className="min-h-screen bg-mesh">
        <Navbar />
        <AuthModal />
        <div className="flex flex-col items-center justify-center py-60 text-center space-y-10">
          <h2 className="font-headline text-5xl md:text-7xl tracking-tighter uppercase">Sign In</h2>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.6em] font-bold">Access your personal archive</p>
          <Button onClick={() => setAuthModal(true)} className="rounded-full px-16 py-8 text-[10px] tracking-[0.5em] font-bold">AUTHENTICATE</Button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-mesh">
        <Navbar />
        <AuthModal />
        <div className="flex flex-col items-center justify-center py-60 text-center space-y-10">
          <div className="w-24 h-24 bg-accent/5 rounded-full flex items-center justify-center animate-pulse">
            <ShoppingBag className="h-8 w-8 text-accent" />
          </div>
          <h2 className="font-headline text-5xl md:text-7xl tracking-tighter uppercase">Your Bag is Empty</h2>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.5em] font-bold">Discover our latest collection pieces.</p>
          <Link href="/shop">
            <Button className="rounded-full px-16 py-8 text-[10px] tracking-[0.5em] font-bold">EXPLORE SHOP</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mesh">
      <Navbar />
      <AuthModal />
      
      <main className="max-w-[1400px] mx-auto px-6 lg:px-12 py-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
          <div className="lg:col-span-8 space-y-16">
            <div className="space-y-4">
               <span className="text-[10px] tracking-[0.6em] font-bold text-accent uppercase">Checkout</span>
               <h1 className="font-headline text-6xl tracking-tighter uppercase">Shopping Bag <span className="text-muted-foreground/30 italic">({items.length})</span></h1>
            </div>
            
            <div className="space-y-12">
              {items.map((item) => (
                <div key={`${item.productId}-${item.color}-${item.size}`} className="flex flex-col md:flex-row gap-10 glass-card p-8 rounded-[3rem] transition-all hover:shadow-2xl hover:shadow-primary/5">
                  <div className="relative aspect-[3/4] w-full md:w-56 flex-shrink-0 bg-secondary/30 rounded-[2rem] overflow-hidden shadow-xl">
                    <Image src={item.image} alt={item.productName} fill className="object-cover" />
                  </div>
                  
                  <div className="flex flex-col justify-between flex-grow py-4">
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <Link href={`/product/${item.productId}`} className="font-headline text-2xl hover:text-accent transition-colors tracking-tight uppercase">
                          {item.productName}
                        </Link>
                        <span className="text-xl font-bold tracking-tight">${item.price * item.quantity}</span>
                      </div>
                      <div className="flex gap-4 text-[9px] tracking-[0.4em] font-black text-muted-foreground/60 uppercase">
                        <span>Color: {item.color}</span>
                        <span className="opacity-20">|</span>
                        <span>Size: {item.size}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-10">
                      <div className="flex items-center bg-white/50 rounded-full border border-primary/5 px-4 py-2">
                        <button 
                          onClick={() => updateQuantity(item.productId, item.color, item.size, -1)}
                          className="p-3 hover:text-accent transition-colors"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-12 text-center text-xs font-black tracking-widest">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.productId, item.color, item.size, 1)}
                          className="p-3 hover:text-accent transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      
                      <button 
                        onClick={() => removeItem(item.productId, item.color, item.size)}
                        className="p-4 bg-destructive/5 text-destructive hover:bg-destructive hover:text-white rounded-full transition-all duration-500"
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

          <div className="lg:col-span-4 lg:sticky lg:top-32 self-start">
            <div className="glass-card p-10 rounded-[3rem] space-y-12">
              <h2 className="text-[10px] tracking-[0.5em] font-black uppercase border-b border-primary/5 pb-6">Summary</h2>
              
              <div className="space-y-6">
                <div className="flex justify-between text-[10px] tracking-[0.3em] font-bold text-muted-foreground uppercase">
                  <span>Subtotal</span>
                  <span className="text-foreground">${subtotal}</span>
                </div>
                <div className="flex justify-between text-[10px] tracking-[0.3em] font-bold text-muted-foreground uppercase">
                  <span>Shipping</span>
                  <span className="text-accent">Complimentary</span>
                </div>
                <div className="pt-8 border-t border-primary/5 flex justify-between items-end">
                  <span className="text-[10px] tracking-[0.5em] font-black uppercase">Total</span>
                  <span className="text-4xl font-headline tracking-tighter">${subtotal}</span>
                </div>
              </div>

              <Link href="/checkout" className="block">
                <Button className="w-full rounded-full py-10 text-[10px] tracking-[0.5em] font-black bg-primary hover:bg-accent shadow-2xl hover:shadow-accent/20">
                  SECURE CHECKOUT
                </Button>
              </Link>
              
              <div className="space-y-4 text-center">
                <p className="text-[8px] text-muted-foreground/40 tracking-[0.6em] font-black uppercase">Protected Payment Systems</p>
                <div className="flex justify-center gap-6 opacity-20 grayscale scale-75">
                  <span className="text-[10px] font-bold">VISA</span>
                  <span className="text-[10px] font-bold">AMEX</span>
                  <span className="text-[10px] font-bold">APPLE</span>
                </div>
              </div>
            </div>
            
            <Link href="/shop" className="flex items-center justify-center gap-3 mt-12 text-[10px] tracking-[0.5em] font-bold text-muted-foreground hover:text-accent transition-all">
              <ArrowLeft className="h-3 w-3" />
              CONTINUE BROWSING
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
