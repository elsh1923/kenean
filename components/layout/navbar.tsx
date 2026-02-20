"use client";

import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { BookOpen, Menu, X } from "lucide-react";
import { useState } from "react";
import { usePathname } from "next/navigation";

export function Navbar() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  const navLinks = [
    { href: "/lessons", label: "Lessons" },
    { href: "/questions", label: "Q&A" },
    { href: "/about", label: "About" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-primary text-primary-foreground p-1.5 rounded-md">
            <BookOpen className="h-6 w-6" />
          </div>
          <span className="font-serif text-xl font-bold tracking-tight text-primary">
            Kenean
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium hover:text-accent transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

      {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          <ThemeToggle />
          
          {session && !isHomePage ? (
            <div className="flex items-center gap-4">
              {session.user.role === "admin" && (
                <Link 
                  href="/admin" 
                  className="text-sm font-medium text-primary hover:text-accent"
                >
                  Admin
                </Link>
              )}
              <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-primary font-bold border border-primary/10">
                {session.user.name?.charAt(0).toUpperCase()}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm font-medium px-4 py-2 hover:bg-secondary rounded-md transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="text-sm font-medium px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors shadow-sm"
              >
                Join Now
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-primary"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden border-t bg-background p-4 flex flex-col gap-4 animate-in slide-in-from-top-5">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-base font-medium p-2 hover:bg-secondary rounded-md"
              onClick={() => setIsOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="h-px bg-border my-2" />
          <div className="flex items-center justify-between p-2">
            <span className="text-sm font-medium">Switch Theme</span>
            <ThemeToggle />
          </div>
          {(!session || isHomePage) && (
            <div className="flex flex-col gap-2 mt-2">
              <Link
                href="/login"
                className="w-full text-center px-4 py-2 border rounded-md hover:bg-secondary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="w-full text-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Join Now
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
