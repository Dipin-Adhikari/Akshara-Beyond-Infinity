"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Star,
  BookOpen, 
  Gamepad2, 
  LayoutDashboard, 
  BrainCircuit, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2,
  Menu,
  X
} from 'lucide-react';
import Image from 'next/image';

export default function ModulesPage() {
  const [stars, setStars] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Generate random stars
    const newStars = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
    }));
    setStars(newStars);

    // Get window size for drag constraints
    const updateWindowSize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateWindowSize();
    window.addEventListener('resize', updateWindowSize);

    // Handle scroll effect for navbar
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('resize', updateWindowSize);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const navLinks = [
    { name: 'Test', href: '/test', icon: <BrainCircuit size={18} /> },
    { name: 'Learn', href: '/modules', icon: <Gamepad2 size={18} /> },
    { name: 'Story', href: '/story', icon: <BookOpen size={18} /> },
    { name: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#87CEEB] via-[#FFF9E6] to-[#FFFDF6] font-['Fredoka',_sans-serif] relative overflow-x-hidden">
      
      {/* --- NAVBAR --- */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/80 backdrop-blur-md shadow-sm py-4' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-2 font-black text-2xl tracking-tight text-slate-800">
            <div className="bg-orange-500 text-white p-2 rounded-xl">
              <Sparkles size={24} fill="white" />
            </div>
            <span className="text-orange-500">Akshara</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8 bg-white/50 px-8 py-3 rounded-full border border-orange-100 backdrop-blur-sm">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                href={link.href}
                className="flex items-center gap-2 font-bold text-slate-600 hover:text-orange-600 transition-colors text-sm uppercase tracking-wide"
              >
                {link.icon}
                {link.name}
              </Link>
            ))}
          </div>

          {/* CTA Button */}
          <div className="hidden md:block">
            <Link href="/test">
              <button className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-3 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-slate-200">
                Get Started
              </button>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-slate-800">
            {mobileMenuOpen ? <X size={32} /> : <Menu size={32} />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-white border-b border-slate-100 p-6 flex flex-col gap-4 shadow-xl md:hidden">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                href={link.href}
                className="flex items-center gap-4 text-xl font-bold text-slate-600 py-3 border-b border-slate-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="bg-orange-100 p-2 rounded-lg text-orange-600">{link.icon}</div>
                {link.name}
              </Link>
            ))}
          </div>
        )}
      </nav>

      {/* Animated Stars Background */}
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute text-yellow-300 pointer-events-none z-5"
          style={{ left: `${star.x}%`, top: `${star.y}%` }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.3, 1, 0.3],
            rotate: [0, 180, 360]
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 2
          }}
        >
          <Star size={10 + Math.random() * 6} fill="currentColor" />
        </motion.div>
      ))}

      {/* Floating Clouds */}
      <motion.div
        className="absolute top-10 left-0 text-8xl pointer-events-none z-5 opacity-70"
        animate={{ x: ["-10%", "110%"] }}
        transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
      >
        ☁️
      </motion.div>
      <motion.div
        className="absolute top-32 right-0 text-7xl pointer-events-none z-5 opacity-60"
        animate={{ x: ["110%", "-10%"] }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear", delay: 5 }}
      >
        ☁️
      </motion.div>

      {/* Interactive Rocket - Draggable anywhere with inertia and boundary bounce */}
      <motion.div
        className="absolute left-10 text-7xl z-5 cursor-grab active:cursor-grabbing"
        animate={{
          y: [50, 20, 50],
          rotate: [25, 30, 25],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{ top: '10%' }}
        drag
        dragConstraints={{
          left: -windowSize.width * 0.4,
          right: windowSize.width * 0.8,
          top: -windowSize.height * 0.05,
          bottom: windowSize.height * 0.6,
        }}
        dragElastic={0.2}
        dragTransition={{ 
          bounceStiffness: 400, 
          bounceDamping: 15,
          power: 0.2,
          timeConstant: 200
        }}
        whileHover={{ scale: 1.2 }}
        whileTap={{ scale: 0.9, cursor: "grabbing" }}
      >
        🚀
      </motion.div>

      {/* Interactive Planet - Draggable anywhere with inertia and boundary bounce */}
      <motion.div
        className="absolute text-9xl z-5 cursor-grab active:cursor-grabbing"
        style={{ 
          top: '8%',
          right: '15%'
        }}
        animate={{
          rotate: [0, 360]
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear"
        }}
        drag
        dragConstraints={{
          left: -windowSize.width * 0.7,
          right: windowSize.width * 0.1,
          top: -windowSize.height * 0.05,
          bottom: windowSize.height * 0.6,
        }}
        dragElastic={0.2}
        dragTransition={{ 
          bounceStiffness: 400, 
          bounceDamping: 15,
          power: 0.2,
          timeConstant: 200
        }}
        whileHover={{ scale: 1.2 }}
        whileTap={{ scale: 0.9, cursor: "grabbing" }}
      >
        🪐
      </motion.div>

      {/* Floating Balloons */}
      <motion.div
        className="absolute left-1/4 text-6xl pointer-events-none z-5"
        animate={{
          y: [80, -10, 80],
          x: [-5, 5, -5]
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
        style={{ top: '20%' }}
      >
        🎈
      </motion.div>

      {/* Hanging Monkey - Top Right */}
      <motion.div 
        className="absolute top-0 right-0 z-50 w-40 h-40 md:w-64 md:h-64 pointer-events-none"
        animate={{ 
          rotate: [-6, 6, -6],
          y: [0, -8, 0]
        }}
        transition={{ 
          duration: 3, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        style={{ transformOrigin: "80% 0%" }}
      >
        <Image src="/monkey-vine.png" alt="Hanging Monkey" fill className="object-contain drop-shadow-2xl" />
      </motion.div>

      {/* --- HERO SECTION --- */}
      <header className="pt-40 pb-20 px-6 relative z-10">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          
          {/* Left Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full font-bold text-sm uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
              AI-Powered Learning
            </div>
            
            <motion.h1 
              className="text-5xl md:text-7xl font-black leading-[1.1] text-slate-900"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 150, damping: 15 }}
            >
              Master Reading with <span className="text-orange-500 inline-block hover:rotate-2 transition-transform cursor-default">Magic.</span>
            </motion.h1>
            
            <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-lg">
              A personalized adventure designed for unique minds. We turn reading struggles into superpowers through games, stories, and AI.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/test" className="w-full sm:w-auto">
                <button className="w-full flex items-center justify-center gap-3 bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all hover:-translate-y-1 shadow-xl shadow-orange-200">
                  Start Your Journey <ArrowRight size={20} />
                </button>
              </Link>
              <Link href="/modules" className="w-full sm:w-auto">
                <button className="w-full bg-white hover:bg-slate-50 text-slate-700 px-8 py-4 rounded-2xl font-bold text-lg border-2 border-slate-100 transition-all">
                  Try a Demo
                </button>
              </Link>
            </div>
            
            <div className="flex items-center gap-6 pt-4 text-slate-400 font-semibold text-sm">
              <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-green-500" /> Dyslexia Friendly</span>
              <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-green-500" /> Science Based</span>
            </div>
          </div>

          {/* Right - Monkey Hi Image */}
          <motion.div 
            className="relative"
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.2 }}
          >
            <div className="relative w-full h-[500px]">
              <Image 
                src="/monkey-hi.png" 
                alt="Monkey Greeting" 
                fill 
                className="object-contain drop-shadow-2xl"
              />
            </div>
          </motion.div>

        </div>
      </header>

      {/* --- FEATURES GRID --- */}
      <section className="py-24 px-6 bg-white rounded-t-[60px] shadow-[0_-20px_60px_rgba(0,0,0,0.05)] relative z-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-slate-800 mb-4">Your Path to Mastery</h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">Everything you need to build confidence and reading skills, all in one magical place.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard 
              icon={<BrainCircuit size={32} className="text-purple-500" />}
              title="Smart Test"
              desc="Identify your specific challenges (like b vs d) in 5 minutes."
              color="bg-purple-50"
              href="/test"
            />
            <FeatureCard 
              icon={<Gamepad2 size={32} className="text-blue-500" />}
              title="Play to Learn"
              desc="Fun mini-games that adapt to your level automatically."
              color="bg-blue-50"
              href="/modules"
            />
            <FeatureCard 
              icon={<BookOpen size={32} className="text-orange-500" />}
              title="Magic Stories"
              desc="AI writes stories using ONLY the letters you know."
              color="bg-orange-50"
              href="/story"
            />
            <FeatureCard 
              icon={<LayoutDashboard size={32} className="text-green-500" />}
              title="Track Growth"
              desc="Watch your progress bars fill up as you master new sounds."
              color="bg-green-50"
              href="/dashboard"
            />
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-6 relative z-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 font-bold text-white text-xl">
            <Sparkles size={20} className="text-orange-500" /> Akshara
          </div>
          <div className="flex gap-8 text-sm font-semibold">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
          </div>
          <div className="text-sm">© 2026 Akshara. All rights reserved.</div>
        </div>
      </footer>

      {/* Grass Footer - Above the white section */}
      <div className="fixed bottom-0 left-0 w-full z-10 pointer-events-none h-40 md:h-56">
        <Image src="/grass.png" alt="Grass" fill className="object-cover object-bottom" priority />
      </div>
    </div>
  );
}

// --- SUB-COMPONENT: Feature Card ---
function FeatureCard({ icon, title, desc, color, href }: any) {
  return (
    <Link href={href}>
      <div className={`h-full p-8 rounded-[32px] ${color} border-2 border-transparent hover:border-slate-100 hover:shadow-xl transition-all hover:-translate-y-2 cursor-pointer group`}>
        <div className="bg-white w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <h3 className="text-2xl font-black text-slate-800 mb-3">{title}</h3>
        <p className="text-slate-600 font-medium leading-relaxed">
          {desc}
        </p>
        <div className="mt-6 flex items-center gap-2 text-slate-800 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
          Explore <ArrowRight size={16} />
        </div>
      </div>
    </Link>
  );
}