import { getPublishedLessons } from "@/actions";
import { ArrowLeft, Video, Clock, ChevronRight, BookOpen } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "Video Lessons - Kenean",
  description: "Browse our collection of Orthodox Christian video lessons.",
};

export default async function VideoLessonsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type = "VIDEO" } = await searchParams;
  const result = await getPublishedLessons();
  
  if (!result.success || !result.data) {
    return (
      <div className="min-h-screen bg-background py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl font-serif text-primary">Failed to load lessons.</h1>
        </div>
      </div>
    );
  }

  const lessons = result.data.filter((l: any) => l.type === type);
  const isBook = type === "BOOK";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-secondary/30 border-b py-12">
        <div className="container mx-auto px-4">
          <Link 
            href="/" 
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-4">
            {isBook ? "Books & Literature" : "Video Lessons"}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            {isBook 
              ? "spiritual books and literature to deepen your knowledge."
              : "Deepen your understanding through our curated collection of spiritual videos and lectures."
            }
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {lessons.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-2xl border border-dashed border-border">
            {isBook ? (
              <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-20" />
            ) : (
              <Video className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-20" />
            )}
            <h2 className="text-xl font-medium text-foreground">No {isBook ? "books" : "videos"} found</h2>
            <p className="text-muted-foreground mt-2">Check back later for new content.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {lessons.map((lesson: any) => (
              <Link 
                key={lesson.id} 
                href={`/lessons/${lesson.id}`}
                className="group bg-card border border-border rounded-2xl overflow-hidden hover:border-accent hover:shadow-xl hover:shadow-accent/5 transition-all duration-500"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video bg-muted overflow-hidden">
                  {lesson.thumbnailUrl ? (
                    <Image
                      src={lesson.thumbnailUrl}
                      alt={lesson.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Video className="w-10 h-10 text-muted-foreground/30" />
                    </div>
                  )}
                  {/* Play/Book Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                    <div className="w-14 h-14 bg-accent text-accent-foreground rounded-full flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-300">
                      {isBook ? (
                        <BookOpen className="w-6 h-6 fill-current" />
                      ) : (
                        <Video className="w-6 h-6 fill-current" />
                      )}
                    </div>
                  </div>
                  {/* Duration Badge */}
                  {lesson.duration && (
                    <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/80 backdrop-blur-md rounded text-[10px] font-bold text-white flex items-center gap-1">
                      <Clock className="w-3 h-3 text-accent" />
                      {Math.floor(lesson.duration / 60)}:{(lesson.duration % 60).toString().padStart(2, '0')}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 bg-accent/10 text-accent rounded-full border border-accent/20">
                      {lesson.volume.category.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Volume {lesson.volume.volumeNumber}
                    </span>
                  </div>
                  <h3 className="text-xl font-serif font-bold text-foreground mb-2 group-hover:text-accent transition-colors">
                    {lesson.title}
                  </h3>
                  {lesson.titleAmharic && (
                    <p className="text-sm font-medium text-muted-foreground/60 mb-3 font-serif">
                      {lesson.titleAmharic}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4 h-10">
                    {lesson.description || "No description provided."}
                  </p>
                  
                  <div className="flex items-center text-accent text-sm font-bold group-hover:translate-x-1 transition-transform">
                    {isBook ? "Read Book" : "Watch Lesson"} <ChevronRight className="w-4 h-4 ml-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
