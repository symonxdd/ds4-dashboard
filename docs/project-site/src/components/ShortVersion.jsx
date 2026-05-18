'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, ExternalLink, Check } from 'lucide-react';
import { AnalogStick } from './AnalogStick';
import { GoogleAIOverview } from './GoogleAIOverview';
import { SourcingCard } from './SourcingCard';

export const ShortVersion = () => {
  const [hoverMagma, setHoverMagma] = useState(false);
  const [activeAngle, setActiveAngle] = useState('front');

  const controllerImages = {
    front: '/ds4-front.jpg',
    side: '/ds4-side.jpg',
    top: '/ds4-top.jpg'
  };

  return (
    <motion.div
      key="short-motivation"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.25 }}
      className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start"
    >
      <div className="lg:col-span-8 space-y-6">
        <div className="space-y-6 text-[15px] md:text-[17px] text-muted-foreground leading-relaxed font-sans">
          <p>
            I had long wanted to play <em>Rocket League</em> as it was meant to be played and to start learning advanced mechanics like tornado spins, air dribbles, and air rolls (tasks far easier on a controller than on keyboard and mouse).
          </p>

          <div>
            This project began when I finally bought my first brand-new DualShock 4 controller, the{' '}
            <span
              className="relative inline-block font-semibold group/magma cursor-default"
              onMouseEnter={() => setHoverMagma(true)}
              onMouseLeave={() => setHoverMagma(false)}
            >
              <span className="relative inline-block border-b-2 border-dotted border-red-500/60 dark:border-red-400/60 group-hover/magma:border-transparent transition-colors duration-300">
                <span className="text-red-500 dark:text-red-400 transition-colors duration-300">
                  Red Magma V2
                </span>
                <span className="absolute inset-0 text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500 opacity-0 group-hover/magma:opacity-100 transition-opacity duration-300 pointer-events-none select-none">
                  Red Magma V2
                </span>
              </span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-red-500 to-orange-500 group-hover/magma:w-full transition-all duration-300 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />

              <AnimatePresence>
                {hoverMagma && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 12 }}
                    transition={{ duration: 0.2 }}
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 z-30 p-3 bg-white/95 dark:bg-neutral-900/95 border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-xl dark:shadow-2xl w-60 select-none"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="absolute top-full left-0 right-0 h-4 bg-transparent pointer-events-auto" />

                    <div className="relative h-32 w-full bg-neutral-100 dark:bg-neutral-950 rounded-2xl overflow-hidden border border-neutral-200/80 dark:border-neutral-800/80 flex items-center justify-center group/img">
                      <img
                        src={controllerImages[activeAngle]}
                        alt={`DualShock 4 V2 - ${activeAngle} view`}
                        className="absolute inset-0 h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />

                      <div className="absolute inset-0 bg-gradient-to-br from-red-500/15 dark:from-red-600/35 to-neutral-200/20 dark:to-neutral-950 flex flex-col justify-between p-3 select-none -z-10">
                        <span className="text-[10px] font-bold text-red-500 dark:text-red-400 uppercase tracking-widest leading-none">DualShock 4 V2</span>
                        <span className="text-[11px] font-bold text-neutral-800 dark:text-white uppercase tracking-wider leading-none">Red Magma</span>
                      </div>

                      <div className="absolute top-2 left-2 bg-white/80 dark:bg-black/60 backdrop-blur-md text-[9px] font-extrabold text-red-500 dark:text-red-400 px-2.5 py-1 rounded-full border border-red-500/20 uppercase tracking-widest flex items-center justify-center leading-none select-none">
                        Red Magma V2
                      </div>
                    </div>

                    <div className="flex gap-1.5 mt-3 justify-center">
                      {['front', 'side', 'top'].map((angle) => {
                        const isActive = activeAngle === angle;
                        return (
                          <button
                            key={angle}
                            onClick={() => setActiveAngle(angle)}
                            onMouseEnter={() => setActiveAngle(angle)}
                            className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-default relative overflow-hidden select-none ${isActive
                              ? 'text-neutral-900 dark:text-white'
                              : 'text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
                              }`}
                          >
                            {isActive && (
                              <motion.span
                                layoutId="active-angle-pill-short"
                                className="absolute inset-0 bg-red-500/10 dark:bg-red-500/20 border border-red-500/10 dark:border-red-500/30 rounded-lg -z-10"
                                transition={{ type: "spring", stiffness: 380, damping: 30 }}
                              />
                            )}
                            {angle}
                          </button>
                        );
                      })}
                    </div>

                    <div className="border-t border-neutral-200/50 dark:border-neutral-800/50 my-2.5" />

                    <a
                      href="https://www.amazon.de/dp/B01M4KLNE6"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 py-1.5 px-3 text-[10px] font-bold text-neutral-500 hover:text-red-500 dark:text-neutral-400 dark:hover:text-red-400 bg-neutral-50 dark:bg-neutral-950 hover:bg-red-500/5 dark:hover:bg-red-500/10 border border-neutral-200/50 dark:border-neutral-800/50 rounded-xl transition-all duration-200 group/amazon select-none !cursor-pointer"
                    >
                      <span>Amazon.de listing</span>
                      <ExternalLink className="w-3 h-3 text-neutral-400 group-hover/amazon:text-red-500 dark:group-hover/amazon:text-red-400 transition-colors" />
                    </a>
                  </motion.div>
                )}
              </AnimatePresence>
            </span>{' '}
            edition, at the end of March 2026. I specifically aimed to purchase the V2 variant so that I could play competitively without any input lag worries, though Bluetooth has worked very well in my personal experience. The fact that the V2 allows simultaneous data transfer and charging over USB was exactly what I wanted. Additionally, the V2 features a very clean, minimalist lightbar strip built right into the touchpad, which looks absolutely gorgeous.
          </div>

          <h3 className="text-[20px] font-bold text-foreground pt-4">Connecting to PC</h3>

          <p>
            Since I play on PC, I initially thought I needed a tool like DS4Windows just to connect the controller. However, I quickly discovered that this wasn't necessary at all. Modern Windows (Windows 11 on my setup) supports the DualShock 4 out of the box, and for any connection issues in games, Steam has a built-in feature called Steam Input that acts as an excellent compatibility driver layer. The connection itself was solved; I simply needed a reliable way to check my battery on PC.
          </p>

          <h3 className="text-[20px] font-bold text-foreground pt-4">Forks & Archives</h3>

          <p>
            While searching for dedicated battery tools, I realized that most software was either outdated or archived. The commonly recommended tool, DS4Windows, had been forked multiple times over the years. Some of these major historical forks (such as <a href="https://github.com/jays2kings/ds4windows" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground underline decoration-muted-foreground/45 hover:decoration-foreground underline-offset-4 font-semibold transition-all duration-200">Jays2Kings</a>, archived October 24, 2021, and <a href="https://github.com/schmaldeo/DS4Windows" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground underline decoration-muted-foreground/45 hover:decoration-foreground underline-offset-4 font-semibold transition-all duration-200">Schmaldeo</a>, archived March 5, 2026) were highly trustworthy during their active periods, but are no longer maintained.
          </p>

          <p>
            In fact, I couldn't find a single native Windows tool dedicated strictly to displaying the controller's battery level. The only alternative I discovered was a web-based tool, <a href="https://thebitlink.github.io/WebHID-DS4/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground underline decoration-muted-foreground/45 hover:decoration-foreground underline-offset-4 font-semibold transition-all duration-200">WebHID-DS4</a>. While it works well, it is browser-bound, buggy over Bluetooth connection, and Chromium's WebHID API requires explicit pairing permission from the user every single time the page connects.
          </p>

          <h4 className="text-[17px] md:text-[18px] font-bold text-foreground pt-4">Generative Search & Malicious SEO</h4>

          <p>
            Relying on AI-generated summaries or Google’s “AI Overview” to find solutions can be highly misleading. For instance, a recent AI-powered search output falsely claimed that long-archived, outdated forks of DS4Windows were still active, directing users to dangerous destinations:
          </p>

          <GoogleAIOverview />

          <h3 className="text-[20px] font-bold text-foreground pt-4">Building a Custom Solution</h3>

          <p>
            Knowing that these forks had been officially archived, I decided not to deal with outdated or unmaintained codebases. Instead, I wanted to build a clean, minimal project dedicated strictly to my own requirements: reliably monitoring battery level and eventually implementing lightbar customization.
          </p>

          <div className="p-6 bg-blue-500/[0.04] border border-blue-500/10 rounded-3xl relative my-6">
            {/* Contained Decorative Blur */}
            <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl" />
            </div>
            <div className="flex gap-4 items-start relative z-10">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500 shrink-0 mt-0.5">
                <Cpu className="w-5 h-5" />
              </div>
              <p className="text-sm md:text-base text-foreground font-normal leading-relaxed">
                By selecting Rust and Tauri for the core architecture, I ensured the dashboard runs with an exceptionally low memory and CPU footprint, delivering a lightweight, highly responsive control center for custom lightbar and battery monitoring.{' '}
                <span className="relative inline font-medium border-b border-dashed border-neutral-300 dark:border-neutral-700 group/ai cursor-default transition-colors hover:border-neutral-400 dark:hover:border-neutral-500">
                  At its heart, it is a tool born from a pursuit of pure simplicity: honed to execute its core objectives flawlessly.
                  <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-neutral-900 text-white text-xs px-3 py-2.5 rounded-xl shadow-xl opacity-0 group-hover/ai:opacity-100 transition-opacity duration-200 pointer-events-none w-[200px] sm:w-[240px] z-20 font-sans normal-case text-center leading-snug font-medium flex flex-col items-center gap-2">
                    <span className="flex items-center gap-1 text-[11px] font-bold text-green-400 uppercase tracking-wider">
                      <Check className="w-3 h-3 stroke-[3.5] shrink-0" />
                      100% Organic Human Text
                    </span>
                    <img
                      src="/sweating-gif.gif"
                      alt="Sweating Meme"
                      className="w-full h-auto rounded-lg border border-neutral-800 dark:border-neutral-800 shadow-inner object-cover"
                    />
                  </span>
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-4 space-y-6">
        <AnalogStick />

        <div className="bg-foreground/[0.02] dark:bg-foreground/[0.01] rounded-3xl p-6 border border-foreground/10 space-y-4 relative overflow-hidden group">
          <div className="absolute -top-12 -left-12 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
          <h3 className="text-xs font-bold uppercase tracking-widest text-blue-500 dark:text-blue-400">The Core Purpose</h3>
          <p className="text-[15px] md:text-[16px] font-medium text-muted-foreground leading-relaxed font-sans">
            A reliable way to check my DS4 controller's battery on PC.
          </p>
        </div>

        <SourcingCard />
      </div>
    </motion.div>
  );
};
