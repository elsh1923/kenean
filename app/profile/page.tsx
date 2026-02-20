import { getMyProfile } from "@/actions";
import { getSession } from "@/lib/auth-utils";
import { redirect } from "next/navigation";
import { ProfileClient } from "@/components/profile/ProfileClient";
import {
  User,
  Mail,
  Calendar,
  MessageCircleQuestion,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

export const metadata = {
  title: "My Profile | Kenean",
  description: "View and update your profile",
};

export default async function ProfilePage() {
  const session = await getSession();

  if (!session) {
    redirect("/login?redirect=/profile");
  }

  const profileResult = await getMyProfile();

  if (!profileResult.success || !profileResult.data) {
    redirect("/login?redirect=/profile");
  }

  const user = profileResult.data;

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="font-serif text-4xl font-bold text-primary mb-1">My Profile</h1>
          <p className="text-muted-foreground">Manage your account details</p>
        </div>

        {/* Avatar Card */}
        <div className="bg-card border border-border rounded-2xl p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 shadow-sm">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.image}
                alt={user.name || "Avatar"}
                className="w-24 h-24 rounded-full object-cover ring-4 ring-accent/30"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-3xl font-bold font-serif ring-4 ring-accent/30">
                {user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* User Info */}
          <div className="flex-1 text-center sm:text-left space-y-3">
            <div>
              <h2 className="text-2xl font-serif font-bold text-foreground">
                {user.name || "Unnamed User"}
              </h2>
              <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
                <span
                  className={`inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                    user.role === "admin"
                      ? "bg-accent/20 text-accent border border-accent/40"
                      : "bg-secondary text-primary border border-border"
                  }`}
                >
                  {user.role === "admin" ? (
                    <ShieldCheck className="w-3 h-3" />
                  ) : (
                    <User className="w-3 h-3" />
                  )}
                  {user.role}
                </span>
                {user.emailVerified && (
                  <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-bold bg-green-500/10 text-green-600 border border-green-500/30">
                    <CheckCircle2 className="w-3 h-3" />
                    Verified
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-1 text-sm text-muted-foreground">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <Mail className="w-4 h-4" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <Calendar className="w-4 h-4" />
                <span>
                  Member since{" "}
                  {new Date(user.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-card border border-border rounded-xl p-6 text-center shadow-sm">
            <MessageCircleQuestion className="w-8 h-8 text-accent mx-auto mb-2" />
            <div className="text-3xl font-bold text-primary font-serif">
              {user._count.questions}
            </div>
            <div className="text-sm text-muted-foreground mt-1">Questions Asked</div>
          </div>
          <div className="bg-card border border-border rounded-xl p-6 text-center shadow-sm">
            <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-3xl font-bold text-primary font-serif">
              {user._count.answers}
            </div>
            <div className="text-sm text-muted-foreground mt-1">Answers Given</div>
          </div>
        </div>

        {/* Editable form (Client Component) */}
        <ProfileClient initialName={user.name || ""} userEmail={user.email} />
      </div>
    </div>
  );
}
