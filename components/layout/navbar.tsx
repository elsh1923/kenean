"use client";

import Link from "next/link";
import { signIn, signOut, useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { 
  BookOpen, 
  Menu, 
  X, 
  ChevronDown, 
  User, 
  Settings, 
  LogOut, 
  LayoutDashboard,
  GraduationCap,
  Shield
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { LanguageSwitcher } from "./LanguageSwitcher";
import { useLanguage } from "@/components/providers/LanguageContext";

export function Navbar() {
  const { dict } = useLanguage();
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  // Close menus when pathname changes
  useEffect(() => {
    setIsOpen(false);
    setIsProfileOpen(false);
  }, [pathname]);

  // Click outside handler for profile dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
          router.refresh();
        }
      }
    });
  };

  const navLinks = [
    { 
      href: "/lessons", 
      label: dict.nav.lessons,
      children: [
        { href: "/lessons?type=VIDEO", label: dict.nav.videos },
        { href: "/lessons?type=BOOK", label: dict.nav.books },
      ]
    },
    { href: "/questions", label: dict.nav.qa },
    { href: "/about", label: dict.nav.about },
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
            {(dict as any).common.siteName}
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <div key={link.label} className="relative group/nav">
              {link.children ? (
                <div className="flex items-center gap-1 cursor-default py-2">
                  <span className="text-sm font-medium hover:text-accent transition-colors">
                    {link.label}
                  </span>
                  <ChevronDown className="h-3 w-3 text-muted-foreground group-hover/nav:text-accent group-hover/nav:rotate-180 transition-all duration-300" />
                  
                  {/* Dropdown Menu */}
                  <div className="absolute top-full left-0 pt-2 opacity-0 translate-y-2 pointer-events-none group-hover/nav:opacity-100 group-hover/nav:translate-y-0 group-hover/nav:pointer-events-auto transition-all duration-200">
                    <div className="bg-card border border-border rounded-xl shadow-xl p-2 min-w-[160px] backdrop-blur-md bg-card/95">
                      {link.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium hover:bg-secondary hover:text-accent transition-all"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  href={link.href}
                  className="text-sm font-medium hover:text-accent transition-colors py-2 block"
                >
                  {link.label}
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          <LanguageSwitcher />
          {session ? (
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 p-1 rounded-full hover:bg-secondary transition-all"
              >
                <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold border-2 border-accent/20 overflow-hidden shadow-sm">
                  {session.user.image ? (
                    <img 
                      src={session.user.image} 
                      alt={session.user.name || "User"} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    session.user.name?.charAt(0).toUpperCase() || <User className="w-5 h-5" />
                  )}
                </div>
                <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform duration-200", isProfileOpen && "rotate-180")} />
              </button>

              {/* Profile Dropdown */}
              <div className={cn(
                "absolute top-full right-0 mt-2 w-56 bg-card border border-border rounded-xl shadow-2xl p-2 backdrop-blur-md bg-card/95 transition-all duration-200",
                isProfileOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
              )}>
                <div className="px-3 py-2 border-b border-border/50 mb-1">
                  <p className="text-sm font-bold text-foreground line-clamp-1">{session.user.name}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1">{session.user.email}</p>
                  <span className="mt-1 inline-block px-2 py-0.5 rounded-full bg-accent/10 text-[10px] font-bold text-accent uppercase tracking-widest">
                    {session.user.role}
                  </span>
                </div>
                
                <Link href="/profile" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium hover:bg-secondary hover:text-accent transition-all">
                  <User className="w-4 h-4" /> {dict.nav.profile}
                </Link>

                {session.user.role === "admin" && (
                  <Link href="/admin" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium hover:bg-secondary hover:text-accent transition-all">
                    <Shield className="w-4 h-4" /> {dict.nav.adminPanel}
                  </Link>
                )}

                {session.user.role === "teacher" && (
                  <Link href="/teacher" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium hover:bg-secondary hover:text-accent transition-all">
                    <GraduationCap className="w-4 h-4" /> {dict.nav.teacherWorkspace}
                  </Link>
                )}

                <div className="h-px bg-border/50 my-1" />
                
                <button 
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-500/10 transition-all"
                >
                  <LogOut className="w-4 h-4" /> {dict.nav.signOut}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm font-medium px-4 py-2 hover:bg-secondary rounded-md transition-colors"
              >
                {dict.nav.signIn}
              </Link>
              <Link
                href="/register"
                className="text-sm font-medium px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors shadow-sm"
              >
                {dict.nav.joinNow}
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-2">
          <LanguageSwitcher />
          <button
            className="p-2 text-primary"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden border-t bg-background p-4 flex flex-col gap-4 animate-in slide-in-from-top-5">
          {session && (
            <div className="flex items-center gap-3 px-2 py-3 bg-secondary/30 rounded-xl mb-2">
              <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold border border-primary/20 overflow-hidden">
                {session.user.image ? (
                  <img src={session.user.image} alt={session.user.name || "User"} className="w-full h-full object-cover" />
                ) : (
                  session.user.name?.charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">{session.user.name}</p>
                <p className="text-xs text-muted-foreground">{session.user.email}</p>
              </div>
            </div>
          )}

          {navLinks.map((link) => (
            <div key={link.label}>
              {link.children ? (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-2">
                    {link.label}
                  </span>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {link.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="text-sm font-medium p-3 bg-secondary/50 hover:bg-secondary rounded-lg border border-border/50"
                        onClick={() => setIsOpen(false)}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link
                  href={link.href}
                  className="text-base font-medium p-2 hover:bg-secondary rounded-md block"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              )}
            </div>
          ))}

          <div className="h-px bg-border my-2" />

          {session ? (
            <div className="flex flex-col gap-2">
                <Link
                  href="/profile"
                  className="w-full flex items-center gap-3 px-4 py-3 border rounded-xl hover:bg-secondary transition-colors font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  <User className="w-5 h-5 text-accent" /> {dict.nav.profile}
                </Link>
              {session.user.role === "admin" && (
                  <Link
                    href="/admin"
                    className="w-full flex items-center gap-3 px-4 py-3 border rounded-xl hover:bg-secondary transition-colors font-medium text-primary"
                    onClick={() => setIsOpen(false)}
                  >
                    <Shield className="w-5 h-5" /> {dict.nav.adminPanel}
                  </Link>
              )}
              {session.user.role === "teacher" && (
                  <Link
                    href="/teacher"
                    className="w-full flex items-center gap-3 px-4 py-3 border rounded-xl hover:bg-secondary transition-colors font-medium text-primary"
                    onClick={() => setIsOpen(false)}
                  >
                    <GraduationCap className="w-5 h-5" /> {dict.nav.teacherWorkspace}
                  </Link>
              )}
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-red-500/10 text-red-500 rounded-xl font-bold mt-2"
                >
                  <LogOut className="w-5 h-5" /> {dict.nav.signOut}
                </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 mt-2">
              <Link
                href="/login"
                className="w-full text-center px-4 py-2 border rounded-md hover:bg-secondary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {dict.nav.signIn}
              </Link>
              <Link
                href="/register"
                className="w-full text-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {dict.nav.joinNow}
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
