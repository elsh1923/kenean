import { getAdminStats } from "@/actions";
import { StatCard } from "@/components/admin/StatCard";
import Link from "next/link";
import { MessageSquare, Clock, CheckCircle, AlertCircle } from "lucide-react";

export default async function TeacherDashboard() {
  const statsResult = await getAdminStats();

  if (!statsResult.success || !statsResult.data) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400">{statsResult.error || "Failed to load stats"}</p>
      </div>
    );
  }

  const { questions } = statsResult.data;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-serif font-bold text-gold mb-2">
          Teacher Dashboard
        </h1>
        <p className="text-gray-300">
          Welcome to your spiritual teaching workspace
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Questions"
          value={questions.total}
          icon="MessageSquare"
        />
        <StatCard
          title="Pending"
          value={questions.pending}
          icon="Clock"
        />
        <StatCard
          title="Claimed"
          value={questions.claimed}
          icon="AlertCircle"
        />
        <StatCard
          title="Answered"
          value={questions.answered}
          icon="CheckCircle"
        />
      </div>

      {/* Quick Actions */}
      <div className="mt-12">
        <h2 className="text-2xl font-serif font-bold text-gold mb-6">
          Teaching Tasks
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TeacherQuickAction
            title="Answer Pending Questions"
            description={`${questions.pending} questions waiting for a response`}
            href="/teacher/questions?status=PENDING"
            icon={Clock}
            badge={questions.pending}
          />
          <TeacherQuickAction
            title="Your Claimed Questions"
            description={`${questions.claimed} questions you are currently answering`}
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
        <span className="absolute -top-2 -right-2 flex items-center justify-center w-8 h-8 bg-gold text-primary-dark text-sm font-bold rounded-full border-2 border-primary-dark">
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
