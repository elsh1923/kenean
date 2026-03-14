"use client";

import { useEffect, useState } from "react";
import { FileText, Loader2, Share2, Maximize } from "lucide-react";

export function PdfViewer({ url, lang = "en" }: { url: string; lang?: string }) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchPdf() {
      try {
        setLoading(true);
        // Fetch the PDF from Cloudinary URL over XHR
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch PDF");
        
        // Strip out the attachment header behavior by explicitly creating it as application/pdf blob
        const arrayBuffer = await res.arrayBuffer();
        const pdfBlob = new Blob([arrayBuffer], { type: "application/pdf" });
        
        // Generate a local blob URL for the browser to consume inline instead of downloading
        const objectUrl = URL.createObjectURL(pdfBlob);
        setBlobUrl(objectUrl);
      } catch (err) {
        console.error("PDF load error:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    
    fetchPdf();

    // Cleanup object URL
    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [url]);

  if (loading) {
    return (
      <div className="w-full h-[85vh] md:h-[90vh] flex flex-col items-center justify-center bg-zinc-900 border border-border rounded-xl shadow-inner text-white">
        <Loader2 className="w-12 h-12 animate-spin text-accent mb-6" />
        <p className="text-xl font-serif">{lang === "en" ? "Loading PDF Document..." : lang === "am" ? "የፒዲኤፍ ሰነድ በመጫን ላይ..." : "በመጫን ላይ..."}</p>
        <p className="text-zinc-500 text-sm mt-3">{lang === "en" ? "This may take a moment for large files." : "ለትላልቅ ፋይሎች ትንሽ ጊዜ ሊወስድ ይችላል።"}</p>
      </div>
    );
  }

  if (error || !blobUrl) {
    return (
      <div className="w-full h-[70vh] flex flex-col items-center justify-center bg-zinc-900 rounded-xl text-zinc-400 p-8 text-center border border-zinc-800 shadow-xl">
        <FileText className="w-20 h-20 opacity-30 mb-6 text-accent" />
        <h3 className="text-2xl font-bold text-white mb-4">
          {lang === "en" ? "Failed to load inline PDF" : lang === "am" ? "ፒዲኤፍ ማሳየት አልተቻለም" : "አልተቻለም"}
        </h3>
        <p className="mb-8 max-w-sm leading-relaxed">
          {lang === "en" ? "Browser cross-origin restrictions or network errors prevented the PDF from loading. You can still download it." : "በአውታረ መረብ ችግር ወይም በብሮውዘር ክልከላ ምክንያት ፒዲኤፉ አልተጫነም።"}
        </p>
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="px-8 py-4 bg-accent text-accent-foreground font-bold rounded-xl hover:bg-accent/90 hover:scale-105 transition-all shadow-lg flex items-center gap-3"
        >
          {lang === "en" ? "Download / View PDF Externally" : "በምትኩ ፒዲኤፍ አውርድ"}
        </a>
      </div>
    );
  }

  return (
    <div className="relative w-full bg-zinc-100 flex flex-col h-[85vh] md:h-[90vh] rounded-2xl overflow-hidden shadow-2xl border border-zinc-800">
      <iframe
        src={`${blobUrl}#toolbar=1&navpanes=0&scrollbar=1&zoom=100`}
        title="PDF Document Viewer"
        className="w-full h-full flex-1 border-0"
        allowFullScreen
      ></iframe>
      
      {/* Fallback floating button for external viewing */}
      <div className="absolute top-4 right-6 pointer-events-none flex justify-end">
         <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="pointer-events-auto bg-black/85 hover:bg-black text-white px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2.5 transition-all shadow-xl border border-white/20 backdrop-blur-md"
         >
           <Maximize className="w-4 h-4" />
           {lang === "en" ? "Pop out / Download" : lang === "am" ? "በትልቁ ማሳያ / አውርድ" : "በትልቁ ማሳያ"}
         </a>
      </div>
    </div>
  );
}
