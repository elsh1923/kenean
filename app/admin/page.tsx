import { getAdminStats } from "@/actions";
import { StatCard } from "@/components/admin/StatCard";
import Link from "next/link";
import { Users, GraduationCap } from "lucide-react";

export default async function AdminDashboard() {
  const statsResult = await getAdminStats();

  if (!statsResult.success || !statsResult.data) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400">{statsResult.error || "Failed to load stats"}</p>
      </div>
    );
  }

  const { users, content, questions } = statsResult.data;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-serif font-bold text-gold mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-300">
            Overview of your Orthodox Learning Hub administration
          </p>
        </div>
        <Link
          href="/teacher"
          className="flex items-center gap-2 px-6 py-3 bg-gold/10 text-gold border border-gold/30 rounded-xl font-bold hover:bg-gold hover:text-primary-dark transition-all"
        >
          <GraduationCap className="w-5 h-5" />
          Switch to Teacher Workspace
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={users.total}
          icon="Users"
        />
        <StatCard
          title="Admins/Teachers"
          value={users.admins}
          icon="Users"
        />
        <StatCard
          title="Categories"
          value={content.categories}
          icon="FolderTree"
        />
        <StatCard
          title="Volumes"
          value={content.volumes}
          icon="BookOpen"
        />
        <StatCard
          title="Total Lessons"
          value={content.lessons}
          icon="Video"
        />
        <StatCard
          title="Published Lessons"
          value={content.publishedLessons}
          icon="CheckCircle"
        />
        <StatCard
          title="Total Questions"
          value={questions.total}
          icon="MessageSquare"
        />
        <StatCard
          title="Pending Questions"
          value={questions.pending}
          icon="AlertCircle"
        />
      </div>

      {/* Quick Actions */}
      <div className="mt-12">
        <h2 className="text-2xl font-serif font-bold text-gold mb-6">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <QuickActionCard
            title="Manage Categories"
            description="Create and organize content categories"
            href="/admin/categories"
            icon="FolderTree"
          />
          <QuickActionCard
            title="Manage Volumes"
            description="Add volumes to categories"
            href="/admin/volumes"
            icon="BookOpen"
          />
          <QuickActionCard
            title="Manage Lessons"
            description="Upload and publish video lessons"
            href="/admin/lessons"
            icon="Video"
          />
          <QuickActionCard
            title="Pending Questions"
            description={`${questions.pending} questions awaiting response`}
            href="/admin/questions?status=PENDING"
            icon="Clock"
            badge={questions.pending}
          />
          <QuickActionCard
            title="Claimed Questions"
            description={`${questions.claimed} questions being worked on`}
            href="/admin/questions?status=CLAIMED"
            icon="CheckCircle"
          />
          <QuickActionCard
            title="Users & Teachers"
            description="Manage roles and permissions"
            href="/admin/users"
            icon="Users"
          />
        </div>
      </div>

      {/* Recent Users / Promote to Teacher */}
      <div className="mt-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-serif font-bold text-gold">
            Promote to Teacher
          </h2>
          <Link href="/admin/users" className="text-sm font-medium text-gold hover:underline">
            View all users
          </Link>
        </div>
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 rounded-xl overflow-hidden">
          <p className="p-6 text-gray-400 text-sm border-b border-white/10 italic">
            Admins/Teachers have the responsibility of answering spiritual questions submitted by the community.
          </p>
          <div className="p-6">
            <Link 
              href="/admin/users?role=user" 
              className="flex items-center justify-center p-8 border border-dashed border-white/20 rounded-lg hover:bg-white/5 transition-all text-gray-400 group"
            >
              <div className="text-center">
                <div className="bg-gold/10 p-4 rounded-full inline-block mb-3 group-hover:bg-gold/20 transition-colors">
                   <GraduationCap className="w-8 h-8 text-gold" />
                </div>
                 <p className="font-medium text-white">Find Users to Promote</p>
                 <p className="text-sm">Manage user roles and assign teaching responsibilities</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Questions Summary */}
      <div className="mt-12">
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 rounded-xl p-6">
          <h2 className="text-2xl font-serif font-bold text-gold mb-4">
            Questions Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">
                {questions.pending}
              </div>
              <div className="text-sm text-gray-300">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">
                {questions.claimed}
              </div>
              <div className="text-sm text-gray-300">Claimed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">
                {questions.answered}
              </div>
              <div className="text-sm text-gray-300">Answered</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">
                {questions.total}
              </div>
              <div className="text-sm text-gray-300">Total</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickActionCard({
  title,
  description,
  href,
  icon,
  badge,
}: {
  title: string;
  description: string;
  href: string;
  icon: string;
  badge?: number;
}) {
  // Import icons here for client-side rendering
  const iconComponents: Record<string, any> = {
    Users: require('lucide-react').Users,
    FolderTree: require('lucide-react').FolderTree,
    BookOpen: require('lucide-react').BookOpen,
    Video: require('lucide-react').Video,
    Clock: require('lucide-react').Clock,
    CheckCircle: require('lucide-react').CheckCircle,
  };
  const Icon = iconComponents[icon];
  return (
    <Link
      href={href}
      className="relative group block p-6 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 rounded-xl hover:border-gold/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
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
