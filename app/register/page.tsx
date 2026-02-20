import { RegisterForm } from "@/components/auth/register-form";
import Image from "next/image";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { getServerLanguage, getServerDict } from "@/lib/i18n-server";

export default async function RegisterPage() {
  const lang = await getServerLanguage();
  const dict = await getServerDict();

  return (
    <main className="min-h-screen relative flex items-center justify-center py-12 px-4 overflow-hidden bg-background">
      {/* Background with texture/image overlay matching home page hero */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1541963463532-d68292c34b19?q=80&w=2070&auto=format&fit=crop"
          alt="Ancient Orthodox Script"
          fill
          className="object-cover opacity-5 dark:opacity-20 translate-y-[-10%]"
          priority
        />
        {/* Subtle gradient overlays that adapt to theme */}
        <div className="absolute inset-0 bg-gradient-to-tr from-background via-background/95 to-background/80" />
        
        {/* Decorative glows */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
           <div className="absolute top-1/4 -left-20 w-96 h-96 bg-accent/5 dark:bg-accent/10 rounded-full blur-[120px]" />
           <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-primary/5 dark:bg-accent/5 rounded-full blur-[120px]" />
        </div>
      </div>

      <div className="relative z-10 w-full max-w-xl animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2 mb-6 group">
            <div className="p-2.5 bg-primary text-primary-foreground rounded-lg group-hover:bg-accent group-hover:text-accent-foreground transition-all duration-300 shadow-lg shadow-primary/20 dark:shadow-none">
              <BookOpen className="w-6 h-6" />
            </div>
            <span className="font-serif text-2xl font-bold text-primary tracking-tight transition-colors">Kenean</span>
          </Link>
          
          <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 tracking-tight leading-tight">
            {(dict as any).auth.joinCommunity}<span className="text-accent">.</span>
          </h1>
          <p className="text-muted-foreground max-w-sm mx-auto font-light text-lg font-serif">
            {(dict as any).auth.registerSubtitle}
          </p>
        </div>

        <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl overflow-hidden shadow-black/[0.05] dark:shadow-black/50">
          <div className="p-6 md:p-10">
            <RegisterForm />
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-[10px] text-muted-foreground/50 uppercase tracking-[0.3em] font-medium font-serif">
            {lang === "en" ? "Orthodox Christian Learning Hub" : lang === "am" ? "የኦርቶዶክስ ክርስቲያን መማሪያ ማዕከል" : "ማዕከለ ጥበብ ዘክርስቲያን"} © {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </main>
  );
}
