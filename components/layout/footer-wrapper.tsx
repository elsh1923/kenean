"use client";

import { usePathname } from "next/navigation";
import { Footer } from "./footer";

export function FooterWrapper() {
  const pathname = usePathname();
  
  // Show footer on home and about pages
  if (pathname !== "/" && pathname !== "/about") {
    return null;
  }

  return <Footer />;
}
