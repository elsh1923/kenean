"use client";

import { useState } from "react";
import { signIn } from "@/lib/auth-client";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Mail, Lock, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data, error: authError } = await signIn.email({
        email,
        password,
      });

      if (authError) {
        setError(authError.message || "Invalid credentials. Please try again.");
      } else {
        setSuccess(true);
        // Use role from the direct signIn response — no extra API call needed
        const userRole = (data?.user as any)?.role;
        const targetUrl = userRole === "admin" ? "/admin" : "/profile";
        router.replace(targetUrl);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4 text-center bg-accent/5 rounded-xl border border-accent/20 animate-in zoom-in-95 duration-500">
        <div className="p-4 bg-green-500/10 rounded-full">
          <CheckCircle2 className="w-12 h-12 text-green-500" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-foreground">Welcome Back!</h2>
        <p className="text-muted-foreground">Signing you in...</p>
        <Loader2 className="w-8 h-8 animate-spin text-accent mt-4" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-lg flex items-start gap-3 text-red-500 dark:text-red-400 text-sm animate-in fade-in slide-in-from-top-1">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div className="space-y-2">
        <label className="text-xs font-bold text-primary uppercase tracking-widest ml-1" htmlFor="email">
          Email Address
        </label>
        <div className="relative group">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-accent transition-colors duration-300" />
          <input
            id="email"
            type="email"
            placeholder="your@email.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-10 pr-4 py-3.5 bg-background/50 border border-border rounded-lg text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all duration-300"
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-primary uppercase tracking-widest ml-1" htmlFor="password">
            Password
          </label>
          <Link 
            href="/forgot-password" 
            className="text-[10px] text-muted-foreground hover:text-accent transition-colors duration-300 font-medium uppercase tracking-wider"
          >
            Forgot?
          </Link>
        </div>
        <div className="relative group">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-accent transition-colors duration-300" />
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-10 pr-4 py-3.5 bg-background/50 border border-border rounded-lg text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all duration-300"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-accent hover:text-accent-foreground transition-all duration-500 shadow-lg shadow-primary/20 hover:shadow-accent/40 disabled:opacity-70 disabled:cursor-not-allowed group border border-transparent hover:border-accent/50"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin mx-auto" />
        ) : (
          <span className="flex items-center justify-center gap-2">
            Sign In
            <ArrowRight className="w-5 h-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
          </span>
        )}
      </button>

      <div className="text-center pt-2">
        <p className="text-muted-foreground text-sm">
          Don't have an account?{" "}
          <Link href="/register" className="text-primary hover:text-accent font-bold transition-all duration-300 underline underline-offset-4 decoration-primary/20 hover:decoration-accent">
            Create Free Account
          </Link>
        </p>
      </div>
    </form>
  );
}
