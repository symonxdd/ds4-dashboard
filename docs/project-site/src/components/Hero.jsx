'use client';

import { useLatestRelease } from '../hooks/useLatestRelease';
import { Download, ShieldCheck } from 'lucide-react';
import { SiGithub } from 'react-icons/si';

export default function Hero() {
  const { downloadUrl, version, isLoading } = useLatestRelease();

  return (
    <section id="home" className="relative overflow-hidden pt-12 pb-16 md:pt-16 md:pb-24 lg:pt-24 lg:pb-32">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-6xl -z-10 opacity-30 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[10%] right-[-5%] w-[35%] h-[35%] bg-indigo-700 rounded-full blur-[100px]"></div>
      </div>

      <div className="container mx-auto px-6 text-center">
        <div className="h-14 mb-4 flex items-center justify-center">
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
            <ShieldCheck size={16} />
            <span>Latest version: {version}</span>
          </div>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/60 leading-tight">
          Your controller,<br className="hidden md:block" />your rules
        </h1>

        <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed">
          Open-source battery monitor and lightbar customizer for DualShock 4.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href={downloadUrl}
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center justify-center gap-2 transition-all transform active:scale-95 shadow-lg shadow-blue-600/25 cursor-default"
          >
            <Download size={20} />
            Download for Windows
          </a>
          <a
            href="https://github.com/symonxdd/ds4-dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-foreground/5 hover:bg-foreground/10 border border-foreground/10 text-foreground font-semibold flex items-center justify-center gap-2 transition-all backdrop-blur-sm cursor-default"
          >
            <SiGithub size={20} />
            Source Code
          </a>
        </div>

        {/* Hero Image Mockup */}
        <div className="mt-16 md:mt-24 relative max-w-5xl mx-auto group">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 blur opacity-15 group-hover:opacity-25 transition duration-1000"></div>
          <div className="relative border border-foreground/[0.03] dark:border-foreground/10 overflow-hidden shadow-2xl bg-background">
            <img
              src="/screens/light/main.png"
              alt="DS4 Dashboard Interface"
              className="w-full h-auto show-light"
            />
            <img
              src="/screens/dark/main.png"
              alt="DS4 Dashboard Interface"
              className="w-full h-auto show-dark"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
