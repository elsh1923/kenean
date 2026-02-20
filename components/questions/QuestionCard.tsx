"use client";

import Link from "next/link";
import { MessageSquare, Calendar, ChevronRight, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuestionCardProps {
  question: {
    id: string;
    content: string;
    createdAt: Date | string;
    user: {
      name: string | null;
      image: string | null;
    };
    lesson?: {
      id: string;
      title: string;
    } | null;
    answer?: {
      createdAt: Date | string;
      author: {
        name: string | null;
      };
    } | null;
  };
  className?: string;
}

export function QuestionCard({ question, className }: QuestionCardProps) {
  return (
    <Link
      href={`/questions/${question.id}`}
      className={cn(
        "group block bg-card border border-border rounded-2xl p-6 hover:border-accent hover:shadow-xl hover:shadow-accent/5 transition-all duration-300",
        className
      )}
    >
      <div className="flex flex-col h-full">
        {/* Header: User & Date */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-primary overflow-hidden">
              {question.user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={question.user.image}
                  alt={question.user.name || "User"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-4 h-4" />
              )}
            </div>
            <span className="text-sm font-medium text-foreground">
              {question.user.name || "Anonymous User"}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="w-3.5 h-3.5" />
            <span>
              {new Date(question.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <p className="text-lg font-serif font-medium text-foreground line-clamp-3 mb-4 group-hover:text-primary transition-colors">
            "{question.content}"
          </p>
        </div>

        {/* Footer: Lesson Tag & Answer Status */}
        <div className="mt-auto pt-4 border-t border-border/50 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            {question.lesson ? (
              <span className="text-[10px] font-bold uppercase tracking-widest text-accent/60">
                Lesson: {question.lesson.title}
              </span>
            ) : (
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                General Question
              </span>
            )}
            {question.answer && (
              <span className="text-[10px] font-bold text-green-500/80 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                Answered by {question.answer.author.name}
              </span>
            )}
          </div>
          <div className="flex items-center text-accent text-sm font-bold group-hover:translate-x-1 transition-transform">
            View <ChevronRight className="w-4 h-4 ml-0.5" />
          </div>
        </div>
      </div>
    </Link>
  );
}
