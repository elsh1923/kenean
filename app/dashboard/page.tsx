import { getUserProgress } from "@/actions";
import { getSession } from "@/lib/auth-utils";
import { redirect } from "next/navigation";
import { BookOpen, CheckCircle2, TrendingUp, Award } from "lucide-react";
import Link from "next/link";
import { getServerLanguage, getServerDict } from "@/lib/i18n-server";

export const metadata = {
  title: "My Progress Dashboard | Canaan",
  description: "Track your learning progress",
};

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login?redirect=/dashboard");
  }

  const lang = await getServerLanguage();
  const dict = await getServerDict();
  
  const progressResult = await getUserProgress();

  if (!progressResult.success || !progressResult.data) {
    return (
      <div className="min-h-screen bg-background py-12 px-4 flex items-center justify-center">
        <p className="text-destructive">{(dict as any).dashboard.failedToLoad}</p>
      </div>
    );
  }

  const { progress, totalLessons, completedLessons } = progressResult.data;
  const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return (
    <div className="min-h-screen bg-background py-12 px-4 font-serif">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-primary mb-2">{(dict as any).dashboard.title}</h1>
          <p className="text-muted-foreground font-sans">{(dict as any).dashboard.subtitle}</p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium mb-1">{(dict as any).dashboard.totalCompleted}</p>
              <p className="text-3xl font-bold text-primary">{completedLessons} / {totalLessons}</p>
            </div>
            <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
              <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
          
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium mb-1">{(dict as any).dashboard.completionRate}</p>
              <p className="text-3xl font-bold text-primary">{progressPercentage}%</p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
              <TrendingUp className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium mb-1">{(dict as any).dashboard.achievements}</p>
              <p className="text-3xl font-bold text-primary">{progressPercentage === 100 ? 1 : 0}</p>
            </div>
            <div className="bg-amber-100 dark:bg-amber-900/30 p-3 rounded-full">
              <Award className="w-8 h-8 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-primary mb-4">{(dict as any).dashboard.overallCompletion}</h2>
          <div className="w-full bg-secondary rounded-full h-4 mb-2 overflow-hidden">
            <div 
              className="bg-accent h-4 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <p className="text-sm text-muted-foreground text-right">{progressPercentage}% {(dict as any).dashboard.completed}</p>
        </div>

        {/* Recent Activity / Completed Lessons */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-primary mb-6 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-accent" />
            {(dict as any).dashboard.completedLessons}
          </h2>
          
          {progress.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>{(dict as any).dashboard.noLessons}</p>
              <Link href="/lessons" className="text-accent hover:underline mt-2 inline-block">
                {(dict as any).dashboard.startLearning}
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {progress.filter(p => p.completed).map((item) => {
                const title = lang === "am" ? (item.lesson.titleAmharic || item.lesson.title) : lang === "gz" ? (item.lesson.titleGeez || item.lesson.title) : item.lesson.title;
                const volumeTitle = lang === "am" ? (item.lesson.volume.titleAmharic || item.lesson.volume.title) : lang === "gz" ? (item.lesson.volume.titleGeez || item.lesson.volume.title) : item.lesson.volume.title;
                const catName = lang === "am" ? (item.lesson.volume.category.nameAmharic || item.lesson.volume.category.name) : lang === "gz" ? (item.lesson.volume.category.nameGeez || item.lesson.volume.category.name) : item.lesson.volume.category.name;

                return (
                  <div key={item.id} className="flex items-center justify-between p-4 border border-border rounded-lg bg-background hover:border-accent transition-colors">
                    <div>
                      <h3 className="font-bold text-lg">{title}</h3>
                      <p className="text-sm text-muted-foreground">
                         {(dict as any).dashboard.volumeLevel}: {volumeTitle || item.lesson.volume.volumeNumber} • {(dict as any).dashboard.categoryLevel}: {catName}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-medium">
                      <CheckCircle2 className="w-5 h-5" />
                      <span>{(dict as any).dashboard.completedStatus}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
