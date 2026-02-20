"use client";

import { useState, useTransition } from "react";
import { updateMyProfile } from "@/actions";
import { Loader2, Save, CheckCircle2, AlertCircle, LogOut, User } from "lucide-react";
import { signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

interface ProfileClientProps {
  initialName: string;
  userEmail: string;
}

export function ProfileClient({ initialName, userEmail }: ProfileClientProps) {
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
        setError(result.error || "Something went wrong");
      }
    });
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <div className="space-y-4">
      {/* Edit Profile Card */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <h3 className="font-serif text-xl font-bold text-primary mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-accent" />
          Edit Profile
        </h3>

        <form onSubmit={handleSave} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-500/5 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-500 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 bg-green-500/5 border border-green-500/20 rounded-lg flex items-center gap-2 text-green-600 text-sm">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              Profile updated successfully!
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-primary uppercase tracking-widest" htmlFor="profile-name">
              Display Name
            </label>
            <input
              id="profile-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
              placeholder="Your name"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-primary uppercase tracking-widest">
              Email Address
            </label>
            <input
              type="email"
              value={userEmail}
              disabled
              className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-muted-foreground cursor-not-allowed opacity-70"
            />
            <p className="text-xs text-muted-foreground">Email cannot be changed</p>
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
            Save Changes
          </button>
        </form>
      </div>

      {/* Sign Out */}
      <div className="bg-card border border-red-500/20 rounded-2xl p-6 shadow-sm">
        <h3 className="font-serif text-lg font-bold text-foreground mb-2">Sign Out</h3>
        <p className="text-muted-foreground text-sm mb-4">
          Sign out of your account on this device.
        </p>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 px-6 py-2.5 bg-red-500/10 border border-red-500/30 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all font-medium text-sm"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
