"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import AuthModal from "@/components/auth/AuthModal";
import { useAuthStore, useCartStore, useUIStore } from "@/store/useStore";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  User,
  Mail,
  Phone,
  MapPin,
  ShoppingBag,
  LogOut,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building,
} from "lucide-react";

export default function AccountPage() {
  const { user, logout, updateUser } = useAuthStore();
  const { setAuthModal } = useUIStore();
  const cartItems = useCartStore((state) => state.items);
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [primaryPhone, setPrimaryPhone] = useState("");
  const [secondaryPhone, setSecondaryPhone] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setPrimaryPhone(user.primaryPhone || user.phone || "");
      setSecondaryPhone(user.secondaryPhone || "");
      setAddressLine1(user.addressLine1 || user.address || "");
      setAddressLine2(user.addressLine2 || "");
      setCity(user.city || "");
      setPostalCode(user.postalCode || "");
    }
  }, [user]);

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const fullAddress = [
      addressLine1.trim(),
      addressLine2.trim(),
      city.trim(),
      postalCode.trim(),
    ]
      .filter(Boolean)
      .join(", ");

    updateUser({
      name: name.trim() || user?.name,
      primaryPhone: primaryPhone.trim(),
      secondaryPhone: secondaryPhone.trim(),
      addressLine1: addressLine1.trim(),
      addressLine2: addressLine2.trim(),
      city: city.trim(),
      postalCode: postalCode.trim(),
      phone: primaryPhone.trim(),
      address: fullAddress,
    });

    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Personal Details Saved",
        description: "Your delivery address and contact details have been updated.",
      });
    }, 300);
  };

  const handleLogout = () => {
    logout();
    toast({
      title: "Signed Out",
      description: "You have been signed out of your CEYRAA account.",
    });
  };

  return (
    <div className="min-h-screen text-[#F7F5FA] pb-28">
      <Navbar />
      <AuthModal />

      <main className="max-w-[1500px] mx-auto px-6 sm:px-10 lg:px-12 pt-32 sm:pt-36">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center space-x-2 text-[11px] text-zinc-400 mb-8">
          <Link href="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <span className="text-zinc-600">/</span>
          <span className="text-zinc-200">My Account</span>
        </div>

        {!user ? (
          /* Unauthenticated State */
          <div className="max-w-xl mx-auto my-12 calm-card p-8 sm:p-12 rounded-3xl border border-white/10 text-center space-y-6 shadow-2xl">
            <div className="relative h-9 w-28 mx-auto">
              <Image
                src="/assets/1.1.png"
                alt="CEYRAA"
                fill
                className="object-contain"
              />
            </div>
            <div className="space-y-2">
              <h1 className="font-headline text-3xl font-normal text-white uppercase">
                Account Access
              </h1>
              <p className="text-xs text-zinc-400 font-light leading-relaxed max-w-sm mx-auto">
                Sign in to manage your wardrobe account, view your shopping bag, and enjoy personalized tailoring service.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center items-center">
              <Button
                onClick={() => setAuthModal(true)}
                className="w-full sm:w-auto calm-primary-btn rounded-full px-8 py-5 text-xs tracking-widest uppercase font-semibold"
              >
                Sign In / Register
              </Button>
              <Link href="/shop" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  className="w-full rounded-full px-8 py-5 text-xs tracking-widest uppercase border-white/15 hover:bg-white/5 text-zinc-300 hover:text-white"
                >
                  Explore Wardrobe
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          /* Authenticated User View */
          <div className="space-y-10">
            {/* Account Header Hero */}
            <div className="calm-card p-6 sm:p-10 rounded-3xl border border-white/10 shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-[#1E1236] to-[#3B2064] border border-[#D4AF37]/40 flex items-center justify-center text-xl sm:text-2xl font-bold text-[#D4AF37] shadow-xl">
                  {user.name ? user.name.slice(0, 2).toUpperCase() : "CR"}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <h1 className="font-headline text-2xl sm:text-3xl font-normal text-white">
                      {user.name}
                    </h1>
                    <span className="inline-flex items-center gap-1 text-[10px] tracking-wider uppercase bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 px-2.5 py-0.5 rounded-full font-semibold">
                      <Sparkles className="w-2.5 h-2.5" /> Member
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 font-light flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-zinc-500" /> {user.email}
                  </p>
                </div>
              </div>

              {/* Logout Button */}
              <Button
                onClick={handleLogout}
                variant="outline"
                className="rounded-full px-6 py-2.5 text-xs tracking-widest uppercase border-rose-500/30 hover:border-rose-500 text-rose-300 hover:text-rose-200 hover:bg-rose-500/10 transition-all flex items-center gap-2"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </Button>
            </div>

            {/* Account Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Personal Details & Delivery Address Form (7 cols) */}
              <div className="lg:col-span-7 calm-card p-6 sm:p-8 rounded-3xl border border-white/10 shadow-xl space-y-7">
                <div className="border-b border-white/10 pb-4">
                  <h2 className="font-headline text-xl font-normal text-white uppercase tracking-wide">
                    Personal Details
                  </h2>
                  <p className="text-xs text-zinc-400 font-light mt-1">
                    Manage your contact information and delivery address. All fields are optional.
                  </p>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-6">
                  {/* General Information */}
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="account-name" className="text-xs uppercase tracking-wider text-zinc-300 font-medium">
                        Full Name
                      </Label>
                      <Input
                        id="account-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your full name"
                        className="rounded-xl bg-[#140C24] border border-white/15 text-white placeholder-zinc-500 px-4 py-3 text-xs tracking-wider focus-visible:ring-1 focus-visible:ring-white/30"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="account-email" className="text-xs uppercase tracking-wider text-zinc-300 font-medium">
                        Email Address
                      </Label>
                      <Input
                        id="account-email"
                        value={user.email}
                        disabled
                        className="rounded-xl bg-white/5 border border-white/10 text-zinc-400 px-4 py-3 text-xs tracking-wider cursor-not-allowed"
                      />
                      <p className="text-[10px] text-zinc-500">
                        Your registered account email address.
                      </p>
                    </div>
                  </div>

                  {/* Phone Numbers Section */}
                  <div className="pt-2 border-t border-white/10 space-y-3">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-200">
                        Contact Numbers
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="primary-phone" className="text-[11px] uppercase tracking-wider text-zinc-400 font-medium">
                          Primary Phone
                        </Label>
                        <Input
                          id="primary-phone"
                          value={primaryPhone}
                          onChange={(e) => setPrimaryPhone(e.target.value)}
                          placeholder="e.g. +94 77 123 4567"
                          className="rounded-xl bg-[#140C24] border border-white/15 text-white placeholder-zinc-500 px-4 py-3 text-xs tracking-wider focus-visible:ring-1 focus-visible:ring-white/30"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="secondary-phone" className="text-[11px] uppercase tracking-wider text-zinc-400 font-medium">
                          Secondary Phone (Optional)
                        </Label>
                        <Input
                          id="secondary-phone"
                          value={secondaryPhone}
                          onChange={(e) => setSecondaryPhone(e.target.value)}
                          placeholder="e.g. +94 71 987 6543"
                          className="rounded-xl bg-[#140C24] border border-white/15 text-white placeholder-zinc-500 px-4 py-3 text-xs tracking-wider focus-visible:ring-1 focus-visible:ring-white/30"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Delivery Address Section */}
                  <div className="pt-2 border-t border-white/10 space-y-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-200">
                        Delivery Address
                      </h3>
                    </div>

                    <div className="space-y-3.5">
                      <div className="space-y-1.5">
                        <Label htmlFor="address-line1" className="text-[11px] uppercase tracking-wider text-zinc-400 font-medium">
                          Address Line 1
                        </Label>
                        <Input
                          id="address-line1"
                          value={addressLine1}
                          onChange={(e) => setAddressLine1(e.target.value)}
                          placeholder="Street address, House / Building No."
                          className="rounded-xl bg-[#140C24] border border-white/15 text-white placeholder-zinc-500 px-4 py-3 text-xs tracking-wider focus-visible:ring-1 focus-visible:ring-white/30"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="address-line2" className="text-[11px] uppercase tracking-wider text-zinc-400 font-medium">
                          Address Line 2 (Optional)
                        </Label>
                        <Input
                          id="address-line2"
                          value={addressLine2}
                          onChange={(e) => setAddressLine2(e.target.value)}
                          placeholder="Apartment, Suite, Unit, Landmark (Optional)"
                          className="rounded-xl bg-[#140C24] border border-white/15 text-white placeholder-zinc-500 px-4 py-3 text-xs tracking-wider focus-visible:ring-1 focus-visible:ring-white/30"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="address-city" className="text-[11px] uppercase tracking-wider text-zinc-400 font-medium">
                            City / Town
                          </Label>
                          <Input
                            id="address-city"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder="e.g. Colombo, Kandy, Galle"
                            className="rounded-xl bg-[#140C24] border border-white/15 text-white placeholder-zinc-500 px-4 py-3 text-xs tracking-wider focus-visible:ring-1 focus-visible:ring-white/30"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor="address-postal" className="text-[11px] uppercase tracking-wider text-zinc-400 font-medium">
                            Postal / ZIP Code
                          </Label>
                          <Input
                            id="address-postal"
                            value={postalCode}
                            onChange={(e) => setPostalCode(e.target.value)}
                            placeholder="e.g. 00700"
                            className="rounded-xl bg-[#140C24] border border-white/15 text-white placeholder-zinc-500 px-4 py-3 text-xs tracking-wider focus-visible:ring-1 focus-visible:ring-white/30"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3">
                    <Button
                      type="submit"
                      disabled={isSaving}
                      className="calm-primary-btn rounded-full px-8 py-3.5 text-xs tracking-widest uppercase font-semibold"
                    >
                      {isSaving ? "Saving..." : "Save Personal Details"}
                    </Button>
                  </div>
                </form>
              </div>

              {/* Right Column: Shopping Bag, Address Preview & Wardrobe Links (5 cols) */}
              <div className="lg:col-span-5 space-y-6">
                {/* Active Bag Summary */}
                <div className="calm-card p-6 sm:p-7 rounded-3xl border border-white/10 shadow-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2.5 rounded-full bg-white/5 border border-white/10 text-[#D4AF37]">
                        <ShoppingBag className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-headline text-lg text-white uppercase tracking-wide">
                          Shopping Bag
                        </h3>
                        <p className="text-[11px] text-zinc-400 font-light">
                          {cartCount} {cartCount === 1 ? "piece" : "pieces"} waiting for checkout
                        </p>
                      </div>
                    </div>
                  </div>

                  <Link href="/cart">
                    <Button className="w-full rounded-full calm-primary-btn py-4 text-xs tracking-widest uppercase font-semibold flex items-center justify-center gap-2 mt-2">
                      <span>View Bag & Checkout</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>

                {/* Saved Delivery Destination Preview */}
                {(user.addressLine1 || user.city || user.primaryPhone) && (
                  <div className="calm-card p-6 rounded-3xl border border-[#D4AF37]/20 bg-[#160E28]/60 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#D4AF37] uppercase tracking-wider">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Current Delivery Destination</span>
                    </div>

                    <div className="text-xs text-zinc-300 font-light space-y-1">
                      {user.addressLine1 && <p>{user.addressLine1}</p>}
                      {user.addressLine2 && <p className="text-zinc-400">{user.addressLine2}</p>}
                      {(user.city || user.postalCode) && (
                        <p className="text-zinc-200">
                          {[user.city, user.postalCode].filter(Boolean).join(" - ")}
                        </p>
                      )}
                    </div>

                    {(user.primaryPhone || user.secondaryPhone) && (
                      <div className="pt-2 border-t border-white/10 text-[11px] text-zinc-400 font-light space-y-0.5">
                        {user.primaryPhone && (
                          <p className="flex items-center gap-1.5">
                            <span className="text-zinc-500 font-medium">Primary:</span> {user.primaryPhone}
                          </p>
                        )}
                        {user.secondaryPhone && (
                          <p className="flex items-center gap-1.5">
                            <span className="text-zinc-500 font-medium">Secondary:</span> {user.secondaryPhone}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Quick Wardrobe Navigation */}
                <div className="calm-card p-6 sm:p-7 rounded-3xl border border-white/10 shadow-xl space-y-4">
                  <h3 className="font-headline text-sm text-zinc-300 uppercase tracking-widest">
                    Quick Destinations
                  </h3>

                  <div className="space-y-2">
                    <Link
                      href="/shop?category=Queen%27s%20Wardrobe"
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors group"
                    >
                      <span className="text-xs tracking-wider uppercase text-zinc-200 font-medium">
                        Queen's Wardrobe
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
                    </Link>

                    <Link
                      href="/shop?category=King%27s%20Wardrobe"
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors group"
                    >
                      <span className="text-xs tracking-wider uppercase text-zinc-200 font-medium">
                        King's Wardrobe
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
                    </Link>

                    <Link
                      href="/offers"
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/20 transition-colors group"
                    >
                      <span className="text-xs tracking-wider uppercase text-[#D4AF37] font-medium">
                        Exclusive Offers
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#D4AF37] group-hover:translate-x-1 transition-all" />
                    </Link>
                  </div>
                </div>

                {/* Guarantee banner */}
                <div className="calm-card p-5 rounded-2xl border border-white/5 flex items-center gap-3 text-zinc-400">
                  <ShieldCheck className="w-6 h-6 text-[#D4AF37] flex-shrink-0" />
                  <p className="text-[11px] font-light leading-relaxed">
                    Personalized atelier service. Every garment crafted with tailored precision and secure checkout.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
