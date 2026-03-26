import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CeyRaa Luxury Fashion",
  description: "Premium Luxury Fashion Platform",
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
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased selection:bg-accent/40 selection:text-foreground">
        {/* Global Liquid Archive Layers */}
        <div className="global-dynamic-bg">
          <div className="bg-blob bg-blob-1" />
          <div className="bg-blob bg-blob-2" />
          <div className="bg-blob bg-blob-3" />
        </div>
        <div className="bg-grain" />

        <div className="relative z-0">{children}</div>
      </body>
    </html>
  );
}
