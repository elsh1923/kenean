import { getAnsweredQuestions, getMyQuestions } from "@/actions";
import { getServerLanguage, getServerDict } from "@/lib/i18n-server";
import { MessageSquare, Plus, ArrowLeft, Search, Clock, CheckCircle } from "lucide-react";
import Link from "next/link";
import { QuestionCard } from "@/components/questions/QuestionCard";
import { getSession } from "@/lib/auth-utils";

export default async function QuestionsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const session = await getSession();
  const [result, myQuestionsResult, lang, dict] = await Promise.all([
    getAnsweredQuestions(),
    session ? getMyQuestions() : Promise.resolve({ success: true, data: [] }),
    getServerLanguage(),
    getServerDict(),
  ]);

  if (!result.success || !result.data) {
    return (
      <div className="min-h-screen bg-background py-20 text-foreground">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl font-serif text-primary">
            {lang === "en" ? "Failed to load questions." : lang === "am" ? "ጥያቄዎችን መጫን አልተቻለም።" : "ጌጋ ተረክበ።"}
          </h1>
        </div>
      </div>
    );
  }

  const { questions } = result.data;
  const myQuestions = myQuestionsResult.success ? (myQuestionsResult.data || []) : [];
  
  const filteredQuestions = q 
    ? questions.filter((qst: any) => qst.content.toLowerCase().includes(q.toLowerCase()))
    : questions;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header Section */}
      <div className="bg-secondary/30 border-b border-border py-16">
        <div className="container mx-auto px-4">
          <Link 
            href="/" 
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {lang === "en" ? "Back to Home" : lang === "am" ? "ወደ ዋናው ገጽ" : "ገቢረ ምግባር"}
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-6xl font-serif font-bold text-primary mb-6 leading-tight">
                {lang === "en" ? "Spiritual Q&A" : lang === "am" ? "መንፈሳዊ ጥያቄና መልስ" : "ተሰእሎ ወመላሽ"}
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed font-serif">
                {lang === "en" 
                  ? "Explore a collection of spiritual questions answered by our teachers, or ask your own to deepen your understanding of the faith."
                  : lang === "am" 
                  ? "በመምህራኖቻችን የተመለሱ መንፈሳዊ ጥያቄዎችን ይመርምሩ፣ ወይም ስለ እምነቱ ያለዎትን ግንዛቤ ለማጥለቅ የራስዎን ይጠይቁ።"
                  : "ተሰእሎ ወመላሽ ዘበአበው።"
                }
              </p>
            </div>
            
            <Link
              href="/questions/new"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-bold rounded-2xl hover:bg-accent hover:text-accent-foreground transition-all shadow-xl shadow-primary/10 whitespace-nowrap"
            >
              <Plus className="w-5 h-5" />
              {lang === "en" ? "Ask a Question" : lang === "am" ? "ጥያቄ ይጠይቁ" : "አስተሰአለን"}
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
              {lang === "en" ? "Your Recent Questions" : lang === "am" ? "የእርስዎ የቅርብ ጊዜ ጥያቄዎች" : "ተሰእሎትከ"}
            </h2>
            <div className="flex flex-col gap-4">
              {myQuestions.slice(0, 3).map((question: any) => (
                <div key={question.id} className="bg-secondary/10 border border-border/50 rounded-2xl p-6 relative group hover:border-accent/30 transition-all w-full">
                   <div className="flex flex-wrap items-center gap-4 mb-4">
                      {question.answer ? (
                        <span className="flex items-center gap-1 text-[10px] bg-green-500/10 text-green-500 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">
                          <CheckCircle className="w-3 h-3" /> {lang === "en" ? "Answered" : lang === "am" ? "ተመልሷል" : "ተመልሰ"}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] bg-accent/10 text-accent px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">
                          <Clock className="w-3 h-3" /> {lang === "en" ? "In Review" : lang === "am" ? "በግምገማ ላይ" : "In Review"}
                        </span>
                      )}
                      {question.lesson && (
                        <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold uppercase tracking-widest font-serif">
                          {lang === "en" ? "From:" : lang === "am" ? "ከ:" : "እም:"} {lang === "am" ? (question.lesson.titleAmharic || question.lesson.title) : lang === "gz" ? (question.lesson.titleGeez || question.lesson.title) : question.lesson.title}
                        </span>
                      )}
                      <span className="text-[10px] text-muted-foreground ml-auto">
                        {new Date(question.createdAt).toLocaleDateString(lang === "en" ? "en-US" : "am-ET")}
                      </span>
                   </div>
                   <p className="text-foreground font-medium mb-4 font-serif">{question.content}</p>
                   {question.answer && (
                     <Link 
                       href={`/questions/${question.id}`}
                       className="text-sm font-bold text-primary hover:text-accent flex items-center gap-1 transition-colors"
                     >
                       {lang === "en" ? "Read Answer" : lang === "am" ? "መልሱን አንብብ" : "መላሽ አንብብ"} <Plus className="w-4 h-4 rotate-45" />
                     </Link>
                   )}
                </div>
              ))}
            </div>
            {myQuestions.length > 3 && (
              <div className="mt-4 text-right">
                <Link href="/profile" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                  {lang === "en" ? "View all your questions in profile →" : lang === "am" ? "ሁሉንም ጥያቄዎችዎን በፕሮፋይል ያዩ →" : "View all →"}
                </Link>
              </div>
            )}
            <div className="mt-12 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          </div>
        )}

        {/* Gallery Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-serif font-bold text-primary italic">
            {lang === "en" ? "Community Wisdom" : lang === "am" ? "የማህበረሰቡ ጥበብ" : "ጥበበ ማህበር"}
          </h2>
          {q && (
            <Link href="/questions" className="text-sm font-medium text-accent hover:underline">
              {lang === "en" ? "Clear search" : lang === "am" ? "ፍለጋን አጽዳ" : "Clear search"}
            </Link>
          )}
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-16 relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-accent transition-colors" />
          <input 
            type="text"
            placeholder={lang === "en" ? "Search questions..." : lang === "am" ? "ጥያቄዎችን ይፈልጉ..." : "ኅሥሥ..."}
            className="w-full pl-14 pr-6 py-5 bg-card border border-border rounded-2xl shadow-sm focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all text-lg font-serif"
          />
        </div>

        {filteredQuestions.length === 0 ? (
          <div className="text-center py-20 bg-card/50 rounded-3xl border border-dashed border-border max-w-4xl mx-auto">
            <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageSquare className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-foreground">
              {lang === "en" ? "No questions found" : lang === "am" ? "ምንም ጥያቄ አልተገኘም" : "አልተረክበ"}
            </h2>
            <p className="text-muted-foreground mt-2 max-w-sm mx-auto font-serif">
              {lang === "en" 
                ? "We couldn't find any answered questions matching your search. Try a different topic or ask a new question."
                : lang === "am"
                ? "ከፍለጋዎ ጋር የሚዛመድ ምንም የተመለሰ ጥያቄ አላገኘንም። ሌላ ርዕስ ይሞክሩ ወይም አዲስ ጥያቄ ይጠይቁ።"
                : "አልተረክበ ተሰእሎ።"
              }
            </p>
            <div className="mt-8">
              <Link
                href="/questions/new"
                className="text-accent font-bold hover:underline"
              >
                {lang === "en" ? "Submit a new question instead" : lang === "am" ? "በምትኩ አዲስ ጥያቄ ያቅርቡ" : "Submit new"}
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
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
              {lang === "en" ? "Don't find what you're looking for?" : lang === "am" ? "የሚፈልጉትን አላገኙም?" : "ተስእንከ?"}
            </h2>
            <p className="text-white/80 mb-8 text-lg font-serif">
              {lang === "en"
                ? "Our teachers are here to help you navigate your spiritual journey. No question is too small or too complex."
                : lang === "am"
                ? "መምህራኖቻችን በመንፈሳዊ ጉዞዎ ላይ እርስዎን ለመርዳት እዚህ አሉ። ምንም ጥያቄ በጣም ትንሽ ወይም ውስብስብ አይደለም።"
                : "አበው ይኤዝዙከ።"
              }
            </p>
            <Link
              href="/questions/new"
              className="inline-block px-10 py-4 bg-accent text-accent-foreground font-bold rounded-2xl hover:bg-white hover:text-primary transition-all shadow-lg"
            >
              {lang === "en" ? "Ask Our Teachers" : lang === "am" ? "መምህራኖቻችንን ይጠይቁ" : "ተሰአሉ አበወ"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
