import { getAdminStats } from "@/actions";
import { getServerLanguage, getServerDict } from "@/lib/i18n-server";
import { StatCard } from "@/components/admin/StatCard";
import Link from "next/link";
import { MessageSquare, Clock, CheckCircle, AlertCircle } from "lucide-react";

export default async function TeacherDashboard() {
  const [statsResult, lang, dict] = await Promise.all([
    getAdminStats(),
    getServerLanguage(),
    getServerDict(),
  ]);

  if (!statsResult.success || !statsResult.data) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400">{statsResult.error || (dict as any).common.error}</p>
      </div>
    );
  }

  const { questions } = statsResult.data;

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-serif font-bold text-gold mb-2">
          {(dict as any).teacher.teacherDashboard}
        </h1>
        <p className="text-gray-300">
          {(dict as any).teacher.welcomeTeacher}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title={(dict as any).teacher.totalQuestions}
          value={questions.total}
          icon="MessageSquare"
        />
        <StatCard
          title={(dict as any).teacher.pending}
          value={questions.pending}
          icon="Clock"
        />
        <StatCard
          title={(dict as any).teacher.claimed}
          value={questions.claimed}
          icon="AlertCircle"
        />
        <StatCard
          title={(dict as any).teacher.answered}
          value={questions.answered}
          icon="CheckCircle"
        />
      </div>

      {/* Quick Actions */}
      <div className="mt-12">
        <h2 className="text-2xl font-serif font-bold text-gold mb-6">
          {(dict as any).teacher.teachingTasks}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TeacherQuickAction
            title={(dict as any).teacher.answerPending}
            description={`${questions.pending} ${(dict as any).teacher.waitingResponse}`}
            href="/teacher/questions?status=PENDING"
            icon={Clock}
            badge={questions.pending}
          />
          <TeacherQuickAction
            title={(dict as any).teacher.yourClaimed}
            description={`${questions.claimed} ${(dict as any).teacher.currentlyAnswering}`}
            href="/teacher/questions?status=CLAIMED"
            icon={CheckCircle}
          />
        </div>
      </div>
    </div>
  );
}

function TeacherQuickAction({
  title,
  description,
  href,
  icon: Icon,
  badge,
}: {
  title: string;
  description: string;
  href: string;
  icon: any;
  badge?: number;
}) {
  return (
    <Link
      href={href}
      className="relative group block p-6 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 rounded-xl hover:border-gold/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
    >
      {badge !== undefined && badge > 0 && (
        <span className="absolute -top-2 -right-2 flex items-center justify-center w-8 h-8 bg-gold text-primary-dark text-sm font-bold rounded-full border-2 border-primary-dark font-sans">
          {badge}
        </span>
      )}
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 p-3 bg-gold/20 rounded-lg border border-gold/30 group-hover:bg-gold/30 transition-colors">
          <Icon className="w-6 h-6 text-gold" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
          <p className="text-sm text-gray-300">{description}</p>
        </div>
      </div>
    </Link>
  );
}
