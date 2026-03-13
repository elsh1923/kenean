"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getQuestion,
  submitAnswer,
  updateAnswer,
  getAnswerByQuestion,
  getDiscussions,
  addDiscussion,
} from "@/actions";
import { ArrowLeft, Send, MessageCircle, User, Clock, Image as ImageIcon, Video, Link as LinkIcon, FileText, X, Plus, Loader2 } from "lucide-react";
import { uploadFile } from "@/actions";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function QuestionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const questionId = params.id as string;

  const [question, setQuestion] = useState<any>(null);
  const [answer, setAnswer] = useState<any>(null);
  const [discussions, setDiscussions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [answerContent, setAnswerContent] = useState("");
  const [answerAttachments, setAnswerAttachments] = useState<string[]>([]);
  const [answerLinks, setAnswerLinks] = useState<string[]>([]);
  const [newLink, setNewLink] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [discussionContent, setDiscussionContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadData();
  }, [questionId]);

  const loadData = async () => {
    setLoading(true);
    
    const [questionResult, answerResult, discussionsResult] = await Promise.all([
      getQuestion(questionId),
      getAnswerByQuestion(questionId),
      getDiscussions(questionId),
    ]);

    if (questionResult.success && questionResult.data) {
      setQuestion(questionResult.data);
    }

    if (answerResult.success && answerResult.data) {
      setAnswer(answerResult.data);
      setAnswerContent(answerResult.data.content);
      // Extract links and images from attachments
      const allAttachments = answerResult.data.attachments || [];
      setAnswerAttachments(allAttachments.filter((a: string) => !a.startsWith("LINK:")));
      setAnswerLinks(allAttachments.filter((a: string) => a.startsWith("LINK:")).map((l: string) => l.replace("LINK:", "")));
    }

    if (discussionsResult.success && discussionsResult.data) {
      setDiscussions(discussionsResult.data);
    }

    setLoading(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      
      let type: "image" | "video" | "document" = "image";
      if (file.type.startsWith("video/")) type = "video";
      else if (file.type === "application/pdf" || file.type.includes("word")) type = "document";

      formData.append("type", type === "document" ? "document" : type);
      formData.append("folder", `orthodox-learning-hub/answers/${type}s`);

      const result = await uploadFile(formData);
      if (result.success && result.data && 'url' in result.data) {
        setAnswerAttachments(prev => [...prev, result.data.url as string]);
      } else {
        alert(result.error || "Upload failed");
      }
    } catch (err) {
      alert("Upload error occurred");
    } finally {
      setUploading(false);
    }
  };

  const addLink = () => {
    if (!newLink.trim()) return;
    try {
      new URL(newLink);
      setAnswerLinks(prev => [...prev, newLink]);
      setNewLink("");
      setShowLinkInput(false);
    } catch {
      alert("Invalid URL");
    }
  };

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answerContent.trim()) return;

    setSubmitting(true);

    let result;
    const payload = {
      content: answerContent,
      attachments: answerAttachments,
      links: answerLinks,
    };

    if (answer) {
      result = await updateAnswer(answer.id, payload);
    } else {
      result = await submitAnswer(questionId, payload);
    }

    if (result.success) {
      await loadData();
      if (!answer) {
        setAnswerContent("");
        setAnswerAttachments([]);
        setAnswerLinks([]);
      }
    } else {
      alert(result.error);
    }

    setSubmitting(false);
  };

  const handleAddDiscussion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!discussionContent.trim()) return;

    setSubmitting(true);

    const result = await addDiscussion(questionId, {
      content: discussionContent,
    });

    if (result.success) {
      setDiscussionContent("");
      await loadData();
    } else {
      alert(result.error);
    }

    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-gold text-xl">Loading...</div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400 text-xl">Question not found</p>
        <Link
          href="/admin/questions"
          className="text-gold hover:underline mt-4 inline-block"
        >
          Back to Questions
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/questions"
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-300" />
        </Link>
        <div>
          <h1 className="text-3xl font-serif font-bold text-gold">
            Question Details
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Status: <span className="text-white font-medium">{question.status}</span>
          </p>
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 rounded-xl p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p className="text-white text-xl mb-4">{question.content}</p>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                {question.user.name || question.user.email}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {new Date(question.createdAt).toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {question.lesson && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <p className="text-sm text-gray-400">Related Lesson:</p>
            <p className="text-white font-medium">{question.lesson.title}</p>
          </div>
        )}
      </div>

      {/* Admin Discussions */}
      <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 rounded-xl p-6">
        <h2 className="text-2xl font-serif font-bold text-gold mb-4 flex items-center gap-2">
          <MessageCircle className="w-6 h-6" />
          Admin Discussions
        </h2>

        {discussions.length === 0 ? (
          <p className="text-gray-400 text-center py-8">
            No discussions yet. Start a discussion to collaborate with other admins.
          </p>
        ) : (
          <div className="space-y-4 mb-6">
            {discussions.map((discussion) => (
              <div
                key={discussion.id}
                className="bg-white/5 border border-white/10 rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-gold" />
                    <span className="text-gold font-medium">
                      {discussion.author.name || discussion.author.email}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(discussion.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-gray-300">{discussion.content}</p>
              </div>
            ))}
          </div>
        )}

        {/* Add Discussion Form */}
        {question.status !== "ANSWERED" && (
          <form onSubmit={handleAddDiscussion} className="mt-4">
            <textarea
              value={discussionContent}
              onChange={(e) => setDiscussionContent(e.target.value)}
              placeholder="Add a discussion comment..."
              rows={3}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold/50"
            />
            <button
              type="submit"
              disabled={submitting || !discussionContent.trim()}
              className="mt-3 flex items-center gap-2 px-6 py-2 bg-gold/20 text-gold rounded-lg font-semibold hover:bg-gold/30 transition-colors disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              Add Comment
            </button>
          </form>
        )}
      </div>

      {/* Answer Section */}
      <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 rounded-xl p-6">
        <h2 className="text-2xl font-serif font-bold text-gold mb-4">
          {answer ? "Public Answer" : "Submit Answer"}
        </h2>

        <form onSubmit={handleSubmitAnswer} className="space-y-4">
          <textarea
            value={answerContent}
            onChange={(e) => setAnswerContent(e.target.value)}
            placeholder="Write your answer here... This will be visible to all users."
            rows={8}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold/50"
            required
          />

          {/* Attachments Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg cursor-pointer transition-all border border-white/10 text-sm">
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Add Photo/Video/Document
                <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*,video/*,application/pdf" disabled={uploading} />
              </label>
              <button
                type="button"
                onClick={() => setShowLinkInput(!showLinkInput)}
                className={cn("flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all border border-white/10 text-sm", showLinkInput && "bg-gold/20 border-gold/50 text-gold")}
              >
                <LinkIcon className="w-4 h-4" />
                Add Link
              </button>
            </div>

            {showLinkInput && (
              <div className="flex gap-2 animate-in fade-in slide-in-from-top-2">
                <input
                  type="url"
                  value={newLink}
                  onChange={(e) => setNewLink(e.target.value)}
                  placeholder="Paste URL here..."
                  className="flex-1 bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-gold/50 text-sm"
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addLink())}
                />
                <button
                  type="button"
                  onClick={addLink}
                  className="px-4 py-2 bg-gold text-primary-dark rounded-lg text-sm font-bold hover:bg-gold/90"
                >
                  Add
                </button>
              </div>
            )}

            {/* Previews */}
            {(answerAttachments.length > 0 || answerLinks.length > 0) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
                {answerAttachments.map((url, i) => (
                  <div key={i} className="relative group bg-white/5 border border-white/10 rounded-lg p-2 flex items-center gap-3">
                    <div className="w-10 h-10 flex items-center justify-center bg-white/10 rounded">
                      <ImageIcon className="w-5 h-5 text-gold" />
                    </div>
                    <span className="text-xs text-gray-400 truncate flex-1">Attachment {i+1}</span>
                    <button type="button" onClick={() => setAnswerAttachments(prev => prev.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-500 p-1">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {answerLinks.map((link, i) => (
                  <div key={i} className="relative group bg-white/5 border border-white/10 rounded-lg p-2 flex items-center gap-3">
                    <div className="w-10 h-10 flex items-center justify-center bg-white/10 rounded">
                      <LinkIcon className="w-5 h-5 text-gold" />
                    </div>
                    <span className="text-xs text-gray-400 truncate flex-1">{link}</span>
                    <button type="button" onClick={() => setAnswerLinks(prev => prev.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-500 p-1">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting || uploading || !answerContent.trim()}
            className="flex items-center gap-2 px-8 py-3 bg-gold text-primary-dark rounded-lg font-semibold hover:bg-gold/90 transition-colors disabled:opacity-50"
          >
            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            {answer ? "Update Answer" : "Submit Answer"}
          </button>
        </form>

        {answer && (
          <div className="mt-4 pt-4 border-t border-white/10 text-sm text-gray-400">
            <p>
              {answer.updatedAt !== answer.createdAt ? "Last updated" : "Submitted"}:{" "}
              {new Date(answer.updatedAt).toLocaleString()}
            </p>
            <p className="mt-1">
              By: {answer.author.name || answer.author.email}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
