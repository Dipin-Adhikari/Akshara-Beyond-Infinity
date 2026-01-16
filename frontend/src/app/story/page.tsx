import React from 'react';
import StoryLibrary from '@/components/story/StoryLibrary';

export default function StoryPage() {
  return (
    <main className="min-h-screen bg-[#FFFBEB]">
      {/* This is the main entry point for the Story feature.
        It loads the StoryLibrary, which handles switching between 
        the library view and the reader view internally.
      */}
      <StoryLibrary />
    </main>
  );
}