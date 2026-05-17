'use client';

import React from 'react';

export const CloneAuditPanel = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8 font-sans">
      <div className="bg-foreground/[0.02] dark:bg-foreground/[0.01] rounded-3xl p-6 border border-foreground/10 hover:border-amber-500/30 transition-all duration-300 relative group flex flex-col justify-between">
        <div className="absolute top-4 right-4 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[9px] font-bold px-2.5 py-0.5 rounded-full border border-amber-500/20 uppercase tracking-widest">
          SUSPICIOUS SOURCE
        </div>
        
        <div>
          <div className="space-y-1 mb-4">
            <h4 className="text-lg font-bold text-foreground group-hover:text-amber-500 transition-colors">ds4-windows.com</h4>
            <p className="text-[11px] text-muted-foreground">Highest ranking on search queries</p>
          </div>

          <div className="border-t border-foreground/5 my-3" />

          <div className="space-y-3.5 text-xs text-muted-foreground leading-relaxed">
            <div className="flex gap-2.5 items-start">
              <span className="text-amber-500 mt-0.5">⚠️</span>
              <span>
                Claims source code access, but points to a <span className="font-semibold text-foreground">404 Error</span> GitHub link.
              </span>
            </div>
            <div className="flex gap-2.5 items-start">
              <span className="text-amber-500 mt-0.5">⚠️</span>
              <span>
                Unprofessional design with awkward formatting and spelling errors (e.g. all lowercase “i” and “github”).
              </span>
            </div>
            <div className="flex gap-2.5 items-start">
              <span className="text-red-500 font-bold mt-0.5">🚨</span>
              <span>
                Distributes <span className="font-semibold text-foreground">v3.3.3</span> release using non-standard naming schemes. <span className="font-semibold text-red-500 dark:text-red-400">VirusTotal flagged download archives as malicious.</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-foreground/[0.02] dark:bg-foreground/[0.01] rounded-3xl p-6 border border-foreground/10 hover:border-red-500/30 transition-all duration-300 relative group flex flex-col justify-between">
        <div className="absolute top-4 right-4 bg-red-500/10 text-red-500 text-[9px] font-bold px-2.5 py-0.5 rounded-full border border-red-500/20 uppercase tracking-widest">
          CHROME BLOCKED
        </div>

        <div>
          <div className="space-y-1 mb-4">
            <h4 className="text-lg font-bold text-foreground group-hover:text-red-500 transition-colors">ds4windows.io</h4>
            <p className="text-[11px] text-muted-foreground">Premium, deceptive layout</p>
          </div>

          <div className="border-t border-foreground/5 my-3" />

          <div className="space-y-3.5 text-xs text-muted-foreground leading-relaxed">
            <div className="flex gap-2.5 items-start">
              <span className="text-amber-500 mt-0.5">⚠️</span>
              <span>
                Promises open-source integrity: <span className="italic">“100% Safe & Secure. Reviewed by thousands.”</span>
              </span>
            </div>
            <div className="flex gap-2.5 items-start">
              <span className="text-amber-500 mt-0.5">⚠️</span>
              <span>
                Fakes credibility by linking directly to Ryochan7’s original (now deleted and archived) repository.
              </span>
            </div>
            <div className="flex gap-2.5 items-start">
              <span className="text-red-500 font-bold mt-0.5">🚨</span>
              <span>
                Triggered Google Chrome's built-in sandbox to <span className="font-semibold text-red-500 dark:text-red-400">block the installation file as dangerous malware.</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
