"use client";

import {
  Users,
  FolderTree,
  BookOpen,
  Video,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Clock,
  LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Icon mapping
const iconMap: Record<string, LucideIcon> = {
  Users,
  FolderTree,
  BookOpen,
  Video,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Clock,
};

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: string; // Changed to string
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function StatCard({
  title,
  value,
  icon,
  trend,
  className,
}: StatCardProps) {
  const Icon = icon ? iconMap[icon] : null;
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105",
        className
      )}
    >
      {/* Decorative gradient overlay */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gold/20 to-transparent rounded-full blur-2xl -mr-16 -mt-16" />

      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-300 uppercase tracking-wide">
              {title}
            </p>
            <p className="mt-2 text-3xl font-serif font-bold text-white">
              {value}
            </p>
          </div>
          {Icon && (
            <div className="flex-shrink-0 p-3 bg-gold/20 rounded-lg border border-gold/30">
              <Icon className="w-6 h-6 text-gold" />
            </div>
          )}
        </div>

        {trend && (
          <div className="mt-4 flex items-center gap-1">
            <span
              className={cn(
                "text-sm font-medium",
                trend.isPositive ? "text-green-400" : "text-red-400"
              )}
            >
              {trend.isPositive ? "+" : ""}
              {trend.value}%
            </span>
            <span className="text-sm text-gray-400">vs last month</span>
          </div>
        )}
      </div>
    </div>
  );
}
