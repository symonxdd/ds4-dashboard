'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SiGithub } from 'react-icons/si';
import { useTheme } from 'next-themes';
import { ThemeToggle } from './ThemeToggle';
import { useLatestRelease } from '../hooks/useLatestRelease';

export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const { downloadUrl } = useLatestRelease();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      const sections = ['home', 'features', 'screens', 'motivation'];
      const current = sections.find(section => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 100 && rect.bottom >= 100;
        }
        return false;
      });
      if (current) setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll);
    // Run once on mount to handle browser scroll restoration on reload
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Features', href: '#features' },
    { label: 'Screens', href: '#screens' },
    { label: 'Motivation', href: '#motivation' },
  ];

  const scrollToSection = (href) => {
    const element = document.querySelector(href);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  if (!mounted) return null;

  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 py-4 border-b ${
        isScrolled 
          ? 'bg-background/80 backdrop-blur-lg border-foreground/5 shadow-sm' 
          : 'bg-transparent border-transparent'
      }`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        <div 
          className="flex items-center gap-3 cursor-default"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <img src="/icon.svg" alt="DS4 Dashboard" className="w-8 h-8" />
          <span className="text-[18px] font-[600] leading-[28px] tracking-tight text-foreground">
            DS4 Dashboard
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <button
              key={item.href}
              onClick={() => scrollToSection(item.href)}
              className={`px-4 py-2 text-sm font-medium transition-colors cursor-default rounded-lg hover:bg-foreground/5 ${
                activeSection === item.href.replace('#', '')
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {item.label}
            </button>
          ))}
          <a
            href="https://github.com/symonxdd/ds4-dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors cursor-default p-2 ml-2"
          >
            <SiGithub className="w-5 h-5" />
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <a
            href={downloadUrl}
            style={{ 
              backgroundColor: resolvedTheme === 'light' ? '#FCFCFC' : undefined 
            }}
            className={`hidden sm:inline-flex items-center justify-center px-3 py-1.5 rounded-lg border border-foreground/[0.08] text-sm font-medium hover:bg-foreground/[0.04] active:bg-foreground/[0.08] shadow-sm active:shadow-none transition-all cursor-default ${
              resolvedTheme === 'dark' ? 'bg-foreground/[0.03]' : ''
            }`}
          >
            Download
          </a>
        </div>
      </div>
    </motion.header>
  );
};
