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
import { ArrowLeft, Send, MessageCircle, User, Clock, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function TeacherQuestionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const questionId = params.id as string;

  const [question, setQuestion] = useState<any>(null);
  const [answer, setAnswer] = useState<any>(null);
  const [discussions, setDiscussions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [answerContent, setAnswerContent] = useState("");
  const [discussionContent, setDiscussionContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

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
    }

    if (discussionsResult.success && discussionsResult.data) {
      setDiscussions(discussionsResult.data);
    }

    setLoading(false);
  };

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answerContent.trim()) return;

    setSubmitting(true);

    let result;
    if (answer) {
      result = await updateAnswer(answer.id, { content: answerContent });
    } else {
      result = await submitAnswer(questionId, {
        content: answerContent,
      });
    }

    if (result.success) {
      await loadData();
      if (!answer) {
        setAnswerContent("");
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
          href="/teacher/questions"
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
          href="/teacher/questions"
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-300" />
        </Link>
        <div>
          <h1 className="text-3xl font-serif font-bold text-gold">
            Answer Question
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Status: <span className="text-white font-medium uppercase">{question.status}</span>
          </p>
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 rounded-xl p-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <p className="text-white text-2xl font-serif italic mb-6">"{question.content}"</p>
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <div className="bg-gold/10 p-1.5 rounded-full">
                   <User className="w-4 h-4 text-gold" />
                </div>
                {question.user.name || question.user.email}
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-gold/10 p-1.5 rounded-full">
                   <Clock className="w-4 h-4 text-gold" />
                </div>
                {new Date(question.createdAt).toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {question.lesson && (
          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-2">Related Lesson</p>
            <p className="text-white font-medium">{question.lesson.title}</p>
          </div>
        )}
      </div>

      {/* Teacher Discussions */}
      <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 rounded-xl p-8">
        <h2 className="text-2xl font-serif font-bold text-gold mb-6 flex items-center gap-3">
          <MessageCircle className="w-7 h-7" />
          Internal Discussion
        </h2>

        {discussions.length === 0 ? (
          <p className="text-gray-400 text-center py-10 border border-dashed border-white/10 rounded-lg bg-white/5">
            No discussions yet. Use this space to coordinate with other staff members.
          </p>
        ) : (
          <div className="space-y-6 mb-8 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {discussions.map((discussion) => (
              <div
                key={discussion.id}
                className="bg-white/5 border border-white/10 rounded-xl p-5"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center font-bold text-gold">
                      {discussion.author.name?.[0] || 'T'}
                    </div>
                    <span className="text-gold font-bold">
                      {discussion.author.name || discussion.author.email}
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-500 font-medium">
                    {new Date(discussion.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-gray-300 leading-relaxed">{discussion.content}</p>
              </div>
            ))}
          </div>
        )}

        {/* Add Discussion Form */}
        {question.status !== "ANSWERED" && (
          <form onSubmit={handleAddDiscussion} className="mt-6">
            <textarea
              value={discussionContent}
              onChange={(e) => setDiscussionContent(e.target.value)}
              placeholder="Share thoughts with other teachers..."
              rows={3}
              className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-gold/50 transition-all"
            />
            <div className="flex justify-end mt-4">
              <button
                type="submit"
                disabled={submitting || !discussionContent.trim()}
                className="flex items-center gap-2 px-6 py-2.5 bg-gold/10 text-gold border border-gold/30 rounded-lg font-bold hover:bg-gold hover:text-primary-dark transition-all disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                Add Comment
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Answer Section */}
      <div className="bg-gradient-to-br from-white/10 to-white/5 border-2 border-gold/30 rounded-xl p-8 shadow-2xl shadow-gold/5">
        <h2 className="text-3xl font-serif font-bold text-gold mb-6 flex items-center gap-3">
           <CheckCircle className="w-8 h-8" />
          {answer ? "Review/Edit Public Answer" : "Finalize Public Answer"}
        </h2>

        <form onSubmit={handleSubmitAnswer} className="space-y-6">
          <textarea
            value={answerContent}
            onChange={(e) => setAnswerContent(e.target.value)}
            placeholder="Provide a thoughtful, scriptural answer... This will be visible to ALL users on the Q&A page."
            rows={10}
            className="w-full px-5 py-5 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-gold/50 text-lg leading-relaxed shadow-inner"
            required
          />
          <button
            type="submit"
            disabled={submitting || !answerContent.trim()}
            className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-gold text-primary-dark rounded-xl font-bold text-xl hover:bg-gold-light hover:scale-[1.01] transition-all disabled:opacity-50 shadow-lg shadow-gold/20"
          >
            <Send className="w-6 h-6" />
            {answer ? "Update Published Answer" : "Publish Final Answer"}
          </button>
        </form>

        {answer && (
          <div className="mt-8 pt-8 border-t border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                 <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
              <div className="text-sm">
                <p className="text-gray-400">Answered by <span className="text-white font-bold">{answer.author.name || answer.author.email}</span></p>
                <p className="text-gray-500 text-xs">{new Date(answer.updatedAt).toLocaleString()}</p>
              </div>
            </div>
            
            <Link 
              href={`/questions/${question.id}`}
              target="_blank"
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 text-sm font-medium rounded-lg border border-white/10 transition-all"
            >
              View Public Page
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
