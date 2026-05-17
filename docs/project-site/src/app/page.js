import Hero from '../components/Hero';
import FeatureGrid from '../components/FeatureGrid';
import Showcase from '../components/Showcase';
import { Motivation } from '../components/Motivation';
import { Header } from '../components/Header';
import { ShieldAlert, ExternalLink, Heart } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-blue-500/30 pt-16">
      <Header />

      <Hero />
      <FeatureGrid />
      <Showcase />
      <Motivation />

      {/* SmartScreen Section */}
      <section id="smartscreen" className="py-24 bg-blue-500/[0.03]">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto rounded-3xl p-8 md:p-12 border border-blue-500/20 bg-blue-500/[0.02] backdrop-blur-sm">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="w-16 h-16 shrink-0 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                <ShieldAlert size={32} />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-4">"Windows protected the PC"?</h2>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  When running the DS4 Dashboard installer for the first time, you might see a Windows SmartScreen warning.
                  This is normal for new open-source software that hasn't built a "reputation" with Microsoft yet.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-foreground/[0.03] border border-foreground/[0.08]">
                    <h4 className="font-bold mb-2 text-sm text-muted-foreground">How to run</h4>
                    <p className="text-sm text-muted-foreground">Click <strong>"More Info"</strong> and then <strong>"Run anyway"</strong>.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-foreground/[0.03] border border-foreground/[0.08]">
                    <h4 className="font-bold mb-2 text-sm text-muted-foreground">Why the warning?</h4>
                    <p className="text-sm text-muted-foreground">Certificates cost hundreds of dollars per year. The focus remains on keeping this tool free and open-source.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-foreground/5 text-center">
        <div className="container mx-auto px-6 text-muted-foreground text-sm">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-3 mb-4">
            <span className="flex items-center gap-1">
              Made with <Heart size={14} className="text-fuchsia-500 fill-fuchsia-500" /> by{' '}
              <a 
                href="https://symon.me/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-muted-foreground hover:text-foreground underline decoration-muted-foreground/20 hover:decoration-foreground transition-all duration-200 hover:!cursor-pointer"
              >
                Symon
              </a>
            </span>
            <span className="hidden sm:inline text-muted-foreground/20">•</span>
            <span>
              Hosted on{' '}
              <a 
                href="https://vercel.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-muted-foreground hover:text-foreground underline decoration-muted-foreground/20 hover:decoration-foreground transition-all duration-200 hover:!cursor-pointer"
              >
                Vercel
              </a>{' '}
              (for free!)
            </span>
          </div>
          <p className="text-xs text-muted-foreground/40 mt-2">Not affiliated with Sony or PlayStation.</p>
        </div>
      </footer>
    </main>
  );
}
