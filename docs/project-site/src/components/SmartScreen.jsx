import React from 'react';
import { ShieldAlert } from 'lucide-react';

export const SmartScreen = () => {
  return (
    <section id="smartscreen" className="py-24 bg-blue-500/[0.03]">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto rounded-3xl p-8 md:p-12 border border-blue-500/20 bg-blue-500/[0.02] backdrop-blur-sm">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="w-16 h-16 shrink-0 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
              <ShieldAlert size={32} />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-4">"Windows protected the PC"?</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                When running the DS4 Dashboard installer for the first time, you might see a Windows SmartScreen warning.
                This is normal for new open-source software that hasn't built a "reputation" with Microsoft yet.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-foreground/[0.03] border border-foreground/[0.08]">
                  <h4 className="font-bold mb-2 text-sm text-foreground">How to run</h4>
                  <p className="text-sm text-muted-foreground">Click <strong>"More Info"</strong> and then <strong>"Run anyway"</strong>.</p>
                </div>
                <div className="p-4 rounded-xl bg-foreground/[0.03] border border-foreground/[0.08]">
                  <h4 className="font-bold mb-2 text-sm text-foreground">Why the warning?</h4>
                  <p className="text-sm text-muted-foreground">Certificates cost hundreds of dollars per year. The focus remains on keeping this tool free and open-source.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
