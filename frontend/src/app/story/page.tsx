"use client";
import React, { useState, useEffect } from 'react';
import { BookOpen, RefreshCcw, ArrowLeft, Star, Loader2, ChevronRight, ChevronLeft } from 'lucide-react';

export default function StoryLibrary() {
  const [stories, setStories] = useState<any[]>([]);
  const [selectedStory, setSelectedStory] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [animating, setAnimating] = useState(false); // For transition state

  const fetchStories = async (forceRefresh = false) => {
    setLoading(true);
    setSelectedStory(null);
    try {
      // NOTE: Ensure your FastAPI is running on port 8000
      const url = `http://localhost:8000/api/stories/child_123${forceRefresh ? '?refresh=true' : ''}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.stories) setStories(data.stories);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStories(false); }, []);

  const handlePageChange = (direction: 'next' | 'prev') => {
    if (animating) return;
    
    // Simple fade-out/in logic
    setAnimating(true);
    setTimeout(() => {
      setCurrentPage(prev => direction === 'next' ? prev + 1 : prev - 1);
      setAnimating(false);
    }, 300); // Wait for fade out
  };

  // --- TEXT RENDERER ---
  const renderStoryContent = (text: string, focusLetters: string[]) => {
    if (!text) return null;
    return text.split(' ').map((token, i) => {
      const match = token.match(/^([a-zA-Z0-9'-]+)(.*)$/);
      const word = match ? match[1] : token;
      const punct = match ? match[2] : "";
      const isTarget = focusLetters?.some(l => word.toLowerCase().includes(l.toLowerCase()));

      return (
        <React.Fragment key={i}>
          <span className={isTarget ? "text-orange-600 font-black text-[1.1em]" : "text-slate-700"}>
            {word}
          </span>
          <span className="text-slate-700 font-medium">{punct}</span>{' '}
        </React.Fragment>
      );
    });
  };

  // --- VIEW 1: LOADING ---
  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FFFBEB] gap-6">
      <Loader2 className="animate-spin text-orange-500" size={64} />
      <div className="text-xl font-bold text-slate-600 animate-pulse">
        Painting your pictures... this may take a minute...
      </div>
    </div>
  );

  // --- VIEW 2: READER ---
  if (selectedStory) {
    const pages = selectedStory.pages || [];
    const currentContent = pages[currentPage];
    const isFirst = currentPage === 0;
    const isLast = currentPage === pages.length - 1;

    return (
      <div className="min-h-screen bg-slate-800 flex flex-col items-center justify-center p-4">
        {/* Header */}
        <div className="w-full max-w-5xl flex justify-between items-center mb-6 text-white">
          <button onClick={() => setSelectedStory(null)} className="flex items-center gap-2 hover:text-orange-400 font-bold transition-colors">
            <ArrowLeft /> Library
          </button>
          <span className="font-bold opacity-50">Page {currentPage + 1} of {pages.length}</span>
        </div>

        {/* BOOK CONTAINER */}
        <div className="bg-[#fdfbf7] w-full max-w-6xl rounded-[30px] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px] border-[10px] border-[#e2dac8]">
          
          {/* LEFT: IMAGE */}
          <div className="w-full md:w-1/2 bg-orange-50 p-6 flex items-center justify-center border-r-4 border-[#e2dac8] relative">
            <div className={`relative w-full h-full rounded-2xl overflow-hidden shadow-inner border-4 border-white transition-opacity duration-300 ${animating ? 'opacity-0' : 'opacity-100'}`}>
               <img 
                 src={currentContent?.image_url || selectedStory.cover_image_url || "https://placehold.co/600x400"} 
                 className="w-full h-full object-cover"
                 alt="Story Scene"
               />
            </div>
          </div>

          {/* RIGHT: TEXT */}
          <div className="w-full md:w-1/2 p-10 flex flex-col relative">
            <div className={`flex-1 flex items-center transition-opacity duration-300 ${animating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
               <div className="text-2xl md:text-3xl leading-[2.2] font-medium font-dyslexic text-slate-800">
                  {renderStoryContent(currentContent?.text || "", selectedStory.focus_letters)}
               </div>
            </div>

            {/* CONTROLS */}
            <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-6">
              <button 
                onClick={() => handlePageChange('prev')} disabled={isFirst}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold ${isFirst ? 'opacity-0' : 'bg-slate-100 hover:bg-orange-100 text-slate-600'}`}
              >
                <ChevronLeft /> Previous
              </button>
              
              <button 
                onClick={() => handlePageChange('next')} disabled={isLast}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold ${isLast ? 'opacity-50 grayscale' : 'bg-orange-500 text-white hover:scale-105 shadow-lg'}`}
              >
                Next <ChevronRight />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- VIEW 3: LIBRARY ---
  return (
    <div className="min-h-screen bg-[#FFFBEB] p-8 flex flex-col items-center">
      <div className="max-w-6xl w-full flex justify-between mb-12">
        <h1 className="text-4xl font-black text-slate-800 flex items-center gap-3">
          <BookOpen size={40} className="text-orange-500" /> My Library
        </h1>
        <button onClick={() => fetchStories(true)} className="bg-white px-6 py-3 rounded-2xl shadow-sm hover:scale-105 text-slate-600 flex gap-2 font-bold">
          <RefreshCcw /> Create New Stories
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full">
        {stories.map((story) => (
          <div 
            key={story.id} 
            onClick={() => { setSelectedStory(story); setCurrentPage(0); }}
            className="group cursor-pointer bg-white rounded-[30px] shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all overflow-hidden flex flex-col h-[450px]"
          >
            {/* Cover Image Area */}
            <div className="h-[250px] overflow-hidden relative">
              <img 
                src={story.cover_image_url || "https://placehold.co/600x400"} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                alt="Cover"
              />
              <div className="absolute top-4 right-4 bg-white/90 px-3 py-1 rounded-full text-xs font-bold text-orange-600 shadow-sm">
                {story.theme}
              </div>
            </div>

            <div className="p-6 flex flex-col flex-1">
              <h3 className="text-2xl font-black text-slate-800 mb-2 leading-tight group-hover:text-orange-600 transition-colors">
                {story.title}
              </h3>
              <p className="text-slate-500 text-sm font-medium mb-4 line-clamp-2">
                {story.pages?.[0]?.text}
              </p>
              <div className="mt-auto flex items-center justify-between text-slate-400 font-bold">
                <span className="text-xs bg-slate-100 px-2 py-1 rounded">
                  {story.pages?.length || 3} Chapters
                </span>
                <div className="flex items-center gap-1 group-hover:text-orange-500">
                  Read <ArrowLeft className="rotate-180" size={18} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}