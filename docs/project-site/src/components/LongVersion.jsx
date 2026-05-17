'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, ExternalLink } from 'lucide-react';
import { CloneAuditPanel } from './CloneAuditPanel';
import { GoogleAIOverview } from './GoogleAIOverview';
import { SourcingCard } from './SourcingCard';

export const LongVersion = () => {
  const [hoverMagma, setHoverMagma] = useState(false);
  const [activeAngle, setActiveAngle] = useState('front');

  const controllerImages = {
    front: '/ds4-front.jpg',
    side: '/ds4-side.jpg',
    top: '/ds4-top.jpg'
  };

  return (
    <motion.div
      key="long-motivation"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.25 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      <div className="space-y-6 text-[15px] md:text-[17px] text-muted-foreground leading-relaxed font-sans">
        <p>
          It all began when I finally purchased a brand-new DualShock 4 controller, a surprisingly difficult task at a reasonable price, since Sony no longer produces them and the DualSense is now their latest model. I specifically avoided buying a DualSense, as it felt too bulky for my relatively small hands. I bought the controller at the end of March 2026. My goal was to play one of my favorite games, <em>Rocket League</em>, as it was meant to be played, and to finally start learning advanced mechanics such as tornado spins, air dribbles, and mastering air rolls.
        </p>

        <p>
          Before securing this unit, I went down a long rabbit hole of online sourcing. I originally set my heart on a White edition and ordered a "refurbished" controller from Fnac, only to cancel it after waiting an entire month with no sign of delivery. Next, I tried to purchase a seemingly "new" white controller from Amazon UK, but upon arrival, something felt immediately off; the structural spacing around the EXT port was uneven, suggesting it had been opened or was a cloned replica. Seeking a genuine, factory-sealed option at the best price, I expanded my search and found the original Red Magma V2 listing on Amazon Germany. Shipped directly from Germany to Belgium, it arrived in perfect condition and was absolutely worth the hunt.
        </p>

        <SourcingCard />

        <p>
          Since I play on PC, I initially thought I needed a tool like DS4Windows just to be able to connect the controller to my setup. However, I quickly discovered that this wasn't necessary at all. Modern Windows (Windows 11 in my case) has out-of-the-box support for the DualShock 4, and even if I ran into connection or compatibility issues with specific games, Steam has a built-in feature called Steam Input that acts as a perfect driver and compatibility layer. The actual connection itself was solved; I simply needed a way to check the battery.
        </p>

        <div>
          When I searched for a battery indicator and controller monitoring tool for my{' '}
          <span
            className="relative inline-block font-semibold group/magma cursor-default"
            onMouseEnter={() => setHoverMagma(true)}
            onMouseLeave={() => setHoverMagma(false)}
          >
            <span className="relative inline-block">
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
                  initial={{ opacity: 0, y: 12, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 12, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 z-30 p-3 bg-white/95 dark:bg-neutral-900/95 border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-xl dark:shadow-2xl w-60 select-none"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="absolute top-full left-0 right-0 h-4 bg-transparent pointer-events-auto" />

                  <div className="relative h-32 w-full bg-neutral-100 dark:bg-neutral-950 rounded-2xl overflow-hidden border border-neutral-200/80 dark:border-neutral-800/80 flex items-center justify-center group/img">
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={activeAngle}
                        src={controllerImages[activeAngle]}
                        alt={`DualShock 4 V2 - ${activeAngle} view`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0 h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </AnimatePresence>

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
                          className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-default relative overflow-hidden select-none ${
                            isActive 
                              ? 'text-neutral-900 dark:text-white' 
                              : 'text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
                          }`}
                        >
                          {isActive && (
                            <motion.span 
                              layoutId="active-angle-pill-long"
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
                    className="flex items-center justify-center gap-1.5 py-1.5 text-[10px] font-bold text-neutral-500 hover:text-red-500 dark:text-neutral-400 dark:hover:text-red-400 bg-neutral-50 dark:bg-neutral-950 hover:bg-red-500/5 dark:hover:bg-red-500/10 border border-neutral-200/50 dark:border-neutral-800/50 rounded-xl transition-all duration-200 group/amazon select-none"
                  >
                    <span>Amazon.de Listing</span>
                    <ExternalLink className="w-3 h-3 text-neutral-400 group-hover/amazon:text-red-500 dark:group-hover/amazon:text-red-400 transition-colors" />
                  </a>
                </motion.div>
              )}
            </AnimatePresence>
          </span>{' '}
          DualShock 4, the top result was <strong className="text-foreground">DS4Windows</strong>. However, I quickly noticed a problem: there were <strong className="text-foreground">two completely different websites</strong> claiming to be the official DS4Windows tool:
        </div>

        <CloneAuditPanel />

        <p>
          Both sites immediately felt suspicious, and a deeper investigation confirmed my concerns. This served as a strong reminder not to trust software blindly, even if it appears at the top of Google results.
        </p>

        <div className="border-t border-foreground/5 my-8" />

        <h3 className="text-[22px] font-bold text-foreground mt-8">Official Guidance and the Problem with Forks</h3>

        <p>
          DS4Windows has been forked multiple times: originally by InhexSTER, then electrobrains, Jays2Kings, Schmaldeo, and finally Ryochan7.
        </p>

        <p>
          It is important to note that these major historical forks (such as <a href="https://github.com/jays2kings/ds4windows" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground underline decoration-muted-foreground/45 hover:decoration-foreground underline-offset-4 font-semibold transition-all duration-200">Jays2Kings</a>, archived October 24, 2021, and <a href="https://github.com/schmaldeo/DS4Windows" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground underline decoration-muted-foreground/45 hover:decoration-foreground underline-offset-4 font-semibold transition-all duration-200">Schmaldeo</a>, archived March 5, 2026) were highly trustworthy during their active periods, but are no longer maintained. Ryochan7's fork, now archived, represents the last major trustworthy continuation of the historical project.
        </p>

        <p>
          For example, a recent AI-powered Google “AI Overview” of DS4Windows incorrectly claimed:
        </p>

        <GoogleAIOverview />

        <p>
          Google's summary blindly indexed statements directly from the malicious website's pages, presenting them as search facts.
        </p>

        <p>
          Relying on AI-generated summaries or Google's “AI Overview” can be highly misleading; for instance, some AI outputs falsely claimed outdated forks were active, which is incorrect.
        </p>

        <p>
          Beyond the outdated forks, I couldn't find a single native Windows utility dedicated strictly to displaying the controller's battery level. The only tool I found was a web-based alternative, <a href="https://thebitlink.github.io/WebHID-DS4/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground underline decoration-muted-foreground/45 hover:decoration-foreground underline-offset-4 font-semibold transition-all duration-200">WebHID-DS4</a>. While it works well, it is completely browser-bound, behaves buggily over Bluetooth connection, and Chromium's WebHID API requires explicit pairing allowance from the user every single time the site connects—which is a known and necessary security aspect of chromium-based WebHID API, but highly inconvenient for daily use.
        </p>

        <div className="border-t border-foreground/5 my-8" />

        <h3 className="text-[22px] font-bold text-foreground mt-8">My Approach</h3>

        <p>
          Knowing that these forks had been officially archived, I decided not to deal with outdated or unmaintained codebases. Instead, I wanted to build a clean, minimal project dedicated strictly to my own requirements:
        </p>

        <ol className="list-decimal pl-6 space-y-2 text-muted-foreground my-4 font-semibold">
          <li>Monitor my controller’s battery</li>
          <li>Later, implement lightbar customization</li>
        </ol>

        <div className="p-6 bg-blue-500/[0.04] border border-blue-500/10 rounded-3xl relative overflow-hidden my-8">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex gap-4 items-start relative z-10">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500 shrink-0 mt-0.5">
              <Cpu className="w-5 h-5" />
            </div>
            <p className="text-sm md:text-base text-foreground font-normal leading-relaxed">
              By selecting Rust and Tauri for the core architecture, I ensured the dashboard runs with an exceptionally low memory and CPU footprint, offering an incredibly snappy interface for managing lightbar profiles and tracking battery states without any background bloat. Ultimately, this software is the product of an uncompromising focus on simplicity: designed to do two things with absolute excellence.
            </p>
          </div>
        </div>

        <p>
          I specifically aimed to purchase the V2 variant so that I could play competitively without any input lag worries, though Bluetooth has worked very well in my personal experience. The fact that the V2 allows simultaneous data transfer and charging over USB was exactly what I wanted. Additionally, the V2 features a very clean, minimalist lightbar strip built right into the touchpad, which looks absolutely gorgeous.
        </p>

        <p>
          This significantly improved my experience learning <em>Rocket League</em> on a controller after years on keyboard and mouse. With my new controller, with its low latency and direct USB connection, I could focus on mastering advanced mechanics like tornado spins and air dribbles.
        </p>

        <p>
          Ultimately, I built this dashboard for my own setup. I wanted a simple, dependable utility built out of a simple need for precision: keeping track of my controller's battery and customizing its lightbar without any extra bloat.
        </p>
      </div>
    </motion.div>
  );
};
