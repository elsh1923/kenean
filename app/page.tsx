import { getCategories } from "@/actions/categories";
import { getPublishedLessons } from "@/actions/lessons";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BookOpen, MessageCircleQuestion, PlayCircle } from "lucide-react";
import { Category, Lesson, Volume } from "@prisma/client";
import { getServerDict, getServerLanguage } from "@/lib/i18n-server";

// Define more precise types for included data
interface CategoryWithCount extends Category {
  _count?: {
    volumes: number;
  };
}

interface LessonWithRelations extends Lesson {
  volume?: (Volume & {
    category?: Category | null;
  }) | null;
}

export default async function Home() {
  // Fetch data with error handling
  const responses = await Promise.allSettled([
    getCategories(),
    getPublishedLessons({ limit: 4 }),
    getServerDict(),
    getServerLanguage(),
  ]);

  const categoriesData = responses[0].status === "fulfilled" ? responses[0].value : { success: false, data: [] };
  const latestLessonsData = responses[1].status === "fulfilled" ? responses[1].value : { success: false, data: [] };
  const dict = responses[2].status === "fulfilled" ? responses[2].value : null;
  const lang = responses[3].status === "fulfilled" ? responses[3].value : "en";

  // Graceful fallback for dict
  if (!dict) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Failed to load translations. Please refresh the page.</p>
      </div>
    );
  }

  const categories = (categoriesData.success ? categoriesData.data : []) as CategoryWithCount[];
  const latestLessons = (latestLessonsData.success ? latestLessonsData.data : []) as LessonWithRelations[];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/kenean-landpage.jpg"
            alt="Ancient Orthodox Script"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-primary/80 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-4 text-center">
          <div className="inline-block px-3 py-1 mb-6 border border-accent/30 rounded-full bg-accent/10 backdrop-blur-sm">
            <span className="text-accent font-medium text-sm tracking-widest uppercase">
              {lang === "en" ? "Orthodox Christian Learning Hub" : lang === "am" ? "የኦርቶዶክስ ክርስቲያን የመማሪያ ማዕከል" : "ማዕከለ ትምህርት ዘኦርቶዶክስ ተዋህዶ"}
            </span>
          </div>
          
          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            {lang === "en" && dict.home.heroTitle.includes("for") ? (
              dict.home.heroTitle.split("for").map((part, i) => (
                <span key={i}>
                  {i === 0 ? part : <><span className="text-accent">for</span>{part}</>}
                  {i === 0 && <br />}
                </span>
              ))
            ) : (
              dict.home.heroTitle
            )}
          </h1>
          
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-10 font-light leading-relaxed">
            {dict.home.heroSubtitle}
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/lessons"
              className="w-full sm:w-auto px-8 py-3 bg-accent text-primary-foreground font-bold rounded-md hover:bg-accent/90 transition-colors flex items-center justify-center gap-2"
            >
              {dict.home.startLearning} <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/questions"
              className="w-full sm:w-auto px-8 py-3 bg-white/10 text-white font-medium rounded-md hover:bg-white/20 transition-colors backdrop-blur-sm border border-white/20"
            >
              {dict.home.viewQuestions}
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-primary mb-4">
              {lang === "en" ? "Explore Topics" : lang === "am" ? "ርዕሶችን ያስሱ" : "ርዕስተ ትምህርት"}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {lang === "en" ? "Browse our curated collection of lessons organized by category." : lang === "am" ? "በምድብ የተደራጁ ትምህርቶቻችንን ያስሱ።" : "ትምህርት ዘበበምዕራፍ ተደለወ።"}
            </p>
          </div>

          {categories && categories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => {
                const displayName = lang === "am" && category.nameAmharic ? category.nameAmharic : 
                                  lang === "gz" && category.nameGeez ? category.nameGeez : 
                                  category.name;
                const displayDesc = lang === "am" && category.descriptionAmharic ? category.descriptionAmharic : 
                                   lang === "gz" && category.descriptionGeez ? category.descriptionGeez : 
                                   category.description;

                return (
                  <Link
                    key={category.id}
                    href={`/categories/${category.slug}`}
                    className="group relative overflow-hidden rounded-lg border bg-card p-6 hover:shadow-lg transition-all border-l-4 border-l-transparent hover:border-l-accent"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 bg-secondary rounded-lg group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <BookOpen className="h-6 w-6" />
                      </div>
                      <span className="text-xs font-medium text-muted-foreground bg-secondary px-2 py-1 rounded-full">
                        {category._count?.volumes || 0} {lang === "en" ? "Volumes" : lang === "am" ? "ቅጾች" : "ክፍላተ መጻሕፍት"}
                      </span>
                    </div>
                    <h3 className="font-serif text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {displayName}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {displayDesc || (lang === "en" ? "Explore lessons in this category." : lang === "am" ? "በዚህ ምድብ ውስጥ ያሉ ትምህርቶችን ያስሱ።" : "ትምህርት ዘበዝንቱ ክፍል ርኢ።")}
                    </p>
                    <div className="flex items-center text-sm font-medium text-accent opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                      {lang === "en" ? "Explore" : lang === "am" ? "ያስሱ" : "ርኢ"} <ArrowRight className="h-4 w-4 ml-1" />
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 px-4 rounded-lg bg-secondary/30 border border-dashed">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium text-foreground">No Categories Yet</h3>
              <p className="text-muted-foreground mb-6">Content is currently being added.</p>
            </div>
          )}
        </div>
      </section>

      {/* Latest Lessons Section */}
      <section className="py-20 bg-secondary/30 border-y">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-primary mb-2">
                {lang === "en" ? "Latest Lessons" : lang === "am" ? "አዳዲስ ትምህርቶች" : "አሐዱ ትምህርት"}
              </h2>
              <p className="text-muted-foreground">
                {lang === "en" ? "Recently published content for you." : lang === "am" ? "በቅርቡ የታተሙ ይዘቶች።" : "ትምህርት ዘበዝንቱ መዋዕል ተረክበ።"}
              </p>
            </div>
            <Link 
              href="/lessons" 
              className="hidden md:flex items-center text-sm font-medium text-primary hover:text-accent transition-colors"
            >
              {lang === "en" ? "View All" : lang === "am" ? "ሁሉንም ይመልከቱ" : "ኩሎ ርኢ"} <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>

          {latestLessons && latestLessons.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {latestLessons.map((lesson) => {
                const displayTitle = lang === "am" && lesson.titleAmharic ? lesson.titleAmharic : 
                                   lang === "gz" && lesson.titleGeez ? lesson.titleGeez : 
                                   lesson.title;
                
                const category = lesson.volume?.category;
                const categoryName = category ? (
                  lang === "am" && category.nameAmharic ? category.nameAmharic :
                  lang === "gz" && category.nameGeez ? category.nameGeez :
                  category.name
                ) : null;

                return (
                  <Link
                    key={lesson.id}
                    href={`/lessons/${lesson.id}`}
                    className="group bg-card rounded-lg overflow-hidden border hover:shadow-md transition-all flex flex-col h-full"
                  >
                    <div className="relative aspect-video bg-muted overflow-hidden">
                      {lesson.thumbnailUrl ? (
                        <Image
                          src={lesson.thumbnailUrl}
                          alt={lesson.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-secondary">
                          <PlayCircle className="h-12 w-12 text-muted-foreground/50" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                      <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 rounded text-[10px] font-bold text-white uppercase">
                        {lesson.type}
                      </div>
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                      <div className="text-xs font-medium text-accent mb-2 uppercase tracking-wide">
                        {categoryName || (lang === "en" ? "General" : lang === "am" ? "አጠቃላይ" : "ኵላዊ")}
                      </div>
                      <h3 className="font-serif font-bold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                        {displayTitle}
                      </h3>
                      <div className="text-xs text-muted-foreground mt-auto pt-2">
                        {new Date(lesson.createdAt).toLocaleDateString(lang === "en" ? "en-US" : "am-ET")}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 px-4">
              <p className="text-muted-foreground">
                {lang === "en" ? "No lessons published yet. Check back soon!" : lang === "am" ? "ምንም ትምህርት ገና አልታተመም። በቅርቡ ይመለሱ!" : "ትምህርት ዘኢተረክበ።"}
              </p>
            </div>
          )}
          
          <div className="mt-8 text-center md:hidden">
            <Link 
              href="/lessons" 
              className="inline-flex items-center text-sm font-medium text-primary hover:text-accent transition-colors"
            >
              {lang === "en" ? "View All Lessons" : lang === "am" ? "ሁሉንም ትምህርቶች ይመልከቱ" : "ኩሎ ትምህርተ ርኢ"} <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* Q&A CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 p-12 opacity-10 transform translate-x-1/2 -translate-y-1/4">
          <MessageCircleQuestion className="h-96 w-96" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <MessageCircleQuestion className="h-16 w-16 mx-auto mb-6 text-accent" />
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
            {lang === "en" ? "Have a Question about the Faith?" : lang === "am" ? "ስለ ሃይማኖቱ ጥያቄ አልዎት?" : "ቦኑ ተሰእሎ በእንተ ሃይማኖት?"}
          </h2>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto mb-8 text-lg">
            {lang === "en" ? "Our Q&A section allows you to submit questions to be answered by teachers. Search our existing answers or submit your own." : lang === "am" ? "የጥያቄና መልስ ክፍላችን በመምህራን የሚመለሱ ጥያቄዎችን እንዲያቀርቡ ያስችልዎታል። ነባር መልሶችን ይፈልጉ ወይም የእርስዎን ያቅርቡ።" : "ክፍል ተሰእሎ ወመላሽ ዘየሀብ መጽሐፈ ለተሰእሎትከ።"}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/questions/new"
              className="w-full sm:w-auto px-8 py-3 bg-accent text-primary-foreground font-bold rounded-md hover:bg-accent/90 transition-colors"
            >
              {lang === "en" ? "Ask a Question" : lang === "am" ? "ጥያቄ ይጠይቁ" : "ተሰአል"}
            </Link>
            <Link
              href="/questions"
              className="w-full sm:w-auto px-8 py-3 bg-transparent border border-primary-foreground/30 text-primary-foreground font-medium rounded-md hover:bg-primary-foreground/10 transition-colors"
            >
              {lang === "en" ? "Browse Answers" : lang === "am" ? "መልሶችን ያስሱ" : "መላሽ ርኢ"}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
