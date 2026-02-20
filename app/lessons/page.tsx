import { getPublishedLessons } from "@/actions";
import { getServerLanguage, getServerDict } from "@/lib/i18n-server";
import { ArrowLeft, Video, Clock, ChevronRight, BookOpen } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default async function VideoLessonsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type = "VIDEO" } = await searchParams;
  const [result, lang, dict] = await Promise.all([
    getPublishedLessons(),
    getServerLanguage(),
    getServerDict(),
  ]);
  
  if (!result.success || !result.data) {
    return (
      <div className="min-h-screen bg-background py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl font-serif text-primary">
            {lang === "en" ? "Failed to load lessons." : lang === "am" ? "ትምህርቶችን መጫን አልተቻለም።" : "ጌጋ ተረክበ።"}
          </h1>
        </div>
      </div>
    );
  }

  const lessons = result.data.filter((l: any) => l.type === type);
  const isBook = type === "BOOK";

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="bg-secondary/30 border-b py-12">
        <div className="container mx-auto px-4">
          <Link 
            href="/" 
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {lang === "en" ? "Back to Home" : lang === "am" ? "ወደ ዋናው ገጽ" : "ገቢረ ምግባር"}
          </Link>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-4">
            {isBook 
              ? (lang === "en" ? "Books & Literature" : lang === "am" ? "መጽሐፍት" : "መጻሕፍት")
              : (lang === "en" ? "Video Lessons" : lang === "am" ? "የቪዲዮ ትምህርቶች" : "ትምህርተ ቪዲዮ")
            }
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl font-serif">
            {isBook 
              ? (lang === "en" ? "Spiritual books and literature to deepen your knowledge." : lang === "am" ? "እውቀትዎን ለማጥለቅ መንፈሳዊ መጽሐፍት እና ሥነ-ጽሑፍ።" : "መጻሕፍት ወሃይማኖት።")
              : (lang === "en" ? "Deepen your understanding through our curated collection of spiritual videos and lectures." : lang === "am" ? "የተመረጡ መንፈሳዊ ቪዲዮዎችን እና ትምህርቶችን በማየት ግንዛቤዎን ያሳድጉ።" : "ትምህርት ዘበቪዲዮ።")
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
            <h2 className="text-xl font-medium text-foreground">
              {lang === "en" ? `No ${isBook ? "books" : "videos"} found` : lang === "am" ? `${isBook ? "መጽሐፍት" : "ቪዲዮዎች"} አልተገኙም` : "አልተረክበ"}
            </h2>
            <p className="text-muted-foreground mt-2">
              {lang === "en" ? "Check back later for new content." : lang === "am" ? "ለአዳዲስ ይዘቶች ቆይተው ይመልከቱ።" : "አአትት።"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {lessons.map((lesson: any) => {
              // Localized fields
              const title = lang === "am" ? (lesson.titleAmharic || lesson.title) : lang === "gz" ? (lesson.titleGeez || lesson.title) : lesson.title;
              const desc = lang === "am" ? (lesson.descriptionAmharic || lesson.description) : lang === "gz" ? (lesson.descriptionGeez || lesson.description) : lesson.description;
              const catName = lang === "am" ? (lesson.volume.category.nameAmharic || lesson.volume.category.name) : lang === "gz" ? (lesson.volume.category.nameGeez || lesson.volume.category.name) : lesson.volume.category.name;
              const volTitle = lang === "am" ? (lesson.volume.titleAmharic || lesson.volume.title) : lang === "gz" ? (lesson.volume.titleGeez || lesson.volume.title) : lesson.volume.title;

              return (
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
                        alt={title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Video className="w-10 h-10 text-muted-foreground/30" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                      <div className="w-14 h-14 bg-accent text-accent-foreground rounded-full flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-300">
                        {isBook ? <BookOpen className="w-6 h-6 fill-current" /> : <Video className="w-6 h-6 fill-current" />}
                      </div>
                    </div>
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
                      <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 bg-accent/10 text-accent rounded-full border border-accent/20 font-serif">
                        {catName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {lang === "en" ? "Vol" : lang === "am" ? "ቅጽ" : "ቅጽ"} {lesson.volume.volumeNumber}
                      </span>
                    </div>
                    <h3 className="text-xl font-serif font-bold text-foreground mb-2 group-hover:text-accent transition-colors">
                      {title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4 h-10 font-serif">
                      {desc || (lang === "en" ? "No description provided." : lang === "am" ? "ምንም መግለጫ አልተሰጠም።" : "አልተረክበ።")}
                    </p>
                    
                    <div className="flex items-center text-accent text-sm font-bold group-hover:translate-x-1 transition-transform">
                      {isBook 
                        ? (lang === "en" ? "Read Book" : lang === "am" ? "መጽሐፉን አንብብ" : "አንብብ") 
                        : (lang === "en" ? "Watch Lesson" : lang === "am" ? "ትምህርቱን ይመልከቱ" : "ርኢ")} 
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
