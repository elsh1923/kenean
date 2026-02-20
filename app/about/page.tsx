import Link from "next/link";
import Image from "next/image";
import { BookOpen, MessageCircleQuestion, Heart, Shield, GraduationCap, ArrowRight } from "lucide-react";
import { getServerLanguage } from "@/lib/i18n-server";

export default async function AboutPage() {
  const lang = await getServerLanguage();

  const pillars = [
    {
      icon: <GraduationCap className="h-8 w-8 text-accent" />,
      title: lang === "en" ? "Wisdom" : lang === "am" ? "ጥበብ" : "ጥበብ",
      description: lang === "en" 
        ? "Dive deep into structured lessons covering Theology, Church History, and the lives of the Saints, curated by dedicated teachers."
        : lang === "am"
        ? "በትጋት በመምህራን የተዘጋጁ ሥነ-መለኮትን፣ የቤተ ክርስቲያንን ታሪክ እና የቅዱሳንን ሕይወት የሚመለከቱ ትምህርቶችን በጥልቀት ይከታተሉ።"
        : "ጥበበ አበው ዘቤት መጻሕፍት።"
    },
    {
      icon: <MessageCircleQuestion className="h-8 w-8 text-accent" />,
      title: lang === "en" ? "Dialogue" : lang === "am" ? "ውይይት" : "ተሰእሎ",
      description: lang === "en" 
        ? "A sacred space to ask questions and receive thoughtful, tradition-rooted answers from the community and its guides."
        : lang === "am"
        ? "ጥያቄዎችን ለመጠየቅ እና ከማህበረሰቡ እና ከመሪዎቹ የታሰበባቸው፣ በባህሉ ላይ የተመሰረቱ መልሶችን ለመቀበል የተቀደሰ ቦታ።"
        : "ተሰእሎ ወመላሽ ዘአበው።"
    },
    {
      icon: <Heart className="h-8 w-8 text-accent" />,
      title: lang === "en" ? "Growth" : lang === "am" ? "ዕድገት" : "ዕድገት",
      description: lang === "en" 
        ? "Our mission is to support your spiritual journey, providing resources that nourish the soul and strengthen the bond with our heritage."
        : lang === "am"
        ? "ተልእኳችን መንፈሳዊ ጉዞዎን መደገፍ፣ ነፍስን የሚያረኩ እና ከውርሳችን ጋር ያለውን ትስስር የሚያጠናክሩ ግብአቶችን ማቅረብ ነው።"
        : "ተልዕኮነ ውእቱ ረድኤተ አኃው።"
    }
  ];

  return (
    <div className="flex flex-col min-h-screen text-foreground">
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
            {lang === "en" ? "Our Sacred" : lang === "am" ? "የተቀደሰ" : "ቅዱስ"} <span className="text-accent">{lang === "en" ? "Mission" : lang === "am" ? "ተልእኮ" : "ተልዕኮ"}</span>
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto font-light leading-relaxed font-serif">
            {lang === "en" 
              ? "Preserving tradition, fostering understanding, and illuminating the path of the Orthodox faith for the modern world."
              : lang === "am"
              ? "ባህሉን መጠበቅ፣ ግንዛቤን ማጎልበት እና ለዘመናዊው ዓለም የኦርቶዶክስ እምነትን መንገድ ማብራት።"
              : "ዓቀበ ባሕል ወሥርዓት ዘአበው።"
            }
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
                  {lang === "en" ? "The Meaning of Kenean" : lang === "am" ? "የቀንአን ትርጉም" : "ትርጓሜ ቀንአን"}
                </span>
              </div>
              <h2 className="font-serif text-4xl font-bold text-primary">
                {lang === "en" ? "A Hub for Faithful Discovery" : lang === "am" ? "ለታማኝ ግኝቶች ማዕከል" : "ማዕከለ ጥበብ"}
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed font-serif">
                {lang === "en" 
                  ? "Kenean is more than just a learning platform—it is a digital bridge to the timeless wisdom of the Orthodox Christian tradition. Born from a desire to make sacred knowledge accessible to all, we provide a structured environment where the faithful can explore the depths of their heritage."
                  : lang === "am"
                  ? "ቀንአን ከመማሪያ መድረክ በላይ ነው - ወደ ዘላለማዊው የኦርቶዶክስ ክርስቲያን ወግ ጥበብ ዲጂታል ድልድይ ነው። ቅዱስ እውቀትን ለሁሉም ተደራሽ ለማድረግ ካለን ፍላጎት የተነሳ፣ አማኞች የውርሳቸውን ጥልቀት የሚመረምሩበት የተዋቀረ አካባቢ እናቀርባለን።"
                  : "ቀንአን ውእቱ መርበብ ዘጥበብ።"
                }
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed font-serif">
                {lang === "en"
                  ? "Whether you are a lifelong believer seeking deeper theological understanding or a curious soul exploring the faith for the first time, Kenean offers the tools and community support to guide your journey."
                  : lang === "am"
                  ? "ጥልቅ ሥነ-መለኮታዊ ግንዛቤን የምትፈልግ የሕይወት ዘመን አማኝ ብትሆን ወይም እምነቱን ለመጀመሪያ ጊዜ የምትመረምር የማወቅ ጉጉት ያለህ ሰው፣ ቀንአን ጉዞህን ለመምራት መሣሪያዎችን እና የማህበረሰባውን ድጋፍ ይሰጣል።"
                  : "መርሐ ጽድቅ ወጥበብ።"
                }
              </p>
              <div className="flex pt-4">
                <Link
                  href="/register"
                  className="px-8 py-3 bg-primary text-primary-foreground font-bold rounded-md hover:bg-accent transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
                >
                  {lang === "en" ? "Join Our Community" : lang === "am" ? "ማህበረሰባችንን ይቀላቀሉ" : "ተመዝገብ"} <ArrowRight className="h-5 w-5" />
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
                     {lang === "en" ? '"The heart of the wise seeks knowledge."' : lang === "am" ? '"የብልህ ልብ እውቀትን ይሻል።"' : '"ልበ ጠቢብ ይፈቅድ አእምሮተ።"'}
                   </h3>
                   <p className="text-muted-foreground font-medium">{lang === "en" ? "Proverbs 15:14" : lang === "am" ? "ምሳሌ 15:14" : "ምሳሌ 15:14"}</p>
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
            <h2 className="font-serif text-4xl font-bold text-primary mb-4">
              {lang === "en" ? "The Three Pillars" : lang === "am" ? "ሦስቱ ምሶሶዎች" : "ሠለስቱ አዕማድ"}
            </h2>
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
                <p className="text-muted-foreground leading-relaxed font-serif">
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
            <h2 className="font-serif text-4xl font-bold text-primary">
              {lang === "en" ? "Our Philosophy" : lang === "am" ? "የእኛ ፍልስፍና" : "ሥርዓተ ማኅበርነ"}
            </h2>
            <p className="text-xl text-muted-foreground italic font-light leading-relaxed font-serif">
              {lang === "en" 
                ? '"We believe that the beauty of our ancient faith should be presented with the excellence that modern technology allows. Our commitment is to remain uncompromising in our adherence to Orthodox tradition while being innovative in how we share it with the world."'
                : lang === "am"
                ? '"ጥንታዊው እምነታችን ዘመናዊ ቴክኖሎጂ በሚፈቅደው ብቃት መቅረብ አለበት ብለን እናምናለን። ቃል ኪዳናችን በኦርቶዶክስ ወግ ላይ ሳንደራደር ከዓለም ጋር የምንጋራበት መንገድ ላይ ግን አዳዲስ ፈጠራዎችን መጠቀም ነው።"'
                : '"ንአምን ከመ ትርጓሜ ሃይማኖትነ ይደሉ ይትነገር በጽድቅ።"'
              }
            </p>
            <div className="pt-6">
               <p className="text-primary font-bold uppercase tracking-widest text-sm">— {lang === "en" ? "The Kenean Team" : lang === "am" ? "የቀንአን ቡድን" : "Team Kenean"}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
            <h2 className="font-serif text-4xl md:text-5xl font-bold mb-8">
              {lang === "en" ? "Ready to Start Your Journey?" : lang === "am" ? "ጉዞዎን ለመጀመር ዝግጁ ነዎት?" : "ድልውኑ አንተ?"}
            </h2>
            <p className="text-primary-foreground/70 text-lg max-w-2xl mx-auto mb-12 font-serif">
              {lang === "en"
                ? "Join thousands of learners in exploring the richness of the Orthodox faith today."
                : lang === "am"
                ? "ዛሬ የኦርቶዶክስ እምነትን ብልጽግና በመመርመር በሺዎች የሚቆጠሩ ተማሪዎችን ይቀላቀሉ።"
                : "ተመዝገብ ውስተ ማኅበርነ።"
              }
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <Link
                  href="/register"
                  className="w-full sm:w-auto px-10 py-4 bg-accent text-primary-foreground font-bold rounded-md hover:bg-accent/90 transition-all shadow-xl shadow-black/20"
                >
                  {lang === "en" ? "Create Your Account" : lang === "am" ? "መለያዎን ይፍጠሩ" : "ተመዝገብ"}
                </Link>
                <Link
                  href="/lessons"
                  className="w-full sm:w-auto px-10 py-4 border border-primary-foreground/20 hover:bg-primary-foreground/10 transition-all rounded-md font-medium"
                >
                  {lang === "en" ? "Explore Lessons" : lang === "am" ? "ትምህርቶችን ያስሱ" : "ትምህርት ርኢ"}
                </Link>
            </div>
        </div>
      </section>
    </div>
  );
}
