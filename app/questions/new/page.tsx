import { getSession } from "@/lib/auth-utils";
import { redirect } from "next/navigation";
import { QuestionForm } from "@/components/questions/QuestionForm";
import Link from "next/link";
import { ArrowLeft, BookOpen, ShieldCheck } from "lucide-react";
import { getLesson } from "@/actions";

export const metadata = {
  title: "Ask a Question | Kenean",
  description: "Submit a spiritual question to our teachers.",
};

export default async function NewQuestionPage({
  searchParams,
}: {
  searchParams: Promise<{ lessonId?: string }>;
}) {
  const session = await getSession();

  if (!session) {
    const { lessonId } = await searchParams;
    const redirectUrl = lessonId ? `/questions/new?lessonId=${lessonId}` : "/questions/new";
    redirect(`/login?redirect=${encodeURIComponent(redirectUrl)}`);
  }

  const { lessonId } = await searchParams;
  let lessonTitle = undefined;

  if (lessonId) {
    const result = await getLesson(lessonId);
    if (result.success && result.data) {
      lessonTitle = result.data.title;
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <Link 
          href={lessonId ? `/lessons/${lessonId}` : "/questions"} 
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-12 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to {lessonId ? "Lesson" : "All Questions"}
        </Link>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-secondary/20 border border-border p-6 rounded-2xl">
            <div className="flex items-center gap-3 text-primary font-bold mb-2">
              <ShieldCheck className="w-5 h-5" />
              <span>Safe Space</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Your questions are handled with care and respect by our dedicated teachers.
            </p>
          </div>
          <div className="bg-secondary/20 border border-border p-6 rounded-2xl">
            <div className="flex items-center gap-3 text-accent font-bold mb-2">
              <BookOpen className="w-5 h-5" />
              <span>Timeless Wisdom</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Answers are rooted in the scriptures and traditions of the Orthodox Church.
            </p>
          </div>
        </div>

        <QuestionForm lessonId={lessonId} lessonTitle={lessonTitle} />
        
        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>
            By submitting, you agree to our spiritual inquiry guidelines. 
            All questions remain confidential until they are answered and published.
          </p>
        </div>
      </div>
    </div>
  );
}
