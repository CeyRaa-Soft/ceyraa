"use client";

import { useState } from 'react';
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
      // Simulate login with local store
      login(email);
      setAuthModal(false);
    }
  };

  const handleSocialSignIn = (provider: string) => {
    // Simulate social sign in
    login(`${provider.toLowerCase()}@example.com`);
    setAuthModal(false);
  };

  return (
    <Dialog open={isAuthModalOpen} onOpenChange={setAuthModal}>
      <DialogContent className="sm:max-w-[450px] border-none rounded-[3rem] p-10 bg-white/90 backdrop-blur-2xl shadow-2xl overflow-hidden">
        <DialogHeader className="mb-8">
          <DialogTitle className="font-headline text-4xl text-center tracking-tighter uppercase">
            {isLogin ? 'Welcome Back' : 'Create Profile'}
          </DialogTitle>
          <p className="text-[9px] text-center tracking-[0.5em] font-bold text-muted-foreground uppercase mt-4">CeyRaa Membership Access</p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Social Logins */}
          <div className="grid grid-cols-1 gap-4">
            <Button 
              onClick={() => handleSocialSignIn('Google')}
              variant="outline" 
              className="rounded-full py-7 text-[10px] tracking-[0.4em] font-bold border-primary/10 hover:bg-primary/5 transition-all"
            >
              CONTINUE WITH GOOGLE
            </Button>
            <Button 
              onClick={() => handleSocialSignIn('Twitter')}
              variant="outline" 
              className="rounded-full py-7 text-[10px] tracking-[0.4em] font-bold border-primary/10 hover:bg-primary/5 transition-all"
            >
              CONTINUE WITH X
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full opacity-10" />
            </div>
            <div className="relative flex justify-center text-[8px] uppercase tracking-[0.4em] font-bold">
              <span className="bg-transparent px-2 text-muted-foreground/60">or identifier access</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <Label htmlFor="email" className="text-[9px] uppercase tracking-[0.5em] font-black text-muted-foreground/60 ml-4">Identifier</Label>
              <Input
                id="email"
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-full bg-secondary/30 border-none px-8 py-7 text-[11px] tracking-widest focus-visible:ring-1 focus-visible:ring-accent"
                required
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="password" className="text-[9px] uppercase tracking-[0.5em] font-black text-muted-foreground/60 ml-4">Credential</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-full bg-secondary/30 border-none px-8 py-7 text-[11px] tracking-widest focus-visible:ring-1 focus-visible:ring-accent"
                required
              />
            </div>
            <Button type="submit" className="w-full rounded-full bg-primary py-8 text-[10px] tracking-[0.6em] font-bold hover:bg-accent transition-all shadow-xl hover:shadow-accent/20">
              {isLogin ? 'ENTER CABINET' : 'REGISTER PROFILE'}
            </Button>
            <div className="text-center pt-4">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-[9px] uppercase tracking-[0.4em] font-bold text-muted-foreground hover:text-accent transition-all underline underline-offset-8 decoration-primary/10 hover:decoration-accent/40"
              >
                {isLogin ? "Request Membership Profile" : 'Have an existing profile? Sign In'}
              </button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}