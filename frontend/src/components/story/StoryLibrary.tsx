"use client";
import React, { useState, useEffect } from 'react';
import { BookOpen, RefreshCcw, Loader2, Sparkles, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import StoryCard from './StoryCard';
import StoryReader from './StoryReader';

export default function StoryLibrary() {
  const [stories, setStories] = useState<any[]>([]);
  const [selectedStory, setSelectedStory] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // --- DATA FETCHING ---
  const fetchStories = async (forceRefresh = false) => {
    setLoading(true);
    setSelectedStory(null);
    try {
      const url = `http://localhost:8000/api/stories/child_123${forceRefresh ? '?refresh=true' : ''}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.stories) setStories(data.stories);
    } catch (e) {
      console.error("Failed to fetch stories", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStories(false); }, []);

  // --- VIEW 1: LOADING ---
  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#87CEEB] via-[#B0E0E6] to-[#FFF8DC] relative overflow-hidden">
      {/* Floating Clouds */}
      <motion.div
        className="absolute top-20 left-10 text-8xl opacity-70"
        animate={{ x: [0, 30, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      >
        ☁️
      </motion.div>
      <motion.div
        className="absolute top-40 right-20 text-7xl opacity-60"
        animate={{ x: [0, -25, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      >
        ☁️
      </motion.div>
      
      {/* Stars twinkling */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-yellow-300"
          style={{ 
            left: `${20 + i * 10}%`, 
            top: `${10 + (i % 3) * 20}%` 
          }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.3, 1, 0.3]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.3
          }}
        >
          <Star size={20} fill="currentColor" />
        </motion.div>
      ))}

      {/* Book Animation */}
      <motion.div
        animate={{
          rotate: [0, 5, 0, -5, 0],
          y: [0, -10, 0]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <div className="bg-white p-8 rounded-3xl shadow-2xl border-4 border-orange-300">
          <BookOpen className="text-orange-500" size={80} />
        </div>
      </motion.div>

      {/* Loading Text */}
      <motion.div 
        className="mt-8 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="text-3xl font-black text-white drop-shadow-lg mb-2 flex items-center gap-2 justify-center">
          <Sparkles className="text-yellow-300" />
          Creating Your Magical Stories
          <Sparkles className="text-yellow-300" />
        </div>
        <div className="text-lg font-bold text-white/90 space-y-1 mt-4">
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            ✨ Writing wonderful tales...
          </motion.div>
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
          >
            🎨 Painting beautiful pictures...
          </motion.div>
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 1 }}
          >
            🎤 Recording magical voices...
          </motion.div>
        </div>
      </motion.div>

      {/* Bouncing Loader */}
      <motion.div
        className="mt-8"
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 1, repeat: Infinity }}
      >
        <Loader2 className="animate-spin text-white" size={48} />
      </motion.div>
    </div>
  );

  // --- VIEW 2: READER MODE ---
  if (selectedStory) {
    return (
      <StoryReader 
        story={selectedStory} 
        onExit={() => setSelectedStory(null)} 
      />
    );
  }

  // --- VIEW 3: LIBRARY MODE (Sky Theme) ---
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#87CEEB] via-[#B0E0E6] to-[#FFF8DC] relative overflow-hidden">
      
      {/* Animated Sky Background Elements */}
      {/* Sun */}
      <motion.div
        className="absolute top-8 right-8 text-9xl"
        animate={{
          rotate: [0, 360],
          scale: [1, 1.05, 1]
        }}
        transition={{
          rotate: { duration: 20, repeat: Infinity, ease: "linear" },
          scale: { duration: 3, repeat: Infinity, ease: "easeInOut" }
        }}
      >
        ☀️
      </motion.div>

      {/* Floating Clouds */}
      <motion.div
        className="absolute top-20 left-0 text-8xl opacity-70 pointer-events-none"
        animate={{ x: ["-10%", "110%"] }}
        transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
      >
        ☁️
      </motion.div>
      <motion.div
        className="absolute top-48 right-0 text-7xl opacity-60 pointer-events-none"
        animate={{ x: ["110%", "-10%"] }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear", delay: 10 }}
      >
        ☁️
      </motion.div>

     

      {/* Birds */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={`bird-${i}`}
          className="absolute text-4xl pointer-events-none"
          style={{ top: `${30 + i * 10}%` }}
          animate={{
            x: ["-5%", "105%"],
            y: [0, -20, 0, 20, 0]
          }}
          transition={{
            duration: 25 + i * 5,
            repeat: Infinity,
            ease: "linear",
            delay: i * 8
          }}
        >
          🦅
        </motion.div>
      ))}

      {/* Main Content Container */}
      <div className="relative z-10 p-8 pt-24 flex flex-col items-center min-h-screen">
        
        {/* Header */}
        <motion.div 
          className="max-w-6xl w-full flex justify-between items-center mb-16"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 150 }}
        >
          <motion.h1 
            className="text-5xl md:text-6xl font-black text-white flex items-center gap-4 drop-shadow-lg"
            whileHover={{ scale: 1.05 }}
          >
            <motion.div
              animate={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <BookOpen size={56} className="text-yellow-300" />
            </motion.div>
            My Story Castle
          </motion.h1>
          
          <motion.button 
            onClick={() => fetchStories(true)} 
            className="bg-gradient-to-r from-orange-400 to-pink-400 text-white px-6 py-4 rounded-full shadow-lg hover:shadow-2xl font-black text-lg flex items-center gap-3 border-4 border-white"
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <RefreshCcw size={24} />
            <span className="hidden md:inline">Create New Magic</span>
            <Sparkles size={24} />
          </motion.button>
        </motion.div>

        {/* Stories Grid or Empty State */}
        <AnimatePresence mode="wait">
          {stories.length === 0 ? (
            <motion.div 
              className="text-center mt-20"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
            >
              <motion.div
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-9xl mb-6"
              >
                📚
              </motion.div>
              <div className="bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border-4 border-yellow-300">
                <p className="text-3xl font-black text-slate-700 mb-4">
                  Your Story Castle is Empty!
                </p>
                <p className="text-xl text-slate-600 mb-6">
                  Click "Create New Magic" to fill it with wonderful tales! ✨
                </p>
                <motion.div
                  className="text-6xl"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  🏰
                </motion.div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl w-full pt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.1 }}
            >
              {stories.map((story, index) => (
                <motion.div
                  key={story.id}
                  initial={{ y: 50, opacity: 0, rotate: -5 }}
                  animate={{ y: 0, opacity: 1, rotate: 0 }}
                  transition={{ 
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 200
                  }}
                  whileHover={{ 
                    scale: 1.05,
                    rotate: Math.random() > 0.5 ? 3 : -3,
                    transition: { type: "spring", stiffness: 300 }
                  }}
                >
                  <StoryCard 
                    story={story} 
                    onClick={() => setSelectedStory(story)} 
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Decorative Bottom Elements */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{
          background: 'linear-gradient(to top, rgba(255,248,220,0.8), transparent)'
        }}
      />
    </div>
  );
}