import { getLesson } from "@/actions";
import { ArrowLeft, Calendar, FileText, Share2, PlayCircle } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

function extractYouTubeId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

export default async function LessonDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getLesson(id);

  if (!result.success || !result.data) {
    notFound();
  }

  const lesson = result.data;
  const videoId = lesson.youtubeUrl ? extractYouTubeId(lesson.youtubeUrl) : null;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          <Link href="/lessons" className="hover:text-primary transition-colors">Lessons</Link>
          <span>/</span>
          <span className="text-primary font-medium truncate">{lesson.title}</span>
        </div>

        {/* Video Player Section */}
        <div className="bg-black rounded-2xl overflow-hidden shadow-2xl border border-border mb-10 aspect-video relative group">
          {videoId ? (
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
              title={lesson.title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground gap-4">
              <PlayCircle className="w-16 h-16 opacity-20" />
              <p>Video content not found</p>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-xs font-bold uppercase tracking-widest border border-accent/20">
                  {lesson.volume.category.name}
                </span>
                <span className="text-sm text-muted-foreground font-medium">
                  Volume {lesson.volume.volumeNumber} • Lesson {lesson.lessonNumber}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-4 leading-tight">
                {lesson.title}
              </h1>
              {lesson.titleAmharic && (
                <p className="text-2xl font-serif text-accent/80 mb-6">
                  {lesson.titleAmharic}
                </p>
              )}
              
              <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground mt-8 p-4 bg-secondary/20 rounded-xl border border-border/50">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-accent" />
                  <span>
                    {new Date(lesson.createdAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
                {lesson.type === "BOOK" && lesson.pdfUrl && (
                  <a 
                    href={lesson.pdfUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-accent hover:underline font-bold"
                  >
                    <FileText className="w-4 h-4" />
                    Read PDF Version
                  </a>
                )}
                <button className="flex items-center gap-2 hover:text-primary transition-colors ml-auto">
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
              </div>
            </div>

            <div className="prose prose-invert max-w-none">
              <h2 className="text-2xl font-serif font-bold text-foreground border-b border-border pb-4 mb-6">
                About this Lesson
              </h2>
              <p className="text-lg leading-relaxed text-muted-foreground whitespace-pre-wrap">
                {lesson.description || "No description provided for this lesson."}
              </p>
            </div>
          </div>

          {/* Sidebar - Up Next / Related */}
          <div className="space-y-6">
            <h3 className="text-xl font-serif font-bold text-primary flex items-center gap-2">
              <span className="w-1 h-6 bg-accent rounded-full inline-block"></span>
              In this Volume
            </h3>
            <div className="space-y-3">
              {lesson.volume.lessons.map((relative: any) => (
                <Link
                  key={relative.id}
                  href={`/lessons/${relative.id}`}
                  className={`flex items-start gap-4 p-3 rounded-xl border transition-all duration-300 ${
                    relative.id === lesson.id 
                      ? "bg-accent/10 border-accent/30 shadow-lg shadow-accent/5 ring-1 ring-accent/20" 
                      : "bg-card border-border hover:border-accent/40"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                    relative.id === lesson.id 
                      ? "bg-accent text-accent-foreground" 
                      : "bg-secondary text-muted-foreground"
                  }`}>
                    {relative.lessonNumber}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold truncate ${
                      relative.id === lesson.id ? "text-primary" : "text-muted-foreground hover:text-primary"
                    }`}>
                      {relative.title}
                    </p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">
                      {relative.id === lesson.id ? "Now Playing" : "Watch Next"}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
            
            <div className="bg-accent/5 border border-accent/20 rounded-2xl p-6 mt-12 text-center">
              <h4 className="font-serif font-bold text-primary mb-2">Have a Question?</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Confused about something in this video? Ask the fathers!
              </p>
              <Link 
                href="/questions" 
                className="inline-block w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-accent hover:text-accent-foreground transition-all shadow-lg shadow-primary/20"
              >
                Ask a Question
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
