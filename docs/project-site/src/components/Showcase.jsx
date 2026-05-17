'use client';

import { useState } from 'react';

const screenshots = [
  {
    title: "Main Dashboard",
    desc: "Monitor battery, connection status, and controller state at a glance.",
    folder: "main.png",
  },
  {
    title: "Lightbar & Rumble",
    desc: "Test haptics and customize lightbar color.",
    folder: "lightbar-and-rumble.png",
  },
  {
    title: "Device Details",
    desc: "View hardware details and controller IDs.",
    folder: "device-info.png",
  },
  {
    title: "General Settings",
    desc: "Manage startup preferences and choose alternative app icons.",
    folder: "settings-general-tab.png",
  },
  {
    title: "System Tray",
    desc: "Minimize to tray, enable background work, and toggle notifications.",
    folder: "settings-tray-tab.png",
  },
  {
    title: "Emulation Settings",
    desc: "Configure input translation for maximum compatibility.",
    folder: "settings-emulatin-tab.png",
  },
  {
    title: "About Tab",
    desc: "Check credits, view attributions, and play with the springy app icon.",
    folder: "settings-about-tab.png",
  },
];

export default function Showcase() {
  const [active, setActive] = useState(0);

  return (
    <section id="screens" className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-start gap-16">
          <div className="lg:w-1/3">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-8 leading-tight">
              Your controller, your rules.
            </h2>

            <div className="space-y-3">
              {screenshots.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className={`w-full text-left p-4 rounded-xl border transition-all duration-200 cursor-default ${active === i
                    ? 'bg-blue-600/10 border-blue-600/30 ring-1 ring-blue-600/20'
                    : 'bg-transparent border-transparent hover:bg-foreground/[0.05]'
                    }`}
                >
                  <h4 className={`text-base font-bold mb-0.5 ${active === i ? 'text-blue-500' : 'text-foreground'}`}>
                    {s.title}
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {s.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="lg:w-2/3 w-full">
            <div className="relative overflow-hidden border border-foreground/[0.03] dark:border-foreground/10 shadow-2xl bg-background">
              {screenshots.map((s, i) => {
                const isActive = active === i;
                const activeClasses = isActive ? 'relative block' : 'absolute inset-0 hidden';
                return (
                  <div key={i} className={activeClasses}>
                    <img
                      src={`/screens/light/${s.folder}`}
                      alt={s.title}
                      className="w-full h-auto show-light"
                    />
                    <img
                      src={`/screens/dark/${s.folder}`}
                      alt={s.title}
                      className="w-full h-auto show-dark"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
