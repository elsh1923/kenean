import Link from "next/link";
import { BookOpen } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-secondary/30 mt-auto border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="bg-primary text-primary-foreground p-1.5 rounded-md">
                <BookOpen className="h-5 w-5" />
              </div>
              <span className="font-serif text-lg font-bold text-primary">
                Kenean
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Preserving and sharing the timeless wisdom of the Orthodox Christian faith through structured learning and community.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-serif font-semibold text-primary mb-4">Learn</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/lessons" className="hover:text-accent transition-colors">All Lessons</Link></li>
              <li><Link href="/categories/theology" className="hover:text-accent transition-colors">Theology</Link></li>
              <li><Link href="/categories/history" className="hover:text-accent transition-colors">Church History</Link></li>
              <li><Link href="/categories/saints" className="hover:text-accent transition-colors">Lives of Saints</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-serif font-semibold text-primary mb-4">Community</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/questions" className="hover:text-accent transition-colors">Q&A</Link></li>
              <li><Link href="/register" className="hover:text-accent transition-colors">Join Us</Link></li>
              <li><Link href="/about" className="hover:text-accent transition-colors">About Kenean</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-serif font-semibold text-primary mb-4">Contact</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Have questions or feedback?
            </p>
            <a href="mailto:contact@kenean.com" className="text-sm font-medium text-primary hover:text-accent transition-colors">
              contact@kenean.com
            </a>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Kenean Orthodox Learning Hub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
