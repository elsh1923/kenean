"use client";

import { useState } from "react";
import { submitQuestion } from "@/actions";
import { useRouter } from "next/navigation";
import { MessageSquare, Send, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

interface QuestionFormProps {
  lessonId?: string;
  lessonTitle?: string;
}

export function QuestionForm({ lessonId, lessonTitle }: QuestionFormProps) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await submitQuestion({
        content,
        lessonId,
      });

      if (result.success) {
        setSuccess(true);
        setContent("");
        // Redirect after a short delay
        setTimeout(() => {
          router.push("/questions");
          router.refresh();
        }, 2000);
      } else {
        setError(result.error || "Failed to submit question");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-8 text-center animate-in fade-in zoom-in duration-300">
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-2xl font-serif font-bold text-white mb-2">Question Submitted!</h3>
        <p className="text-green-600/80 max-w-sm mx-auto">
          Your question has been sent to our teachers. You will be notified when it is answered.
        </p>
        <p className="text-sm text-muted-foreground mt-4 italic">Redirecting to Q&A gallery...</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-8 shadow-xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center">
          <MessageSquare className="w-6 h-6 text-accent" />
        </div>
        <div>
          <h2 className="text-2xl font-serif font-bold text-white">Ask a Question</h2>
          <p className="text-sm text-muted-foreground">
            {lessonTitle ? (
              <>Question regarding: <span className="text-primary font-medium">{lessonTitle}</span></>
            ) : (
              "Seek guidance on spiritual matters"
            )}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="content" className="block text-sm font-medium text-gray-300">
            Your Question *
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            placeholder="Write your question clearly here..."
            className="w-full h-40 bg-secondary/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all resize-none"
            minLength={10}
            maxLength={2000}
          />
          <div className="flex justify-between text-[10px] uppercase tracking-widest font-bold">
            <span className={content.length < 10 ? "text-red-500" : "text-muted-foreground"}>
              Min. 10 characters
            </span>
            <span className="text-muted-foreground">
              {content.length} / 2000
            </span>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || content.length < 10}
          className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary/20"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Submit Question
            </>
          )}
        </button>
        
        <p className="text-xs text-center text-muted-foreground">
          Note: Questions are reviewed and answered by teachers. Only answered questions are made public.
        </p>
      </form>
    </div>
  );
}
