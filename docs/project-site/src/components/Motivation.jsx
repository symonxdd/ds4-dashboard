'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Shield, Cpu } from 'lucide-react';

export const Motivation = () => {
  const points = [
    { icon: Zap, text: 'Instant' },
    { icon: Shield, text: 'Simple' },
    { icon: Cpu, text: 'Efficient' },
  ];

  return (
    <section id="motivation" className="py-24 bg-background scroll-mt-16">
      <div className="container mx-auto px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-foreground">Motivation</h2>
            <div className="h-1.5 w-12 bg-blue-600 mx-auto rounded-full" />
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            <div className="lg:col-span-7 xl:col-span-8 space-y-8">
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-xl md:text-2xl font-semibold text-foreground leading-tight"
              >
                DS4 Dashboard was built for a single reason: <span className="text-blue-500 italic">I needed a way to easily check my controller's battery level.</span>
              </motion.p>

              <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  Checking a controller's battery level shouldn't require launching a heavy suite of background services or dealing with complex configurations. Most existing solutions felt over-engineered for what should be a simple task.
                </motion.p>

                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="pl-6 border-l-2 border-blue-500/30 italic text-muted-foreground/90 py-2"
                >
                  The goal was to create a utility that opens instantly, provides the necessary data at a glance, and closes completely when finished. No overhead, no persistent tray icons unless requested, and no unnecessary system load.
                </motion.p>

                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  By utilizing Rust and Tauri, the application maintains a near-zero footprint while providing a modern, responsive interface for lightbar customization and battery tracking.
                </motion.p>

                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  It’s a tool built out of a desire for simplicity—focused on doing two things exceptionally well.
                </motion.p>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="lg:col-span-5 xl:col-span-4 bg-foreground/[0.03] rounded-3xl p-8 border border-foreground/10 backdrop-blur-md space-y-6"
            >
              <h3 className="text-xl font-bold text-foreground">Core Philosophy</h3>
              <div className="space-y-4">
                {points.map((point, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-4 bg-background/50 rounded-2xl border border-foreground/5 shadow-sm"
                  >
                    <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/10">
                      <point.icon className="w-5 h-5" />
                    </div>
                    <span className="font-semibold text-foreground">{point.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
