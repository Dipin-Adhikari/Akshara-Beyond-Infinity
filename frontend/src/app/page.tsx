"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
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

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Test', href: '/test', icon: <BrainCircuit size={18} /> },
    { name: 'Learn', href: '/modules', icon: <Gamepad2 size={18} /> },
    { name: 'Story', href: '/story', icon: <BookOpen size={18} /> },
    { name: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-[#FFFBEB] font-sans text-slate-800 selection:bg-orange-200">
      
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

      {/* --- HERO SECTION --- */}
      <header className="pt-40 pb-20 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          
          {/* Left Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full font-bold text-sm uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
              AI-Powered Learning
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black leading-[1.1] text-slate-900">
              Master Reading with <span className="text-orange-500 inline-block hover:rotate-2 transition-transform cursor-default">Magic.</span>
            </h1>
            
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

          {/* Right Image / Graphic Placeholder */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-orange-200 to-transparent rounded-[60px] rotate-3 blur-2xl opacity-50"></div>
            <div className="relative bg-white border-8 border-slate-50 rounded-[60px] p-8 shadow-2xl rotate-1 hover:rotate-0 transition-transform duration-500">
              {/* Mockup of the app interface */}
              <div className="bg-[#FFFBEB] rounded-3xl p-6 space-y-4 border border-slate-100">
                <div className="flex justify-between items-center mb-4">
                  <div className="h-4 w-1/3 bg-slate-200 rounded-full"></div>
                  <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-500">
                    <Star size={16} fill="currentColor" />
                  </div>
                </div>
                <div className="h-32 bg-orange-50 rounded-2xl flex items-center justify-center border-2 border-dashed border-orange-200">
                  <span className="text-4xl font-black text-orange-300">b / d</span>
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-full bg-slate-200 rounded-full"></div>
                  <div className="h-4 w-2/3 bg-slate-200 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </header>

      {/* --- FEATURES GRID --- */}
      <section className="py-24 px-6 bg-white rounded-t-[60px] shadow-[0_-20px_60px_rgba(0,0,0,0.05)]">
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
      <footer className="bg-slate-900 text-slate-400 py-12 px-6">
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

// Icon helper
function Star({ size, fill, className }: any) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill={fill || "none"} 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}