"use client";

import { useState } from "react";
import { User, Send, MessageCircle } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageContext";
import { addAnswerComment } from "@/actions/comments";
import { useRouter } from "next/navigation";

interface Comment {
  id: string;
  content: string;
  createdAt: Date | string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

interface AnswerCommentsProps {
  answerId: string;
  comments: Comment[];
  currentUser: {
    id: string;
    name: string | null;
    image: string | null;
  } | null;
}

export function AnswerComments({ answerId, comments, currentUser }: AnswerCommentsProps) {
  const { language: lang } = useLanguage();
  const router = useRouter();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    if (!currentUser) {
      setError(lang === "en" ? "You must be logged in to comment." : "ለአስተያየት መግባት አለብዎት።");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const result = await addAnswerComment({ answerId, content });
      if (result.success) {
        setContent("");
        router.refresh();
      } else {
        setError(result.error || "Failed to submit comment");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-8 pt-8 border-t border-border">
      <h4 className="text-lg font-bold text-foreground mb-6 font-sans flex items-center gap-2">
        <MessageCircle className="w-5 h-5 text-accent" />
        {lang === "en" ? "Comments & Follow-ups" : lang === "am" ? "አስተያየቶች እና ተጨማሪ ጥያቄዎች" : "አስተያየቶች"} ({comments.length})
      </h4>

      {/* Existing Comments */}
      <div className="space-y-6 mb-8">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-4">
            <div className="w-10 h-10 shrink-0 rounded-full bg-secondary flex items-center justify-center text-primary overflow-hidden">
              {comment.user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={comment.user.image} alt="" className="w-full h-full object-cover" />
              ) : (
                <User className="w-5 h-5" />
              )}
            </div>
            <div className="flex-1">
              <div className="bg-secondary/20 rounded-2xl rounded-tl-none p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm text-foreground">
                    {comment.user.name || (lang === "en" ? "Anonymous User" : "ማንነቱ ያልታወቀ ተጠቃሚ")}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(comment.createdAt).toLocaleDateString(lang === "en" ? "en-US" : "am-ET", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <p className="text-sm text-foreground/80 font-serif leading-relaxed whitespace-pre-wrap">
                  {comment.content}
                </p>
              </div>
            </div>
          </div>
        ))}
        {comments.length === 0 && (
          <p className="text-sm text-muted-foreground italic font-sans">
            {lang === "en" ? "No comments yet. Be the first to ask a follow-up!" : "ምንም አስተያየቶች የሉም። የመጀመሪያውን ጥያቄ ይጠይቁ!"}
          </p>
        )}
      </div>

      {/* Comment Form */}
      {currentUser ? (
        <form onSubmit={handleSubmit} className="flex gap-4">
          <div className="w-10 h-10 shrink-0 rounded-full bg-secondary flex items-center justify-center text-primary overflow-hidden">
            {currentUser.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={currentUser.image} alt="" className="w-full h-full object-cover" />
            ) : (
              <User className="w-5 h-5" />
            )}
          </div>
          <div className="flex-1 space-y-2">
            <div className="relative">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={lang === "en" ? "Ask a follow-up question or add a comment..." : "ተጨማሪ ጥያቄ ይጠይቁ ወይም አስተያየት ይስጡ..."}
                className="w-full bg-background border border-border rounded-2xl p-4 pr-12 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all min-h-[100px] resize-y font-sans"
                disabled={isSubmitting}
              />
              <button
                type="submit"
                disabled={isSubmitting || !content.trim()}
                className="absolute right-3 bottom-3 p-2 bg-primary text-primary-foreground rounded-xl hover:bg-accent hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:hover:bg-primary"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
          </div>
        </form>
      ) : (
        <div className="bg-secondary/10 border border-border rounded-xl p-4 text-center font-sans">
          <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
            <User className="w-4 h-4" />
            {lang === "en" ? "Please log in to add a comment." : "አስተያየት ለመስጠት እባክዎ ይግቡ።"}
          </p>
        </div>
      )}
    </div>
  );
}
