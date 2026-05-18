import React from 'react';
import { Heart } from 'lucide-react';

export const Footer = () => {
  return (
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
  );
};
