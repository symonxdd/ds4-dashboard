import React, { useState } from 'react';
import { ExternalLink, ShieldCheck, Tag, Truck, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const SourcingCard = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="p-6 bg-red-500/[0.03] dark:bg-red-500/[0.02] border border-red-500/10 dark:border-red-500/20 rounded-3xl relative overflow-hidden my-6">
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center gap-2 mb-4 relative z-10">
        <div className="p-1.5 rounded-lg bg-red-500/10 text-red-500 dark:text-red-400">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <h4 className="text-sm font-bold uppercase tracking-widest text-red-500 dark:text-red-400">
          Genuine DS4 Buyer's Reference (EU)
        </h4>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-3 mb-5 relative z-10">
        <div className="p-3 bg-white/50 dark:bg-neutral-900/50 border border-neutral-200/40 dark:border-neutral-800/40 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center gap-1 text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
            <Tag className="w-3 h-3 text-neutral-400" />
            <span>Unit Price</span>
          </div>
          <span className="text-[15px] font-extrabold text-foreground leading-none">
            89,99 €
          </span>
        </div>

        <div className="p-3 bg-white/50 dark:bg-neutral-900/50 border border-neutral-200/40 dark:border-neutral-800/40 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center gap-1 text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
            <Truck className="w-3 h-3 text-neutral-400" />
            <span>Shipping</span>
          </div>
          <span className="text-[14px] font-extrabold text-foreground leading-none">
            7,92 € <span className="text-[9px] font-medium text-muted-foreground uppercase tracking-tighter">DE ➔ BE</span>
          </span>
        </div>

        <div className="p-3 bg-white/50 dark:bg-neutral-900/50 border border-neutral-200/40 dark:border-neutral-800/40 rounded-2xl flex flex-col justify-between">
          <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
            Total Cost
          </span>
          <span className="text-[15px] font-extrabold text-red-500 dark:text-red-400 leading-none">
            97,91 €
          </span>
        </div>

        <div className="p-3 bg-white/50 dark:bg-neutral-900/50 border border-neutral-200/40 dark:border-neutral-800/40 rounded-2xl flex flex-col justify-between">
          <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
            Condition
          </span>
          <span className="text-[13px] font-bold text-emerald-500 dark:text-emerald-400 leading-none flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Brand new
          </span>
        </div>
      </div>

      {/* Button & Expandable Disclaimer */}
      <div className="flex flex-col gap-4 pt-3 border-t border-neutral-200/30 dark:border-neutral-800/30 relative z-10">
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className="group/note p-2.5 -m-2.5 rounded-2xl hover:bg-neutral-500/5 transition-colors !cursor-pointer select-none"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] md:text-[12px] font-semibold text-neutral-400 dark:text-neutral-500 transition-colors group-hover/note:text-foreground">
              Independent note
            </span>
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="text-neutral-400 group-hover/note:text-foreground shrink-0"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </motion.div>
          </div>

          <AnimatePresence initial={false}>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0, marginTop: 0 }}
                animate={{ height: 'auto', opacity: 1, marginTop: 8 }}
                exit={{ height: 0, opacity: 0, marginTop: 0 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="overflow-hidden text-[11px] md:text-[12px] text-muted-foreground leading-relaxed font-medium"
              >
                I am not affiliated with Sony or the Amazon seller. Recommending this listing solely to help EU gamers find original DualShock 4 controllers in a market flooded with replica clones and refurb scams.
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <a
          href="https://www.amazon.de/dp/B01M4KLNE6"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 text-xs font-bold text-white bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 rounded-xl transition-all duration-300 shadow-[0_4px_12px_rgba(239,68,68,0.2)] dark:shadow-none select-none !cursor-pointer"
        >
          <span>View on Amazon.de</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
};
