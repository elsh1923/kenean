import { getQuestion, getAnsweredQuestions } from "@/actions";
import { getServerLanguage, getServerDict } from "@/lib/i18n-server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User, Calendar, MessageSquare, ShieldCheck, Share2, CornerDownRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { getSession } from "@/lib/auth-utils";
import { AnswerComments } from "@/components/questions/AnswerComments";

export default async function QuestionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [result, lang, dict, session] = await Promise.all([
    getQuestion(id),
    getServerLanguage(),
    getServerDict(),
    getSession(),
  ]);

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
    <div className="min-h-screen bg-background font-serif">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-12 font-sans">
          <Link href="/" className="hover:text-primary transition-colors">{(dict as any).qa.backToHome}</Link>
          <span>/</span>
          <Link href="/questions" className="hover:text-primary transition-colors">{(dict as any).nav.qa}</Link>
          <span>/</span>
          <span className="text-primary font-medium truncate">{(dict as any).qa.questionDetails}</span>
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
                <div className="font-sans">
                  <h3 className="text-sm font-bold text-foreground">
                    {question.user.name || (dict as any).qa.anonymousUser}
                  </h3>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(question.createdAt).toLocaleDateString(lang === "en" ? "en-US" : "am-ET", { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                    {question.lesson && (
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5" />
                        {(dict as any).qa.regarding}: {lang === "am" ? (question.lesson.titleAmharic || question.lesson.title) : lang === "gz" ? (question.lesson.titleGeez || question.lesson.title) : question.lesson.title}
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
                  <div className="font-sans">
                    <div className="text-[10px] uppercase tracking-[0.2em] font-black text-accent mb-1 border-b border-accent/20 pb-1 inline-block">
                      {(dict as any).qa.officialResponse}
                    </div>
                    <h3 className="text-xl font-serif font-bold text-foreground">
                      {(dict as any).qa.answeredBy} {question.answer.author.name}
                    </h3>
                  </div>
                  <div className="ml-auto">
                    <button className="p-3 bg-secondary/50 rounded-xl hover:bg-accent/10 hover:text-accent transition-all">
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="prose prose-invert max-w-none">
                  <p className="text-lg leading-relaxed text-muted-foreground whitespace-pre-wrap font-serif">
                    {question.answer.content}
                  </p>
                </div>

                {/* Attachments & Links */}
                {question.answer.attachments && question.answer.attachments.length > 0 && (
                  <div className="mt-12 pt-8 border-t border-border">
                    <h4 className="text-sm font-bold text-foreground mb-6 font-sans">{(dict as any).qa.supportingMaterials}</h4>
                    
                    <div className="space-y-8">
                      {/* Files/Images/Videos */}
                      {question.answer.attachments.filter((a: string) => !a.startsWith("LINK:")).length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                          {question.answer.attachments.filter((a: string) => !a.startsWith("LINK:")).map((url: string, idx: number) => {
                            const isImage = url.match(/\.(jpg|jpeg|png|webp|gif|avif)$/i) || url.includes("/image/upload/");
                            const isVideo = url.match(/\.(mp4|webm|ogg)$/i) || url.includes("/video/upload/");
                            
                            return (
                              <div key={idx} className="group relative">
                                {isImage ? (
                                  <a href={url} target="_blank" rel="noreferrer" className="block aspect-video overflow-hidden rounded-2xl border border-border hover:border-accent/40 transition-all">
                                    <img src={url} alt="Attachment" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                  </a>
                                ) : isVideo ? (
                                  <div className="aspect-video rounded-2xl overflow-hidden border border-border">
                                    <video src={url} controls className="w-full h-full" />
                                  </div>
                                ) : (
                                  <a 
                                    href={url} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="flex items-center gap-3 p-4 bg-secondary/30 rounded-2xl border border-border hover:border-accent/40 hover:bg-accent/5 transition-all"
                                  >
                                    <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center text-accent">
                                      <CornerDownRight className="w-5 h-5" />
                                    </div>
                                    <div className="font-sans">
                                      <div className="text-xs font-bold text-foreground">{(dict as any).qa.viewAttachment}</div>
                                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">File {idx + 1}</div>
                                    </div>
                                  </a>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* External Links */}
                      {question.answer.attachments.filter((a: string) => a.startsWith("LINK:")).length > 0 && (
                        <div className="space-y-3 font-sans">
                          {question.answer.attachments.filter((a: string) => a.startsWith("LINK:")).map((prefixedLink: string, idx: number) => {
                             const link = prefixedLink.replace("LINK:", "");
                             return (
                              <a 
                                key={idx}
                                href={link}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-3 p-3 bg-accent/5 rounded-xl border border-accent/20 hover:border-accent hover:bg-accent/10 transition-all group"
                              >
                                <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
                                  <Share2 className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium text-foreground truncate">{link}</div>
                                  <div className="text-[10px] text-accent font-bold uppercase tracking-widest">External Link</div>
                                </div>
                              </a>
                             );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              
                <AnswerComments 
                  answerId={question.answer.id}
                  comments={question.answer.comments || []}
                  currentUser={session?.user ? {
                    id: session.user.id,
                    name: session.user.name || null,
                    image: session.user.image || null
                  } : null}
                />
              </div>
            ) : (
              <div className="bg-secondary/20 border border-dashed border-border rounded-3xl p-12 text-center">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-serif font-bold text-foreground">{(dict as any).qa.underReview}</h3>
                <p className="text-muted-foreground mt-2 font-sans">
                  {(dict as any).qa.underReviewDesc}
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
                {(dict as any).qa.exploreRelated}
              </h3>
              <div className="space-y-4 font-sans">
                {relatedQuestions.map((rel: any) => (
                  <Link 
                    key={rel.id} 
                    href={`/questions/${rel.id}`}
                    className="block group bg-card/40 border border-border rounded-xl p-4 hover:border-accent/40 transition-all"
                  >
                    <p className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors mb-2 font-serif">
                      "{rel.content}"
                    </p>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      {new Date(rel.createdAt).toLocaleDateString(lang === "en" ? "en-US" : "am-ET")}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Need help? */}
            <div className="bg-accent/5 border border-accent/20 rounded-3xl p-8 text-center">
              <h3 className="font-serif font-bold text-primary mb-4">{(dict as any).qa.yourTurn}</h3>
              <p className="text-sm text-muted-foreground mb-6 font-sans">
                {(dict as any).qa.yourTurnDesc}
              </p>
              <Link
                href="/questions/new"
                className="block w-full py-4 bg-primary text-primary-foreground font-bold rounded-2xl hover:bg-accent transition-all font-sans"
              >
                {(dict as any).qa.askQuestion}
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
