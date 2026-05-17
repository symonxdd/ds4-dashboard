'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SiGithub } from 'react-icons/si';
import { useTheme } from 'next-themes';
import { ThemeToggle } from './ThemeToggle';
import { useLatestRelease } from '../hooks/useLatestRelease';

const Path = (props) => (
  <motion.path
    fill="transparent"
    strokeWidth="2"
    stroke="currentColor"
    strokeLinecap="round"
    {...props}
  />
);

const menuToggleVariants = {
  top: {
    closed: { d: "M 2 5 L 16 5" },
    open: { d: "M 3 15 L 15 3" }
  },
  middle: {
    closed: { opacity: 1, d: "M 2 9 L 16 9" },
    open: { opacity: 0, d: "M 2 9 L 16 9" }
  },
  bottom: {
    closed: { d: "M 2 13 L 16 13" },
    open: { d: "M 3 3 L 15 15" }
  }
};

const menuVariants = {
  hidden: { opacity: 0, height: 0 },
  visible: { 
    opacity: 1, 
    height: 'auto',
    transition: {
      height: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
      opacity: { duration: 0.2 },
      staggerChildren: 0.05,
      delayChildren: 0.05
    }
  },
  exit: {
    opacity: 0,
    height: 0,
    transition: {
      height: { duration: 0.25, ease: [0.16, 1, 0.3, 1] },
      opacity: { duration: 0.15 },
      staggerChildren: 0.03,
      staggerDirection: -1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.15 } }
};

export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
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

  // Auto-close menu on desktop resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navItems = [
    { label: 'Features', href: '#features' },
    { label: 'Screens', href: '#screens' },
    { label: 'Motivation', href: '#motivation' },
  ];

  const scrollToSection = (href) => {
    const element = document.querySelector(href);
    if (element) {
      const offset = 0;
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
    <>
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 py-4 border-b ${
          isScrolled || isOpen
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
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center justify-center w-9 h-9 rounded-lg border border-foreground/[0.08] bg-foreground/[0.02] hover:bg-foreground/[0.05] active:bg-foreground/[0.08] text-muted-foreground hover:text-foreground transition-all cursor-default md:hidden"
              aria-label="Toggle menu"
            >
              <svg width="18" height="18" viewBox="0 0 18 18">
                <Path
                  variants={menuToggleVariants.top}
                  initial="closed"
                  animate={isOpen ? "open" : "closed"}
                  transition={{ duration: 0.2 }}
                />
                <Path
                  variants={menuToggleVariants.middle}
                  initial="closed"
                  animate={isOpen ? "open" : "closed"}
                  transition={{ duration: 0.2 }}
                />
                <Path
                  variants={menuToggleVariants.bottom}
                  initial="closed"
                  animate={isOpen ? "open" : "closed"}
                  transition={{ duration: 0.2 }}
                />
              </svg>
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed top-[64px] left-0 right-0 z-40 border-b border-foreground/5 bg-background/80 backdrop-blur-lg md:hidden overflow-hidden"
          >
            <div className="flex flex-col gap-2 p-6">
              {navItems.map((item) => (
                <motion.button
                  key={item.href}
                  variants={itemVariants}
                  onClick={() => {
                    setIsOpen(false);
                    setTimeout(() => {
                      scrollToSection(item.href);
                    }, 200);
                  }}
                  className={`w-full text-left py-3 px-4 rounded-xl text-base font-medium transition-colors cursor-default hover:bg-foreground/5 active:bg-foreground/[0.08] ${
                    activeSection === item.href.replace('#', '')
                      ? "text-foreground bg-foreground/[0.02]"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {item.label}
                </motion.button>
              ))}
              <motion.a
                variants={itemVariants}
                href="https://github.com/symonxdd/ds4-dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 py-3 px-4 rounded-xl text-base font-medium text-muted-foreground hover:text-foreground transition-colors cursor-default hover:bg-foreground/5 active:bg-foreground/[0.08]"
              >
                <SiGithub className="w-5 h-5" />
                <span>GitHub</span>
              </motion.a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
