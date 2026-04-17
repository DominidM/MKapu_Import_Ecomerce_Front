"use client";

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/app/context/CartContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { usePathname } from "next/navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isAdmin = pathname.includes("/admin");
  const isAdminLogin = pathname.includes("/admin/login");

  return (
    <html lang="es" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <link 
          rel="icon" 
          href="https://res.cloudinary.com/dxuk9bogw/image/upload/w_32,h_32,c_fill/v1767836605/474716814_581641201299027_4444346315622797816_n_karlgu.png"
          type="image/png"
        />
        <link 
          rel="apple-touch-icon"
          href="https://res.cloudinary.com/dxuk9bogw/image/upload/w_180,h_180,c_fill/v1767836605/474716814_581641201299027_4444346315622797816_n_karlgu.png"
        />
      </head>
      <body
        suppressHydrationWarning
        style={{ minHeight: "100vh", display: "flex", flexDirection: "column", margin: 0, padding: 0 }}
      >
        <CartProvider>
          {!isAdmin && <Navbar />}
          <main style={{ flex: 1 }}>{children}</main>
          {!isAdmin && <Footer />}
          <WhatsAppButton />
        </CartProvider>
      </body>
    </html>
  );
}