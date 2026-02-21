import { getLesson, getMyProfile } from "@/actions";
import { getServerLanguage, getServerDict } from "@/lib/i18n-server";
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
  title: "My Profile | Canaan",
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
  const lang = await getServerLanguage();
  const dict = await getServerDict();

  return (
    <div className="min-h-screen bg-background py-12 px-4 font-serif">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-primary mb-1">{(dict as any).profile.title}</h1>
          <p className="text-muted-foreground font-sans">{(dict as any).profile.subtitle}</p>
        </div>


        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-card border border-border rounded-xl p-6 text-center shadow-sm">
            <MessageCircleQuestion className="w-8 h-8 text-accent mx-auto mb-2" />
            <div className="text-3xl font-bold text-primary">
              {user._count.questions}
            </div>
            <div className="text-sm text-muted-foreground mt-1">{(dict as any).profile.questionsAsked}</div>
          </div>
          <div className="bg-card border border-border rounded-xl p-6 text-center shadow-sm">
            <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-3xl font-bold text-primary">
              {user._count.answers}
            </div>
            <div className="text-sm text-muted-foreground mt-1">{(dict as any).profile.answersGiven}</div>
          </div>
        </div>

        {/* Editable form (Client Component) */}
        <ProfileClient 
          initialName={user.name || ""} 
          userEmail={user.email} 
          initialImage={user.image}
        />
      </div>
    </div>
  );
}
