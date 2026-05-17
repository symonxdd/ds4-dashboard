'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Gamepad2 } from 'lucide-react';

export const AnalogStick = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-foreground/[0.02] dark:bg-foreground/[0.01] rounded-3xl border border-foreground/10 space-y-4 select-none relative overflow-hidden group">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />

      <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest relative z-10 flex items-center gap-1.5">
        <Gamepad2 className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
        Air Roll Trainer
      </div>

      <motion.div
        className="relative w-28 h-28 rounded-full bg-neutral-900 dark:bg-neutral-950 border-4 border-neutral-800 dark:border-neutral-900 flex items-center justify-center shadow-2xl relative z-10"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ scale: 1.04 }}
      >
        <div className="absolute inset-1 rounded-full bg-gradient-to-br from-neutral-800 to-neutral-950 dark:from-neutral-900 dark:to-neutral-950 border border-neutral-800 dark:border-neutral-900" />
        
        <motion.div
          className="w-16 h-16 rounded-full bg-neutral-800 dark:bg-neutral-900 shadow-xl border border-neutral-700 dark:border-neutral-800 flex items-center justify-center relative shadow-[inset_0_2px_4px_rgba(255,255,255,0.1)]"
          animate={isHovered ? {
            x: [0, 10, 5, -10, -5, 0],
            y: [0, -5, 10, 0, -10, 0],
            rotate: [0, 90, 180, 270, 360],
          } : {
            x: 0,
            y: 0,
            rotate: 0,
          }}
          transition={isHovered ? {
            repeat: Infinity,
            duration: 2.2,
            ease: "easeInOut",
          } : {
            type: "spring",
            stiffness: 300,
            damping: 18
          }}
        >
          <div className="absolute inset-0 rounded-full border border-dashed border-neutral-600/30 m-2.5" />
          <div className="w-5 h-5 rounded-full bg-neutral-950 shadow-inner flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]" />
          </div>

          <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1 h-1.5 bg-neutral-600/40 rounded-full" />
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1.5 bg-neutral-600/40 rounded-full" />
          <div className="absolute left-1 top-1/2 -translate-y-1/2 h-1 w-1.5 bg-neutral-600/40 rounded-full" />
          <div className="absolute right-1 top-1/2 -translate-y-1/2 h-1 w-1.5 bg-neutral-600/40 rounded-full" />
        </motion.div>
      </motion.div>

      <div className="text-[11px] text-muted-foreground text-center relative z-10">
        {isHovered ? (
          <span className="text-blue-500 font-semibold animate-pulse">Simulating Tornado Spin...</span>
        ) : (
          <span>Hover stick to simulate <span className="font-semibold text-foreground">Advanced Air Rolls</span></span>
        )}
      </div>
    </div>
  );
};
