import { getQuestion, getAnsweredQuestions } from "@/actions";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User, Calendar, MessageSquare, ShieldCheck, Share2, CornerDownRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default async function QuestionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getQuestion(id);

  if (!result.success || !result.data) {
    notFound();
  }

  const question = result.data;
  
  // Fetch related questions for sidebar
  const relatedResult = await getAnsweredQuestions({ limit: 5 });
  const relatedQuestions = relatedResult.success && relatedResult.data 
    ? relatedResult.data.questions.filter((q: any) => q.id !== id)
    : [];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-12">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          <Link href="/questions" className="hover:text-primary transition-colors">Q&A</Link>
          <span>/</span>
          <span className="text-primary font-medium truncate">Question Details</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          <div className="lg:col-span-3 space-y-12">
            {/* Question Section */}
            <div className="relative">
              <div className="absolute -left-4 top-0 bottom-0 w-1.5 bg-accent/20 rounded-full" />
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-primary border border-border">
                  {question.user.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={question.user.image} alt="" className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <User className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    {question.user.name || "Anonymous User"}
                  </h3>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(question.createdAt).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                    {question.lesson && (
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5" />
                        Regarding: {question.lesson.title}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <h1 className="text-3xl md:text-5xl font-serif font-bold text-primary italic leading-tight mb-8">
                "{question.content}"
              </h1>
            </div>

            {/* Answer Section */}
            {question.answer ? (
              <div className="bg-card border border-border rounded-3xl p-8 md:p-12 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <ShieldCheck className="w-32 h-32" />
                </div>
                
                <div className="flex items-center gap-4 mb-8 pb-8 border-b border-border">
                  <div className="w-14 h-14 rounded-2xl bg-accent/20 flex items-center justify-center text-accent border border-accent/20">
                    {question.answer.author.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={question.answer.author.image} alt="" className="w-full h-full object-cover rounded-2xl" />
                    ) : (
                      <ShieldCheck className="w-8 h-8" />
                    )}
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.2em] font-black text-accent mb-1 border-b border-accent/20 pb-1 inline-block">
                      Official Response
                    </div>
                    <h3 className="text-xl font-serif font-bold text-foreground">
                      Answered by {question.answer.author.name}
                    </h3>
                  </div>
                  <div className="ml-auto">
                    <button className="p-3 bg-secondary/50 rounded-xl hover:bg-accent/10 hover:text-accent transition-all">
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="prose prose-invert max-w-none">
                  <p className="text-lg leading-relaxed text-muted-foreground whitespace-pre-wrap">
                    {question.answer.content}
                  </p>
                </div>

                {question.answer.attachments && question.answer.attachments.length > 0 && (
                  <div className="mt-12 pt-8 border-t border-border">
                    <h4 className="text-sm font-bold text-foreground mb-4">Supporting Materials</h4>
                    <div className="flex flex-wrap gap-4">
                      {question.answer.attachments.map((url: string, idx: number) => (
                        <a 
                          key={idx} 
                          href={url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="px-4 py-2 bg-secondary/50 rounded-lg text-xs font-medium hover:bg-accent/10 hover:text-accent transition-all flex items-center gap-2"
                        >
                          <CornerDownRight className="w-3.5 h-3.5" />
                          View Attachment {idx + 1}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-secondary/20 border border-dashed border-border rounded-3xl p-12 text-center">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-serif font-bold text-foreground">Under Review</h3>
                <p className="text-muted-foreground mt-2">
                  Our teachers are currently preparing an answer for this question.
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-12">
            {/* Related Topics */}
            <div>
              <h3 className="text-xl font-serif font-bold text-primary mb-6 flex items-center gap-2">
                <span className="w-1 h-6 bg-accent rounded-full" />
                Explore Related
              </h3>
              <div className="space-y-4">
                {relatedQuestions.map((rel: any) => (
                  <Link 
                    key={rel.id} 
                    href={`/questions/${rel.id}`}
                    className="block group bg-card/40 border border-border rounded-xl p-4 hover:border-accent/40 transition-all"
                  >
                    <p className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors mb-2">
                      "{rel.content}"
                    </p>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      {new Date(rel.createdAt).toLocaleDateString()}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Need help? */}
            <div className="bg-accent/5 border border-accent/20 rounded-3xl p-8 text-center">
              <h3 className="font-serif font-bold text-primary mb-4">Your turn?</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Have a similar but different question? Don't hesitate to ask our community.
              </p>
              <Link
                href="/questions/new"
                className="block w-full py-4 bg-primary text-primary-foreground font-bold rounded-2xl hover:bg-accent transition-all"
              >
                Ask a Question
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
