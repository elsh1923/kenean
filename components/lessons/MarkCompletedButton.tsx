"use client";

import { useState } from "react";
import { markLessonCompleted } from "@/actions";
import { CheckCircle2, Circle } from "lucide-react";

export function MarkCompletedButton({ 
  lessonId, 
  initialCompleted,
  lang = "en"
}: { 
  lessonId: string; 
  initialCompleted: boolean;
  lang?: string;
}) {
  const [isCompleted, setIsCompleted] = useState(initialCompleted);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    setIsLoading(true);
    const newStatus = !isCompleted;
    
    // Optimistic UI update
    setIsCompleted(newStatus);
    
    const result = await markLessonCompleted(lessonId, newStatus);
    if (!result.success) {
      // Revert if failed
      setIsCompleted(!newStatus);
      alert(result.error || "Failed to mark as completed");
    }
    
    setIsLoading(false);
  };

  const textCompleted = lang === "en" ? "Completed" : lang === "am" ? "ተጠናቋል" : "ተፈጸመ";
  const textMarkComplete = lang === "en" ? "Mark as Completed" : lang === "am" ? "እንደተጠናቀቀ ምልክት ያድርጉ" : "ምልክት ግበር ከም ዝተወድአ";

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all duration-300 shadow-sm ${
        isCompleted 
          ? "bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-800/40" 
          : "bg-card border-border hover:border-accent hover:text-accent font-medium text-muted-foreground"
      } font-serif`}
    >
      {isCompleted ? (
        <CheckCircle2 className={`w-5 h-5 ${isLoading ? "animate-pulse" : ""}`} />
      ) : (
        <Circle className={`w-5 h-5 ${isLoading ? "animate-pulse" : ""}`} />
      )}
      <span>{isCompleted ? textCompleted : textMarkComplete}</span>
    </button>
  );
}
