"use client";

import { useState } from "react";
import { deleteLesson } from "@/actions";
import { Video, Book, Trash2, ExternalLink, Calendar } from "lucide-react";

interface RecentLessonsProps {
  lessons: any[];
}

export function RecentLessons({ lessons: initialLessons }: RecentLessonsProps) {
  const [lessons, setLessons] = useState(initialLessons);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This will also remove associated files from Cloudinary.`)) {
      return;
    }

    setDeletingId(id);
    try {
      const result = await deleteLesson(id);
      if (result.success) {
        setLessons(lessons.filter((l) => l.id !== id));
      } else {
        alert(result.error || "Failed to delete lesson");
      }
    } catch (error) {
      alert("An unexpected error occurred");
    } finally {
      setDeletingId(null);
    }
  };

  if (lessons.length === 0) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
        <Video className="w-12 h-12 text-gray-600 mx-auto mb-3" />
        <p className="text-gray-400">No recent uploads found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {lessons.map((lesson) => (
        <div
          key={lesson.id}
          className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 transition-all group flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="bg-gold/10 p-3 rounded-lg border border-gold/20">
              {lesson.type === "VIDEO" ? (
                <Video className="w-5 h-5 text-gold" />
              ) : (
                <Book className="w-5 h-5 text-gold" />
              )}
            </div>
            <div>
              <h4 className="text-white font-medium line-clamp-1">{lesson.title}</h4>
              <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(lesson.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                <span>•</span>
                <span>
                  {lesson.volume?.category?.name} / {lesson.volume?.title}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleDelete(lesson.id, lesson.title)}
              disabled={deletingId === lesson.id}
              className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50"
              title="Quick Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
