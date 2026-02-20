"use client";

import { useState, useTransition } from "react";
import { updateMyProfile } from "@/actions";
import { Loader2, Save, CheckCircle2, AlertCircle, LogOut, User } from "lucide-react";
import { signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/components/providers/LanguageContext";

interface ProfileClientProps {
  initialName: string;
  userEmail: string;
}

export function ProfileClient({ initialName, userEmail }: ProfileClientProps) {
  const { dict } = useLanguage();
  const [name, setName] = useState(initialName);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    startTransition(async () => {
      const result = await updateMyProfile({ name });
      if (result.success) {
        setSuccess(true);
        router.refresh();
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(result.error || (dict as any).common.error);
      }
    });
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <div className="space-y-4 font-serif">
      {/* Edit Profile Card */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <h3 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-accent" />
          {(dict as any).profile.editProfile}
        </h3>

        <form onSubmit={handleSave} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-500/5 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-500 text-sm font-sans">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 bg-green-500/5 border border-green-500/20 rounded-lg flex items-center gap-2 text-green-600 text-sm font-sans">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              {(dict as any).profile.success}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-primary uppercase tracking-widest font-sans" htmlFor="profile-name">
              {(dict as any).profile.fullName}
            </label>
            <input
              id="profile-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all font-sans"
              placeholder={(dict as any).auth.namePlaceholder}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-primary uppercase tracking-widest font-sans">
              {(dict as any).auth.email}
            </label>
            <input
              type="email"
              value={userEmail}
              disabled
              className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-muted-foreground cursor-not-allowed opacity-70 font-sans"
            />
            <p className="text-xs text-muted-foreground font-sans">{(dict as any).profile.emailCannotChange}</p>
          </div>

          <button
            type="submit"
            disabled={isPending || name === initialName}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-accent hover:text-accent-foreground transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {(dict as any).profile.updateProfile}
          </button>
        </form>
      </div>

      {/* Sign Out */}
      <div className="bg-card border border-red-500/20 rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-foreground mb-2">{(dict as any).profile.signOut}</h3>
        <p className="text-muted-foreground text-sm mb-4 font-sans">
          {(dict as any).profile.signOutConfirm}
        </p>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 px-6 py-2.5 bg-red-500/10 border border-red-500/30 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all font-medium text-sm"
        >
          <LogOut className="w-4 h-4" />
          {(dict as any).profile.signOut}
        </button>
      </div>
    </div>
  );
}
