import { getCategories } from "@/actions/categories";
import { getPublishedLessons } from "@/actions/lessons";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BookOpen, MessageCircleQuestion, PlayCircle } from "lucide-react";
import { Category } from "@prisma/client";

interface CategoryWithCount extends Category {
  _count?: {
    volumes: number;
  };
}

export default async function Home() {
  const [categoriesData, latestLessonsData] = await Promise.all([
    getCategories(),
    getPublishedLessons({ limit: 4 }),
  ]);

  const categories = categoriesData.success ? categoriesData.data : [];
  const latestLessons = latestLessonsData.success ? latestLessonsData.data : [];

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
              Orthodox Christian Learning Hub
            </span>
          </div>
          
          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Discover the <span className="text-accent">Timeless Wisdom</span> <br />
            of the Orthodox Faith
          </h1>
          
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-10 font-light leading-relaxed">
            A structured journey through Theology, Church History, and Spiritual Life. 
            Join our community to learn, ask, and grow.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/lessons"
              className="w-full sm:w-auto px-8 py-3 bg-accent text-primary-foreground font-bold rounded-md hover:bg-accent/90 transition-colors flex items-center justify-center gap-2"
            >
              Start Learning <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/questions"
              className="w-full sm:w-auto px-8 py-3 bg-white/10 text-white font-medium rounded-md hover:bg-white/20 transition-colors backdrop-blur-sm border border-white/20"
            >
              Ask a Question
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-primary mb-4">
              Explore Topics
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Browse our curated collection of lessons organized by category.
            </p>
          </div>

          {categories && categories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category: CategoryWithCount) => (
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
                      {category._count?.volumes || 0} Volumes
                    </span>
                  </div>
                  <h3 className="font-serif text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {category.description || "Explore lessons in this category."}
                  </p>
                  <div className="flex items-center text-sm font-medium text-accent opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    Explore <ArrowRight className="h-4 w-4 ml-1" />
                  </div>
                </Link>
              ))}
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
                Latest Lessons
              </h2>
              <p className="text-muted-foreground">
                Recently published content for you.
              </p>
            </div>
            <Link 
              href="/lessons" 
              className="hidden md:flex items-center text-sm font-medium text-primary hover:text-accent transition-colors"
            >
              View All <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>

          {latestLessons && latestLessons.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {latestLessons.map((lesson) => (
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
                    <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 rounded text-[10px] font-bold text-white">
                      VIDEO
                    </div>
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <div className="text-xs font-medium text-accent mb-2 uppercase tracking-wide">
                      {lesson.volume?.category?.name}
                    </div>
                    <h3 className="font-serif font-bold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                      {lesson.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-auto pt-2 flex items-center gap-2">
                      <span>{new Date(lesson.createdAt).toLocaleDateString()}</span>
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 px-4">
              <p className="text-muted-foreground">No lessons published yet. Check back soon!</p>
            </div>
          )}
          
          <div className="mt-8 text-center md:hidden">
            <Link 
              href="/lessons" 
              className="inline-flex items-center text-sm font-medium text-primary hover:text-accent transition-colors"
            >
              View All Lessons <ArrowRight className="h-4 w-4 ml-1" />
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
            Have a Question about the Faith?
          </h2>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto mb-8 text-lg">
            Our Q&A section allows you to submit questions to be answered by teachers. 
            Search our existing answers or submit your own.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/questions/new"
              className="w-full sm:w-auto px-8 py-3 bg-accent text-primary-foreground font-bold rounded-md hover:bg-accent/90 transition-colors"
            >
              Ask a Question
            </Link>
            <Link
              href="/questions"
              className="w-full sm:w-auto px-8 py-3 bg-transparent border border-primary-foreground/30 text-primary-foreground font-medium rounded-md hover:bg-primary-foreground/10 transition-colors"
            >
              Browse Answers
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
