"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquare,
  LogOut,
  Menu,
  X,
  UserCircle,
  Home,
  Shield,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useSession } from "@/lib/auth-client";
import { useLanguage } from "@/components/providers/LanguageContext";

export function TeacherSidebar({ userName }: { userName?: string }) {
  const { dict } = useLanguage();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { data: session } = useSession();

  const navigation = [
    {
      name: "Main Site",
      href: "/",
      icon: Home,
    },
    {
      name: (dict as any).teacher.dashboard,
      href: "/teacher",
      icon: LayoutDashboard,
    },
    {
      name: (dict as any).teacher.questions,
      href: "/teacher/questions",
      icon: MessageSquare,
    },
    {
      name: (dict as any).teacher.profile,
      href: "/teacher/profile",
      icon: UserCircle,
    },
  ];

  const isAdmin = session?.user?.role === "admin";

  return (
    <>
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-primary-dark/80 backdrop-blur-md text-white"
      >
        {isMobileMenuOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </button>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-gradient-to-b from-primary-dark via-primary-dark/95 to-primary-dark/90 backdrop-blur-xl border-r border-gold/20 transition-transform duration-300 ease-in-out",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full font-sans">
          <div className="p-6 border-b border-gold/20">
            <h1 className="text-2xl font-serif font-bold text-gold">
              {(dict as any).nav.lessons} {/* Using Lessons for "Panel" or just translate Teacher Panel */}
              Teacher Panel
            </h1>
            {userName && (
              <p className="mt-2 text-sm text-gray-300">
                {(dict as any).auth.welcomeBack}, {userName}
              </p>
            )}
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/teacher" && pathname.startsWith(item.href));
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                    isActive
                      ? "bg-gold/20 text-gold border border-gold/30 shadow-lg shadow-gold/10"
                      : "text-gray-300 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gold/20">
            <Link
              href="/api/auth/sign-out"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-red-500/20 hover:text-red-400 transition-all duration-200"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">{(dict as any).profile.signOut}</span>
            </Link>
          </div>
        </div>
      </aside>

      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30"
        />
      )}
    </>
  );
}
