"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface Props {
  children: React.ReactNode;
}

export default function ClientShell({ children }: Props) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  return (
    <>
      {!isAdmin && <Navbar />}
      <main style={{ flex: 1 }}>{children}</main>
      {!isAdmin && <Footer />}
    </>
  );
}