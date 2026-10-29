import { ArrowLeft } from "lucide-react";
import LegalContent, { legalTitles, type LegalDocument } from "@/components/LegalContent";
import { Button } from "@/components/ui/button";

export default function LegalPage({ document }: { document: LegalDocument }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 bg-background border-b border-border pt-safe-compact pb-3 px-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Button asChild variant="secondary" size="icon"><a href="/" aria-label="Back to KejaSure"><ArrowLeft /></a></Button>
          <span className="font-bold">KejaSure</span>
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-5 py-6 pb-32 space-y-6">
        <h1 className="text-2xl font-bold">{legalTitles[document]}</h1>
        <LegalContent document={document} />
        <nav aria-label="Legal pages" className="flex flex-wrap gap-3 border-t border-border pt-5">
          <Button asChild variant="link" className="px-0"><a href="/privacy">Privacy Policy</a></Button>
          <Button asChild variant="link" className="px-0"><a href="/terms">Terms of Use</a></Button>
          <Button asChild variant="link" className="px-0"><a href="/delete-account">Delete Account</a></Button>
        </nav>
      </main>
    </div>
  );
}