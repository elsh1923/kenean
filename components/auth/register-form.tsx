"use client";

import { useState } from "react";
import { signUp } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Loader2, Mail, Lock, User, AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    console.log("[REGISTER] Attempting registration for:", email);
    try {
      const { data, error: authError } = await signUp.email({
        email,
        password,
        name,
        callbackURL: "/profile",
      });

      console.log("[REGISTER] Response:", { data, error: authError });

      if (authError) {
        setError(authError.message || "Something went wrong. Please try again.");
      } else {
        router.push("/profile");
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-lg flex items-start gap-3 text-red-500 dark:text-red-400 text-sm animate-in fade-in slide-in-from-top-1">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div className="space-y-2">
        <label className="text-xs font-bold text-primary uppercase tracking-widest ml-1" htmlFor="name">
          Full Name
        </label>
        <div className="relative group">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-accent transition-colors duration-300" />
          <input
            id="name"
            type="text"
            placeholder="Searcher of Truth"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full pl-10 pr-4 py-3.5 bg-background/50 border border-border rounded-lg text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all duration-300"
          />
        </div>
      </div>

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
        <label className="text-xs font-bold text-primary uppercase tracking-widest ml-1" htmlFor="password">
          Password
        </label>
        <div className="relative group">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-accent transition-colors duration-300" />
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-10 pr-4 py-3.5 bg-background/50 border border-border rounded-lg text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all duration-300"
          />
        </div>
        <p className="text-[10px] text-muted-foreground/60 ml-1 italic font-medium">Must be at least 8 characters</p>
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
            Create Free Account
            <CheckCircle2 className="w-5 h-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
          </span>
        )}
      </button>

      <div className="text-center pt-2">
        <p className="text-muted-foreground text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:text-accent font-bold transition-all duration-300 underline underline-offset-4 decoration-primary/20 hover:decoration-accent">
            Sign In
          </Link>
        </p>
      </div>
    </form>
  );
}
