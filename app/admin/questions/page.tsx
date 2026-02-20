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
  User,
  Clock,
  CheckCircle,
  MessageCircle,
  Trash2,
  UserCheck,
  UserMinus,
} from "lucide-react";
import Link from "next/link";

export default function QuestionsPage() {
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
    if (result.success) {
      setQuestions(result.data);
    }
    setLoading(false);
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

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this question?")) return;

    const result = await deleteQuestion(id);
    if (result.success) {
      await loadQuestions();
    } else {
      alert(result.error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-gold text-xl">Loading...</div>
      </div>
    );
  }

  const statuses = [
    { value: "ALL", label: "All Questions", count: questions.length },
    { value: "PENDING", label: "Pending", icon: Clock },
    { value: "CLAIMED", label: "Claimed", icon: UserCheck },
    { value: "DISCUSSING", label: "Discussing", icon: MessageCircle },
    { value: "ANSWERED", label: "Answered", icon: CheckCircle },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-serif font-bold text-gold mb-2">
          Questions
        </h1>
        <p className="text-gray-300">
          Manage user questions and provide answers
        </p>
      </div>

      {/* Status Filters */}
      <div className="flex flex-wrap gap-3">
        {statuses.map((status) => {
          const Icon = status.icon;
          const isActive = selectedStatus === status.value;
          return (
            <button
              key={status.value}
              onClick={() => setSelectedStatus(status.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                isActive
                  ? "bg-gold text-primary-dark"
                  : "bg-white/10 text-gray-300 hover:bg-white/20"
              }`}
            >
              {Icon && <Icon className="w-4 h-4" />}
              {status.label}
            </button>
          );
        })}
      </div>

      {/* Questions List */}
      {questions.length === 0 ? (
        <div className="text-center py-12 bg-white/5 rounded-xl border border-white/20">
          <MessageSquare className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">No questions found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((question) => (
            <div
              key={question.id}
              className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 rounded-xl p-6 hover:border-gold/50 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                        question.status
                      )}`}
                    >
                      {question.status}
                    </span>
                    {question.lesson && (
                      <span className="text-sm text-gray-400">
                        Related to: {question.lesson.title}
                      </span>
                    )}
                  </div>
                  <p className="text-white text-lg mb-3">{question.content}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {question.user.name || question.user.email}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {new Date(question.createdAt).toLocaleDateString()}
                    </div>
                    {question.claimedBy && (
                      <div className="flex items-center gap-2 text-gold">
                        <UserCheck className="w-4 h-4" />
                        Claimed by {question.claimedBy.name || question.claimedBy.email}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-4 border-t border-white/10">
                <Link
                  href={`/admin/questions/${question.id}`}
                  className="px-4 py-2 bg-gold/20 text-gold rounded-lg font-medium hover:bg-gold/30 transition-colors"
                >
                  View Details
                </Link>

                {question.status === "PENDING" && (
                  <button
                    onClick={() => handleClaim(question.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg font-medium hover:bg-blue-500/30 transition-colors"
                  >
                    <UserCheck className="w-4 h-4" />
                    Claim
                  </button>
                )}

                {question.status === "CLAIMED" && (
                  <>
                    <button
                      onClick={() => handleMarkDiscussing(question.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg font-medium hover:bg-purple-500/30 transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Mark Discussing
                    </button>
                    <button
                      onClick={() => handleUnclaim(question.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-500/20 text-gray-400 rounded-lg font-medium hover:bg-gray-500/30 transition-colors"
                    >
                      <UserMinus className="w-4 h-4" />
                      Unclaim
                    </button>
                  </>
                )}

                <button
                  onClick={() => handleDelete(question.id)}
                  className="ml-auto p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function getStatusColor(status: string) {
  switch (status) {
    case "PENDING":
      return "bg-yellow-500/20 text-yellow-400";
    case "CLAIMED":
      return "bg-blue-500/20 text-blue-400";
    case "DISCUSSING":
      return "bg-purple-500/20 text-purple-400";
    case "ANSWERED":
      return "bg-green-500/20 text-green-400";
    default:
      return "bg-gray-500/20 text-gray-400";
  }
}
