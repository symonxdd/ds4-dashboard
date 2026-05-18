'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ShieldAlert, Image, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const GoogleAIOverview = () => {
  const [showProof, setShowProof] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      className="bg-[#f8f9fa] dark:bg-neutral-900/45 rounded-3xl p-6 border border-neutral-200/80 dark:border-neutral-800/80 shadow-md relative space-y-4 my-8 font-sans"
      style={{
        backgroundImage: 'radial-gradient(circle 240px at 0% 0%, rgba(168, 85, 247, 0.08), transparent), radial-gradient(circle 240px at 100% 100%, rgba(59, 130, 246, 0.08), transparent)'
      }}
    >

      <div className="flex items-center justify-between relative z-10 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <span className="text-blue-500 dark:text-blue-400">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C12 2 12.5 7.5 18 12C12.5 16.5 12 22 12 22C12 22 11.5 16.5 6 12C11.5 7.5 12 2 12 2Z" />
            </svg>
          </span>
          <span className="text-base font-bold text-neutral-800 dark:text-neutral-200">
            AI Overview
          </span>
        </div>

        <button
          onClick={() => setShowProof(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-semibold rounded-full border border-blue-500/10 transition-all cursor-default z-10 select-none"
        >
          <Image className="w-3.5 h-3.5" />
          View Original Screenshot
        </button>
      </div>

      <div className="text-[13px] md:text-[15px] text-neutral-800 dark:text-neutral-200 leading-relaxed relative z-10 font-sans">
        “For the safest and most updated experience, the community generally centralizes distribution through the{' '}
        <span className="relative inline px-1 font-semibold text-red-600 dark:text-red-400 bg-red-500/10 rounded border-b-2 border-red-500 border-dashed group cursor-default">
          Official DS4Windows Website
          <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-red-600 text-white text-xs px-3 py-1.5 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20 font-sans font-medium w-[220px] sm:w-[280px] md:w-auto whitespace-normal sm:whitespace-nowrap text-center leading-normal">
            🚨 <span className="font-extrabold uppercase tracking-wider">DANGER</span>: Links directly to ds4-windows.com (malicious website)
          </span>
        </span>
        , which provides archived releases of Ryochan7's build{' '}
        <span className="relative inline px-1 font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 rounded border-b-2 border-amber-500 border-dashed group cursor-default">
          as well as active links to the Schmaldeo fork.
          <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-amber-600 text-white text-xs px-3 py-1.5 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20 font-sans font-medium w-[220px] sm:w-[280px] md:w-auto whitespace-normal sm:whitespace-nowrap text-center leading-normal">
            ⚠️ <span className="font-extrabold uppercase tracking-wider">FALSE</span>: The malicious site contains no links to Schmaldeo's fork
          </span>
        </span>
        ”
      </div>

      <div className="border-t border-neutral-200 dark:border-neutral-800/80 pt-3 relative z-10">
        <span className="relative inline-block text-xs text-neutral-500 dark:text-neutral-400 bg-neutral-200/20 dark:bg-neutral-800/30 px-2 py-0.5 rounded border-b border-dashed border-neutral-400 dark:border-neutral-600 group/footer cursor-default font-sans leading-none">
          AI responses may include mistakes.
          <span className="absolute bottom-full mb-2 left-0 bg-neutral-800 text-white text-xs px-3 py-1.5 rounded-xl shadow-xl opacity-0 group-hover/footer:opacity-100 transition-opacity duration-200 pointer-events-none w-64 z-20 font-sans normal-case leading-snug font-medium">
            💡 Google places this disclaimer in fine print at the very bottom of summaries, meaning readers can easily overlook the risk.
          </span>
        </span>
      </div>

      <div className="bg-red-500/5 dark:bg-red-500/10 border border-red-500/20 dark:border-red-500/30 rounded-2xl p-4 flex gap-3.5 items-start relative z-10">
        <div className="p-2 rounded-xl bg-red-500/10 text-red-500 shrink-0">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <div className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">
            Generative Output Fact-Check
          </div>
          <div className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed font-medium">
            Google's AI algorithm blindly crawled and indexed false statements from the malicious website's pages, treating them as search facts. This demonstrates why users must verify sources manually rather than trusting automated summaries.
          </div>
        </div>
      </div>

      {mounted && typeof window !== 'undefined' && createPortal(
        <AnimatePresence>
          {showProof && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto"
              onClick={() => setShowProof(false)}
            >
              <motion.div
                initial={{ scale: 0.95, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 15 }}
                transition={{ type: "spring", duration: 0.4 }}
                className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl relative my-8"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                    <Image className="w-4 h-4 text-blue-500" />
                    Original Screenshot Proof
                  </span>
                  <button
                    onClick={() => setShowProof(false)}
                    className="p-1 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white cursor-default transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-6 bg-neutral-950 flex justify-center overflow-auto max-h-[70vh]">
                  <img
                    src="/screens/ai-overview-false-claim-ds4windows.png"
                    alt="Original Screenshot Proof of False Claim"
                    className="rounded-2xl border border-neutral-800 max-w-full h-auto"
                  />
                </div>

                <div className="px-6 py-4 bg-neutral-900 border-t border-neutral-800 text-[11px] text-muted-foreground text-center">
                  Original capture of the Google AI Overview showing the redirection and fake claims.
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};
