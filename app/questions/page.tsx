import { getAnsweredQuestions, getMyQuestions } from "@/actions";
import { MessageSquare, Plus, ArrowLeft, Search, Clock, CheckCircle } from "lucide-react";
import Link from "next/link";
import { QuestionCard } from "@/components/questions/QuestionCard";
import { getSession } from "@/lib/auth-utils";

export const metadata = {
  title: "Q&A | Kenean",
  description: "Browse spiritual questions and answers from our teachers.",
};

export default async function QuestionsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const session = await getSession();
  
  const [result, myQuestionsResult] = await Promise.all([
    getAnsweredQuestions(),
    session ? getMyQuestions() : Promise.resolve({ success: true, data: [] })
  ]);

  if (!result.success || !result.data) {
    return (
      <div className="min-h-screen bg-background py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl font-serif text-primary">Failed to load questions.</h1>
        </div>
      </div>
    );
  }

  const { questions } = result.data;
  const myQuestions = myQuestionsResult.success ? (myQuestionsResult.data || []) : [];
  
  // Basic client-side filtering logic for display (real search would be an action)
  const filteredQuestions = q 
    ? questions.filter((qst: any) => qst.content.toLowerCase().includes(q.toLowerCase()))
    : questions;

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <div className="bg-secondary/30 border-b border-border py-16">
        <div className="container mx-auto px-4">
          <Link 
            href="/" 
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-6xl font-serif font-bold text-primary mb-6 leading-tight">
                Spiritual Q&A
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Explore a collection of spiritual questions answered by our teachers, or ask your own to deepen your understanding of the faith.
              </p>
            </div>
            
            <Link
              href="/questions/new"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-bold rounded-2xl hover:bg-accent hover:text-accent-foreground transition-all shadow-xl shadow-primary/10 whitespace-nowrap"
            >
              <Plus className="w-5 h-5" />
              Ask a Question
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {/* User's Recent Questions */}
        {myQuestions.length > 0 && (
          <div className="mb-20">
            <h2 className="text-2xl font-serif font-bold text-primary mb-6 flex items-center gap-2">
              <Clock className="w-6 h-6 text-accent" />
              Your Recent Questions
            </h2>
            <div className="flex flex-col gap-4">
              {myQuestions.slice(0, 3).map((question: any) => (
                <div key={question.id} className="bg-secondary/10 border border-border/50 rounded-2xl p-6 relative group hover:border-accent/30 transition-all w-full">
                   <div className="flex flex-wrap items-center gap-4 mb-4">
                      {question.answer ? (
                        <span className="flex items-center gap-1 text-[10px] bg-green-500/10 text-green-500 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">
                          <CheckCircle className="w-3 h-3" /> Answered
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] bg-accent/10 text-accent px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">
                          <Clock className="w-3 h-3" /> In Review
                        </span>
                      )}
                      {question.lesson && (
                        <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">
                          From: {question.lesson.title}
                        </span>
                      )}
                      <span className="text-[10px] text-muted-foreground ml-auto">
                        {new Date(question.createdAt).toLocaleDateString()}
                      </span>
                   </div>
                   <p className="text-foreground font-medium mb-4">{question.content}</p>
                   {question.answer && (
                     <Link 
                       href={`/questions/${question.id}`}
                       className="text-sm font-bold text-primary hover:text-accent flex items-center gap-1 transition-colors"
                     >
                       Read Answer <Plus className="w-4 h-4 rotate-45" />
                     </Link>
                   )}
                </div>
              ))}
            </div>
            {myQuestions.length > 3 && (
              <div className="mt-4 text-right">
                <Link href="/profile" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                  View all your questions in profile →
                </Link>
              </div>
            )}
            <div className="mt-12 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          </div>
        )}

        {/* Gallery Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-serif font-bold text-primary italic">Community Wisdom</h2>
          {q && (
            <Link href="/questions" className="text-sm font-medium text-accent hover:underline">
              Clear search
            </Link>
          )}
        </div>

        {/* Search Bar (Static decoration for now) */}
        <div className="max-w-2xl mx-auto mb-16 relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-accent transition-colors" />
          <input 
            type="text"
            placeholder="Search questions..."
            className="w-full pl-14 pr-6 py-5 bg-card border border-border rounded-2xl shadow-sm focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all text-lg"
          />
        </div>

        {filteredQuestions.length === 0 ? (
          <div className="text-center py-20 bg-card/50 rounded-3xl border border-dashed border-border max-w-4xl mx-auto">
            <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageSquare className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-foreground">No questions found</h2>
            <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
              We couldn't find any answered questions matching your search. Try a different topic or ask a new question.
            </p>
            <div className="mt-8">
              <Link
                href="/questions/new"
                className="text-accent font-bold hover:underline"
              >
                Submit a new question instead
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {filteredQuestions.map((question: any) => (
              <QuestionCard key={question.id} question={question} />
            ))}
          </div>
        )}
      </div>

      {/* Featured CTA */}
      <div className="container mx-auto px-4 pb-20">
        <div className="bg-gradient-to-r from-primary to-primary-dark rounded-3xl p-12 text-center text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-1/4 -translate-y-1/4">
            <MessageSquare className="w-64 h-64" />
          </div>
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Don't find what you're looking for?</h2>
            <p className="text-white/80 mb-8 text-lg">
              Our teachers are here to help you navigate your spiritual journey. No question is too small or too complex.
            </p>
            <Link
              href="/questions/new"
              className="inline-block px-10 py-4 bg-accent text-accent-foreground font-bold rounded-2xl hover:bg-white hover:text-primary transition-all shadow-lg"
            >
              Ask Our Teachers
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
