import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ChevronRight, ChevronLeft, Volume2, PauseCircle } from 'lucide-react';

interface StoryReaderProps {
  story: any;
  onExit: () => void;
}

export default function StoryReader({ story, onExit }: StoryReaderProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [isReadMode, setIsReadMode] = useState(false);
  
  // Animation States
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState<'next' | 'prev'>('next');
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const pages = story.pages || [];
  
  // We keep track of "current" and "next" content separately for the animation
  const activeContent = pages[currentPage];
  const [displayContent, setDisplayContent] = useState(activeContent);

  // --- 1. AUDIO SETUP ---
  useEffect(() => {
    audioRef.current = new Audio();
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // --- 2. AUDIO AUTO-TURN ---
  useEffect(() => {
    if (!audioRef.current) return;
    const handleAudioEnded = () => {
      if (currentPage < pages.length - 1) handlePageChange('next');
      else setIsReadMode(false);
    };
    audioRef.current.onended = handleAudioEnded;
    return () => { if (audioRef.current) audioRef.current.onended = null; };
  }, [currentPage, pages.length]);

  // --- 3. AUDIO PLAYBACK ---
  useEffect(() => {
    if (!audioRef.current) return;
    const audioUrl = pages[currentPage]?.audio_url;

    // Stop previous immediately on page change
    audioRef.current.pause();

    if (audioUrl) {
      if (audioRef.current.src !== audioUrl) {
        audioRef.current.src = audioUrl;
        audioRef.current.load();
      }
      // Delay play slightly to wait for flip animation to finish
      if (isReadMode && !isFlipping) {
        const timer = setTimeout(() => {
           audioRef.current?.play().catch(() => setIsReadMode(false));
        }, 600); // 600ms matches animation duration
        return () => clearTimeout(timer);
      }
    }
  }, [currentPage, isReadMode, isFlipping, pages]);

  // --- 4. FLIP LOGIC ---
  const handlePageChange = (direction: 'next' | 'prev') => {
    if (isFlipping) return;
    
    setFlipDirection(direction);
    setIsFlipping(true);

    // Halfway through animation, update the content
    setTimeout(() => {
      const newPage = direction === 'next' ? currentPage + 1 : currentPage - 1;
      setCurrentPage(newPage);
      setDisplayContent(pages[newPage]);
    }, 400);

    // End animation
    setTimeout(() => {
      setIsFlipping(false);
    }, 800);
  };

  const renderText = (text: string) => {
    if (!text) return null;
    const focusLetters = story.focus_letters || [];
    return text.split(' ').map((token, i) => {
      const match = token.match(/^([a-zA-Z0-9'-]+)(.*)$/);
      const word = match ? match[1] : token;
      const punct = match ? match[2] : "";
      const isTarget = focusLetters.some((l: string) => word.toLowerCase().includes(l.toLowerCase()));

      return (
        <React.Fragment key={i}>
          <span className={isTarget ? "text-orange-600 font-bold" : "text-slate-700"}>
            {word}
          </span>
          <span className="text-slate-700">{punct}</span>{' '}
        </React.Fragment>
      );
    });
  };

  const isFirst = currentPage === 0;
  const isLast = currentPage === pages.length - 1;

  return (
    <div className="min-h-screen bg-slate-800 flex flex-col items-center justify-center p-4 overflow-hidden perspective-1000">
      
      {/* HEADER */}
      <div className="w-full max-w-5xl flex justify-between items-center mb-6 text-white z-10 relative">
        <button onClick={onExit} className="flex items-center gap-2 hover:text-orange-400 font-bold transition-colors">
          <ArrowLeft /> Library
        </button>
        {activeContent?.audio_url && (
          <button 
            onClick={() => setIsReadMode(!isReadMode)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold transition-all ${isReadMode ? "bg-orange-500 shadow-lg animate-pulse text-white" : "bg-white/10 text-white"}`}
          >
            {isReadMode ? <PauseCircle size={20} /> : <Volume2 size={20} />}
            {isReadMode ? "Reading..." : "Read to Me"}
          </button>
        )}
      </div>

      {/* --- 3D BOOK CONTAINER --- */}
      <div className="relative w-full max-w-6xl h-[600px]">
        
        {/* The Static Page (Background) */}
        <div className="absolute inset-0 flex flex-col md:flex-row bg-[#fdfbf7] rounded-[30px] border-[10px] border-[#e2dac8] shadow-2xl overflow-hidden">
           {/* IMAGE SIDE */}
           <div className="w-full md:w-1/2 bg-orange-50 p-6 flex items-center justify-center border-r-4 border-[#e2dac8]">
              <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-inner border-4 border-white">
                 <img src={displayContent?.image_url || story.cover_image_url} className="w-full h-full object-cover" alt="Scene" />
              </div>
           </div>
           {/* TEXT SIDE */}
           <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
              <div className="text-xl md:text-2xl leading-loose font-medium font-dyslexic text-slate-800">
                  {renderText(displayContent?.text || "")}
              </div>
           </div>
        </div>

        {/* The Flipping Page (Overlay) */}
        {isFlipping && (
          <div 
             className={`absolute inset-0 bg-[#f3efe6] rounded-[30px] border-[10px] border-[#d8cfbc] flex items-center justify-center
             origin-left transition-transform duration-700 ease-in-out z-20 shadow-2xl`}
             style={{ 
               transformOrigin: flipDirection === 'next' ? 'left center' : 'right center',
               animation: `${flipDirection === 'next' ? 'flipNext' : 'flipPrev'} 0.6s ease-in-out forwards`
             }}
          >
             {/* While flipping, we show a blurred version of the OLD page to simulate movement */}
             <div className="opacity-50 blur-sm scale-95">
                <img src={pages[currentPage]?.image_url} className="w-32 h-32 object-cover rounded-full" />
             </div>
          </div>
        )}

        {/* --- CONTROLS (Overlaid at bottom) --- */}
        <div className="absolute bottom-6 left-0 right-0 flex justify-between px-12 z-30">
          <button 
            onClick={() => handlePageChange('prev')} 
            disabled={isFirst || isFlipping}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-md ${isFirst ? 'opacity-0' : 'bg-white hover:bg-orange-50 text-slate-600'}`}
          >
            <ChevronLeft /> Previous
          </button>
          
          <span className="text-slate-400 font-bold text-sm bg-white/80 px-4 py-2 rounded-full backdrop-blur-sm">
             {currentPage + 1} / {pages.length}
          </span>

          <button 
            onClick={() => handlePageChange('next')} 
            disabled={isLast || isFlipping}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-md ${isLast ? 'opacity-50 grayscale' : 'bg-orange-500 text-white hover:scale-105'}`}
          >
            Next <ChevronRight />
          </button>
        </div>

      </div>

      {/* --- CSS ANIMATIONS --- */}
      <style jsx>{`
        @keyframes flipNext {
          0% { transform: rotateY(0deg); opacity: 1; }
          50% { opacity: 0.8; background: #e8e0d0; }
          100% { transform: rotateY(-90deg); opacity: 0; }
        }
        @keyframes flipPrev {
          0% { transform: rotateY(-90deg); opacity: 0; }
          50% { opacity: 0.8; background: #e8e0d0; }
          100% { transform: rotateY(0deg); opacity: 1; }
        }
      `}</style>

    </div>
  );
}