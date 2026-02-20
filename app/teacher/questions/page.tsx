"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  getAllQuestions,
  claimQuestion,
  unclaimQuestion,
  markQuestionDiscussing,
  deleteQuestion,
} from "@/actions";
import {
  MessageSquare,
  Clock,
  CheckCircle,
  MessageCircle,
  Trash2,
  UserCheck,
  UserMinus,
} from "lucide-react";
import Link from "next/link";
import React, { Suspense } from "react";
import { useLanguage } from "@/components/providers/LanguageContext";

export default function TeacherQuestionsPage() {
  const { dict } = useLanguage();
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-gold text-xl">{(dict as any).teacher.loadingQuestions}</div>
      </div>
    }>
      <QuestionsPageContent />
    </Suspense>
  );
}

function QuestionsPageContent() {
  const { dict } = useLanguage();
  const searchParams = useSearchParams();
  const statusFilter = searchParams.get("status");

  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState(statusFilter || "ALL");

  useEffect(() => {
    loadQuestions();
  }, [selectedStatus]);

  const loadQuestions = async () => {
    setLoading(true);
    const result = await getAllQuestions({
      status: selectedStatus === "ALL" ? undefined : selectedStatus as any,
    });
    if (result.success && result.data) {
      setQuestions(result.data.questions);
    }
    setLoading(false);
  };

  const statusMap: Record<string, string> = {
    ALL: (dict as any).teacher.status.all,
    PENDING: (dict as any).teacher.status.pending,
    CLAIMED: (dict as any).teacher.status.claimed,
    DISCUSSING: (dict as any).teacher.status.discussing,
    ANSWERED: (dict as any).teacher.status.answered,
  };

  const handleClaim = async (id: string) => {
    const result = await claimQuestion(id);
    if (result.success) {
      await loadQuestions();
    } else {
      alert(result.error);
    }
  };

  const handleUnclaim = async (id: string) => {
    const result = await unclaimQuestion(id);
    if (result.success) {
      await loadQuestions();
    } else {
      alert(result.error);
    }
  };

  const handleMarkDiscussing = async (id: string) => {
    const result = await markQuestionDiscussing(id);
    if (result.success) {
      await loadQuestions();
    } else {
      alert(result.error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-gold text-xl">{(dict as any).common.loading}</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-serif font-bold text-gold mb-2">{(dict as any).teacher.questions}</h1>
          <p className="text-gray-300">{(dict as any).teacher.manageQuestions}</p>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1 bg-white/5 rounded-lg border border-white/10 w-fit">
        {["ALL", "PENDING", "CLAIMED", "DISCUSSING", "ANSWERED"].map((status) => (
          <button
            key={status}
            onClick={() => setSelectedStatus(status)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              selectedStatus === status
                ? "bg-gold text-primary-dark shadow-lg"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            {statusMap[status]}
          </button>
        ))}
      </div>

      {/* Questions List */}
      {questions.length === 0 ? (
        <div className="text-center py-20 bg-white/5 rounded-xl border border-white/10">
          <MessageSquare className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">{(dict as any).teacher.noQuestionsFound}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {questions.map((question) => (
            <div
              key={question.id}
              className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 rounded-xl p-6 group hover:border-gold/30 transition-all font-sans"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      question.status === "PENDING"
                        ? "bg-orange-500/20 text-orange-400 border border-orange-500/20"
                        : question.status === "CLAIMED"
                        ? "bg-blue-500/20 text-blue-400 border border-blue-500/20"
                        : question.status === "DISCUSSING"
                        ? "bg-purple-500/20 text-purple-400 border border-purple-500/20"
                        : "bg-green-500/20 text-green-400 border border-green-500/20"
                    }`}
                  >
                    {statusMap[question.status] || question.status}
                  </span>
                  {question.lesson && (
                    <span className="text-[10px] text-gray-400 bg-white/5 px-2 py-1 rounded-full border border-white/10">
                      {(dict as any).nav.lessons}: {question.lesson.title}
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-gray-500">
                  {new Date(question.createdAt).toLocaleDateString()}
                </div>
              </div>

              <p className="text-white font-medium mb-6">
                {question.content}
              </p>

              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between text-xs text-gray-400 pb-4 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gold/20 flex items-center justify-center">
                      <Clock className="w-3 h-3 text-gold" />
                    </div>
                    <span>{question.user.name || (dict as any).qa.anonymousUser}</span>
                  </div>
                  {question.claimedBy && (
                    <div className="flex items-center gap-2 text-gold">
                      <UserCheck className="w-3 h-3" />
                      <span>{(dict as any).teacher.claimedByLabel}: {question.claimedBy.name}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {question.status === "PENDING" && (
                    <button
                      onClick={() => handleClaim(question.id)}
                      className="flex-1 bg-gold text-primary-dark px-4 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-gold-light transition-colors shadow-lg shadow-gold/10"
                    >
                      <UserCheck className="w-4 h-4" />
                      {(dict as any).teacher.claimToAnswer}
                    </button>
                  )}

                  {question.status === "CLAIMED" && (
                    <>
                      <Link
                        href={`/teacher/questions/${question.id}`}
                        className="flex-1 bg-gold text-primary-dark px-4 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-gold-light transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" />
                        {(dict as any).teacher.writeAnswer}
                      </Link>
                      <button
                        onClick={() => handleUnclaim(question.id)}
                        className="bg-white/10 text-white p-2 rounded-lg hover:bg-white/20 transition-colors border border-white/10"
                        title={(dict as any).teacher.unclaim}
                      >
                        <UserMinus className="w-4 h-4" />
                      </button>
                    </>
                  )}

                  {(question.status === "CLAIMED" ||
                    question.status === "DISCUSSING") && (
                    <button
                      onClick={() => handleMarkDiscussing(question.id)}
                      className={`p-2 rounded-lg transition-colors border border-white/10 ${
                        question.status === "DISCUSSING"
                          ? "bg-purple-500/20 text-purple-400"
                          : "text-white hover:bg-white/20"
                      }`}
                      title={(dict as any).teacher.moveToDiscussion}
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                  )}

                  {question.status === "ANSWERED" && (
                    <Link
                      href={`/questions/${question.id}`}
                      target="_blank"
                      className="flex-1 bg-green-500/20 text-green-400 border border-green-500/30 px-4 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-green-500/30 transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                      {(dict as any).teacher.viewPublicAnswer}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
