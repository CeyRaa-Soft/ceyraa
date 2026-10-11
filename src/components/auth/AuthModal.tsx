"use client";

import { useState } from 'react';
import Image from 'next/image';
import { useUIStore, useAuthStore } from '@/store/useStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

export default function AuthModal() {
  const { isAuthModalOpen, setAuthModal } = useUIStore();
  const { login } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      login(email);
      setAuthModal(false);
    }
  };

  const handleSocialSignIn = (provider: string) => {
    login(`${provider.toLowerCase()}@example.com`);
    setAuthModal(false);
  };

  return (
    <Dialog open={isAuthModalOpen} onOpenChange={setAuthModal}>
      <DialogContent className="sm:max-w-[420px] border border-white/10 rounded-3xl p-8 bg-[#120B20]/95 backdrop-blur-2xl shadow-2xl text-[#F7F5FA]">
        <DialogHeader className="mb-4 text-center flex flex-col items-center">
          <div className="relative h-7 w-28 mb-3">
            <Image
              src="/assets/1.1.png"
              alt="CEYRAA"
              fill
              className="object-contain"
            />
          </div>
          <DialogTitle className="font-headline text-2xl font-normal text-white uppercase">
            {isLogin ? 'Sign In' : 'Create Account'}
          </DialogTitle>
          <p className="text-[10px] text-center tracking-widest text-zinc-400 uppercase mt-1">
            Access your wardrobe and saved pieces
          </p>
        </DialogHeader>

        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-2.5">
            <Button 
              onClick={() => handleSocialSignIn('Google')}
              variant="outline" 
              className="rounded-full py-5 text-xs tracking-wider border-white/15 hover:border-white/30 hover:bg-white/5 text-zinc-200 transition-all font-normal"
            >
              Continue with Google
            </Button>
          </div>

          <div className="relative my-1">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full bg-white/10" />
            </div>
            <div className="relative flex justify-center text-[9px] uppercase tracking-widest text-zinc-500 font-light">
              <span className="bg-[#120B20] px-3">or email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-[10px] uppercase tracking-wider text-zinc-400 font-light ml-2">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-full bg-[#1A102A] border border-white/15 text-white placeholder-zinc-500 px-5 py-5 text-xs tracking-wider focus-visible:ring-1 focus-visible:ring-white/30"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-[10px] uppercase tracking-wider text-zinc-400 font-light ml-2">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-full bg-[#1A102A] border border-white/15 text-white placeholder-zinc-500 px-5 py-5 text-xs tracking-wider focus-visible:ring-1 focus-visible:ring-white/30"
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full rounded-full calm-primary-btn py-5 text-xs tracking-widest font-semibold uppercase transition-all"
            >
              {isLogin ? 'Sign In' : 'Register'}
            </Button>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-[11px] text-zinc-400 hover:text-white transition-colors"
              >
                {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
              </button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}