import Link from "next/link";
import Image from "next/image";
import { BookOpen, MessageCircleQuestion, Heart, Shield, GraduationCap, ArrowRight } from "lucide-react";

export default function AboutPage() {
  const pillars = [
    {
      icon: <GraduationCap className="h-8 w-8 text-accent" />,
      title: "Wisdom",
      description: "Dive deep into structured lessons covering Theology, Church History, and the lives of the Saints, curated by dedicated teachers."
    },
    {
      icon: <MessageCircleQuestion className="h-8 w-8 text-accent" />,
      title: "Dialogue",
      description: "A sacred space to ask questions and receive thoughtful, tradition-rooted answers from the community and its guides."
    },
    {
      icon: <Heart className="h-8 w-8 text-accent" />,
      title: "Growth",
      description: "Our mission is to support your spiritual journey, providing resources that nourish the soul and strengthen the bond with our heritage."
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[500px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/about-hero.jpg"
            alt="Sacred Orthodox Atmosphere"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-primary/85 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center">
          <h1 className="font-serif text-5xl md:text-7xl font-bold text-white mb-6">
            Our Sacred <span className="text-accent">Mission</span>
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto font-light leading-relaxed">
            Preserving tradition, fostering understanding, and illuminating the path of the Orthodox faith for the modern world.
          </p>
        </div>
      </section>

      {/* Defining Kenean Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-block px-3 py-1 border border-accent/30 rounded-full bg-accent/10">
                <span className="text-accent font-medium text-sm tracking-widest uppercase">
                  The Meaning of Kenean
                </span>
              </div>
              <h2 className="font-serif text-4xl font-bold text-primary">
                A Hub for Faithful Discovery
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Kenean is more than just a learning platform—it is a digital bridge to the timeless wisdom of the Orthodox Christian tradition. Born from a desire to make sacred knowledge accessible to all, we provide a structured environment where the faithful can explore the depths of their heritage.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Whether you are a lifelong believer seeking deeper theological understanding or a curious soul exploring the faith for the first time, Kenean offers the tools and community support to guide your journey.
              </p>
              <div className="flex pt-4">
                <Link
                  href="/register"
                  className="px-8 py-3 bg-primary text-primary-foreground font-bold rounded-md hover:bg-accent transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
                >
                  Join Our Community <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-secondary/50 rounded-2xl overflow-hidden border border-border flex items-center justify-center p-12">
                <div className="relative z-10 text-center space-y-6">
                   <div className="bg-primary/10 p-6 rounded-full inline-block mb-4">
                      <BookOpen className="h-16 w-16 text-primary" />
                   </div>
                   <h3 className="font-serif text-2xl font-bold text-primary italic">
                     "The heart of the wise seeks knowledge."
                   </h3>
                   <p className="text-muted-foreground font-medium">Proverbs 15:14</p>
                </div>
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -mr-16 -mt-16 blur-3xl" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/5 rounded-full -ml-16 -mb-16 blur-3xl" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Three Pillars Section */}
      <section className="py-24 bg-secondary/30 border-y">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl font-bold text-primary mb-4">The Three Pillars</h2>
            <div className="h-1 w-20 bg-accent mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {pillars.map((pillar, index) => (
              <div key={index} className="bg-card p-10 rounded-xl border border-border hover:border-accent/50 transition-all group shadow-sm hover:shadow-xl">
                <div className="mb-6 transform group-hover:scale-110 transition-transform duration-300">
                  {pillar.icon}
                </div>
                <h3 className="font-serif text-2xl font-bold mb-4 group-hover:text-primary transition-colors">
                  {pillar.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-24 bg-background overflow-hidden relative">
        <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent -translate-y-1/2 opacity-50" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <Shield className="h-16 w-16 text-accent/20 mx-auto" />
            <h2 className="font-serif text-4xl font-bold text-primary">Our Philosophy</h2>
            <p className="text-xl text-muted-foreground italic font-light leading-relaxed">
              "We believe that the beauty of our ancient faith should be presented with the excellence that modern technology allows. Our commitment is to remain uncompromising in our adherence to Orthodox tradition while being innovative in how we share it with the world."
            </p>
            <div className="pt-6">
               <p className="text-primary font-bold uppercase tracking-widest text-sm">— The Kenean Team</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
            <h2 className="font-serif text-4xl md:text-5xl font-bold mb-8">Ready to Start Your Journey?</h2>
            <p className="text-primary-foreground/70 text-lg max-w-2xl mx-auto mb-12">
              Join thousands of learners in exploring the richness of the Orthodox faith today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <Link
                  href="/register"
                  className="w-full sm:w-auto px-10 py-4 bg-accent text-primary-foreground font-bold rounded-md hover:bg-accent/90 transition-all shadow-xl shadow-black/20"
                >
                  Create Your Account
                </Link>
                <Link
                  href="/lessons"
                  className="w-full sm:w-auto px-10 py-4 border border-primary-foreground/20 hover:bg-primary-foreground/10 transition-all rounded-md font-medium"
                >
                  Explore Lessons
                </Link>
            </div>
        </div>
      </section>
    </div>
  );
}
