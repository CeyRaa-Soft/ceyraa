import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "CEYRAA | Fashion & Wardrobe",
  description: "Elevated everyday fashion and timeless wardrobe pieces by CEYRAA.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased selection:bg-accent/20 selection:text-white bg-[#0A0612] text-[#F7F5FA]">
        {/* Calm Atmospheric Lighting */}
        <div className="calm-ambient-bg">
          <div className="calm-glow-orb calm-glow-1" />
          <div className="calm-glow-orb calm-glow-2" />
        </div>

        <div className="relative z-0 min-h-screen">
          {children}
          <Toaster />
        </div>
      </body>
    </html>
  );
}
