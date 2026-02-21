import { getMyProfile, getAdminStats } from "@/actions";
import { getSession } from "@/lib/auth-utils";
import { redirect } from "next/navigation";
import Image from "next/image";
import { ProfileClient } from "@/components/profile/ProfileClient";
import {
  ShieldCheck,
  Mail,
  Calendar,
  Users,
  Video,
  MessageSquare,
  BookOpen,
} from "lucide-react";

export const metadata = {
  title: "Admin Profile | Canaan",
  description: "Your admin profile",
};

export default async function AdminProfilePage() {
  const session = await getSession();

  if (!session || session.user.role !== "admin") {
    redirect("/login?redirect=/admin/profile");
  }

  const [profileResult, statsResult] = await Promise.all([
    getMyProfile(),
    getAdminStats(),
  ]);

  if (!profileResult.success || !profileResult.data) {
    redirect("/admin");
  }

  const user = profileResult.data;
  const stats = statsResult.success ? statsResult.data : null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-serif font-bold text-gold mb-2">My Profile</h1>
        <p className="text-gray-300">Manage your admin account</p>
      </div>

      {/* Avatar & Info Card */}
      <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 rounded-xl p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <Image
              src={user.image}
              alt={user.name || "Avatar"}
              className="w-24 h-24 rounded-full object-cover ring-4 ring-gold/40"
              width={96}
              height={96}
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gold/20 border-2 border-gold/40 flex items-center justify-center text-gold text-3xl font-bold font-serif">
              {user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 text-center sm:text-left space-y-3">
          <div>
            <h2 className="text-2xl font-serif font-bold text-white">
              {user.name || "Admin User"}
            </h2>
            <span className="inline-flex items-center gap-1.5 mt-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gold/20 text-gold border border-gold/40">
              <ShieldCheck className="w-3.5 h-3.5" />
              Administrator
            </span>
          </div>

          <div className="space-y-1 text-sm text-gray-300">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <Mail className="w-4 h-4 text-gold/60" />
              <span>{user.email}</span>
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <Calendar className="w-4 h-4 text-gold/60" />
              <span>
                Admin since{" "}
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

      {/* Site Stats */}
      {stats && (
        <div>
          <h2 className="text-xl font-serif font-bold text-gold mb-4">Site Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatBadge icon={Users} label="Total Users" value={stats.users.total} />
            <StatBadge icon={Video} label="Lessons" value={stats.content.lessons} />
            <StatBadge icon={BookOpen} label="Volumes" value={stats.content.volumes} />
            <StatBadge icon={MessageSquare} label="Questions" value={stats.questions.total} />
          </div>
        </div>
      )}

      {/* Edit Form */}
      <div className="[&_.bg-card]:bg-white/10 [&_.border-border]:border-white/20 [&_.bg-background]:bg-white/5 [&_.text-primary]:text-gold [&_.bg-primary]:bg-gold [&_.text-primary-foreground]:text-black [&_.hover\\:bg-accent]:hover:bg-gold/80 [&_.text-foreground]:text-white [&_.text-muted-foreground]:text-gray-400 [&_.bg-secondary]:bg-white/5">
        <ProfileClient initialName={user.name || ""} userEmail={user.email} initialImage={user.image} />
      </div>
    </div>
  );
}

function StatBadge({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
}) {
  return (
    <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl p-4 text-center">
      <Icon className="w-6 h-6 text-gold mx-auto mb-2" />
      <div className="text-2xl font-bold text-white font-serif">{value}</div>
      <div className="text-xs text-gray-400 mt-1">{label}</div>
    </div>
  );
}
