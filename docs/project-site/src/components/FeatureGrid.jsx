'use client';

import { Battery, Palette, Zap, Cpu, Layout, Gauge } from 'lucide-react';

const features = [
  {
    title: "Battery Monitoring",
    description: "Real-time battery level tracking for both v1 and v2 models. Accurate reporting for wired and wireless connections.",
    icon: Battery,
    color: "text-green-500",
    bg: "bg-green-500/10",
  },
  {
    title: "Lightbar Customization",
    description: "Full control over lightbar color and intensity. Match the setup with precision.",
    icon: Palette,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    title: "Rumble Testing",
    description: "Trigger rumble motors to verify connection and vibration functionality.",
    icon: Gauge,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  {
    title: "Mouse Emulation",
    description: "Control the system cursor directly using the controller's touchpad and analog stick for seamless navigation.",
    icon: Layout,
    color: "text-pink-500",
    bg: "bg-pink-500/10",
  },
  {
    title: "Low Footprint",
    description: "Optimized Rust backend ensures minimal CPU and RAM usage. Efficient by design.",
    icon: Cpu,
    color: "text-orange-500",
    bg: "bg-orange-500/10",
  },
  {
    title: "Instant Startup",
    description: "No heavy background services. DS4 Dashboard opens instantly and maintains a minimal presence.",
    icon: Zap,
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
  },
];

export default function FeatureGrid() {
  return (
    <section id="features" className="py-24 bg-foreground/[0.02]">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">Functionality</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Monitoring battery level and customizing lightbar color.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <div
              key={i}
              className="p-8 rounded-2xl bg-foreground/[0.03] border border-foreground/10 hover:border-foreground/20 hover:bg-foreground/[0.05] hover:scale-[1.02] transition-all duration-300 group shadow-lg"
            >
              <div className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center ${feature.color} mb-6 transition-colors`}>
                <feature.icon size={24} />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
