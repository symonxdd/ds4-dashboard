'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { ShortVersion } from './ShortVersion';
import { LongVersion } from './LongVersion';

export const Motivation = () => {
  const [activeTab, setActiveTab] = useState('short');

  return (
    <section id="motivation" className="py-24 bg-background scroll-mt-16 overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-foreground">Motivation</h2>
            <div className="h-1.5 w-12 bg-blue-600 mx-auto rounded-full mb-8" />
          </motion.div>

          <div className="flex justify-center mb-16">
            <div className="inline-flex p-1 bg-foreground/[0.04] dark:bg-foreground/[0.02] border border-foreground/[0.08] rounded-full relative shadow-sm">
              <button
                onClick={() => setActiveTab('short')}
                className={`px-6 py-2 text-xs md:text-sm font-bold rounded-full relative z-10 transition-colors duration-300 cursor-default ${
                  activeTab === 'short' ? 'text-white' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Overview
                {activeTab === 'short' && (
                  <motion.div
                    layoutId="active-motivation-tab"
                    className="absolute inset-0 bg-blue-600 rounded-full -z-10"
                    transition={{ type: "spring", stiffness: 350, damping: 26 }}
                  />
                )}
              </button>
              <button
                onClick={() => setActiveTab('long')}
                className={`px-6 py-2 text-xs md:text-sm font-bold rounded-full relative z-10 transition-colors duration-300 cursor-default ${
                  activeTab === 'long' ? 'text-white' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                The Long(er) Read
                {activeTab === 'long' && (
                  <motion.div
                    layoutId="active-motivation-tab"
                    className="absolute inset-0 bg-blue-600 rounded-full -z-10"
                    transition={{ type: "spring", stiffness: 350, damping: 26 }}
                  />
                )}
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'short' ? (
              <ShortVersion />
            ) : (
              <LongVersion />
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};
