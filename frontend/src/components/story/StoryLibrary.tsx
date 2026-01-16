"use client";
import React, { useState, useEffect } from 'react';
import { BookOpen, RefreshCcw, Loader2 } from 'lucide-react';
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FFFBEB] gap-6">
      <Loader2 className="animate-spin text-orange-500" size={64} />
      <div className="text-xl font-bold text-slate-600 animate-pulse text-center">
        Creating your storybook...<br/>
        <span className="text-sm font-normal text-slate-400">
          Writing text, Painting pictures, Recording voice...
        </span>
      </div>
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

  // --- VIEW 3: LIBRARY MODE ---
  return (
    <div className="min-h-screen bg-[#FFFBEB] p-8 flex flex-col items-center">
      <div className="max-w-6xl w-full flex justify-between mb-12">
        <h1 className="text-4xl font-black text-slate-800 flex items-center gap-3">
          <BookOpen size={40} className="text-orange-500" /> My Library
        </h1>
        <button 
          onClick={() => fetchStories(true)} 
          className="bg-white px-6 py-3 rounded-2xl shadow-sm hover:scale-105 text-slate-600 flex gap-2 font-bold transition-transform"
        >
          <RefreshCcw /> Create New Stories
        </button>
      </div>

      {stories.length === 0 ? (
        <div className="text-center text-slate-400 mt-20">
          No stories found. Click "Create New Stories" to begin!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full">
          {stories.map((story) => (
            <StoryCard 
              key={story.id} 
              story={story} 
              onClick={() => setSelectedStory(story)} 
            />
          ))}
        </div>
      )}
    </div>
  );
}