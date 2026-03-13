"use client";

import { useState } from "react";
import { User, Send, MessageCircle, Loader2, Image as ImageIcon, Link as LinkIcon, FileText, X } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageContext";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { uploadFile } from "@/actions";
import { addAnswerComment } from "@/actions/comments";

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
  const [attachments, setAttachments] = useState<string[]>([]);
  const [links, setLinks] = useState<string[]>([]);
  const [newLink, setNewLink] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      
      let type: "image" | "video" | "document" = "image";
      if (file.type.startsWith("video/")) type = "video";
      else if (file.type === "application/pdf" || file.type.includes("word")) type = "document";

      formData.append("type", type === "document" ? "document" : type);
      formData.append("folder", `orthodox-learning-hub/comments/${type}s`);

      const result = await uploadFile(formData);
      if (result.success && result.data && 'url' in result.data) {
        setAttachments(prev => [...prev, result.data.url as string]);
      } else {
        setError(result.error || "Upload failed");
      }
    } catch (err) {
      setError("Upload error occurred");
    } finally {
      setIsUploading(false);
    }
  };

  const addLink = () => {
    if (!newLink.trim()) return;
    try {
      new URL(newLink);
      setLinks(prev => [...prev, newLink]);
      setNewLink("");
      setShowLinkInput(false);
    } catch {
      setError("Invalid URL");
    }
  };

  const parseMetadata = (commentContent: string) => {
    const parts = commentContent.split('\n\n---METADATA---\n');
    if (parts.length > 1) {
      try {
        return {
          text: parts[0],
          metadata: JSON.parse(parts[1])
        };
      } catch {
        return { text: commentContent, metadata: null };
      }
    }
    return { text: commentContent, metadata: null };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && attachments.length === 0 && links.length === 0) return;

    if (!currentUser) {
      setError(lang === "en" ? "You must be logged in to comment." : "ለአስተያየት መግባት አለብዎት።");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const result = await addAnswerComment({ 
        answerId, 
        content: content || (lang === "en" ? "Attachment shared" : "ተያያዥ ፋይል ተልኳል"),
        attachments,
        links
      });
      if (result.success) {
        setContent("");
        setAttachments([]);
        setLinks([]);
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
                  {parseMetadata(comment.content).text}
                </p>

                {parseMetadata(comment.content).metadata && (
                  <div className="mt-3 space-y-3">
                    {parseMetadata(comment.content).metadata.attachments?.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {parseMetadata(comment.content).metadata.attachments.map((url: string, idx: number) => {
                          const isImage = url.match(/\.(jpg|jpeg|png|webp|gif|avif)$/i) || url.includes("/image/upload/");
                          return (
                            <div key={idx} className="max-w-[150px]">
                              {isImage ? (
                                <a href={url} target="_blank" rel="noreferrer">
                                  <img src={url} alt="Attachment" className="rounded-lg border border-border/50 max-h-24 object-cover" />
                                </a>
                              ) : (
                                <a href={url} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-2 bg-background/50 rounded-lg text-xs border border-border/50">
                                  <FileText className="w-4 h-4" />
                                  <span>File {idx + 1}</span>
                                </a>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {parseMetadata(comment.content).metadata.links?.length > 0 && (
                      <div className="space-y-1">
                        {parseMetadata(comment.content).metadata.links.map((link: string, idx: number) => (
                          <a key={idx} href={link} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs text-accent hover:underline">
                            <LinkIcon className="w-3 h-3" />
                            <span className="truncate max-w-[200px]">{link}</span>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                )}
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
          <div className="flex-1 space-y-3">
            <div className="relative">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={lang === "en" ? "Ask a follow-up question or add a comment..." : "ተጨማሪ ጥያቄ ይጠይቁ ወይም አስተያየት ይስጡ..."}
                className="w-full bg-background border border-border rounded-2xl p-4 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all min-h-[100px] resize-y font-sans"
                disabled={isSubmitting}
              />
              
              {/* Previews */}
              {(attachments.length > 0 || links.length > 0) && (
                <div className="flex flex-wrap gap-2 p-2 bg-secondary/10 rounded-xl mt-2">
                  {attachments.map((url, i) => (
                    <div key={i} className="relative group p-1 bg-background rounded-lg border border-border">
                      <div className="w-8 h-8 flex items-center justify-center">
                        <ImageIcon className="w-4 h-4 text-accent" />
                      </div>
                      <button type="button" onClick={() => setAttachments(prev => prev.filter((_, idx) => idx !== i))} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5">
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  ))}
                  {links.map((link, i) => (
                    <div key={i} className="flex items-center gap-1.5 px-2 py-1 bg-background rounded-lg border border-border text-[10px]">
                      <LinkIcon className="w-3 h-3 text-accent" />
                      <span className="truncate max-w-[100px]">{link}</span>
                      <button type="button" onClick={() => setLinks(prev => prev.filter((_, idx) => idx !== i))} className="text-red-500">
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Toolbar */}
              <div className="flex items-center justify-between mt-2 px-1">
                <div className="flex items-center gap-2">
                  <label className="p-2 text-muted-foreground hover:text-accent hover:bg-accent/10 rounded-lg cursor-pointer transition-colors relative">
                    {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImageIcon className="w-5 h-5" />}
                    <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*,video/*,application/pdf" disabled={isUploading} />
                  </label>
                  <button 
                    type="button" 
                    onClick={() => setShowLinkInput(!showLinkInput)}
                    className={cn("p-2 text-muted-foreground hover:text-accent hover:bg-accent/10 rounded-lg transition-colors", showLinkInput && "text-accent bg-accent/10")}
                  >
                    <LinkIcon className="w-5 h-5" />
                  </button>
                </div>
                
                <button
                  type="submit"
                  disabled={isSubmitting || isUploading || (!content.trim() && attachments.length === 0 && links.length === 0)}
                  className="flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-accent transition-all disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span className="text-sm font-bold">{lang === "en" ? "Send" : "ላክ"}</span>
                </button>
              </div>

              {showLinkInput && (
                <div className="mt-2 flex gap-2">
                  <input
                    type="url"
                    value={newLink}
                    onChange={(e) => setNewLink(e.target.value)}
                    placeholder="Paste link here..."
                    className="flex-1 bg-background border border-border rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-accent"
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addLink())}
                  />
                  <button type="button" onClick={addLink} className="px-3 py-2 bg-accent/20 text-accent rounded-xl text-xs font-bold">Add</button>
                </div>
              )}
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
