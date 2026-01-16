import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface StoryCardProps {
  story: any;
  onClick: () => void;
}

export default function StoryCard({ story, onClick }: StoryCardProps) {
  return (
    <div 
      onClick={onClick}
      className="group cursor-pointer bg-white rounded-[30px] shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all overflow-hidden flex flex-col h-[450px]"
    >
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
        <h3 className="text-xl font-black text-slate-800 mb-2 leading-tight group-hover:text-orange-600 transition-colors">
          {story.title}
        </h3>
        <p className="text-slate-500 text-sm font-medium mb-4 line-clamp-2">
          {story.pages?.[0]?.text}
        </p>
        <div className="mt-auto flex items-center justify-between text-slate-400 font-bold">
          <span className="text-xs bg-slate-100 px-2 py-1 rounded">
            {story.pages?.length || 3} Chapters
          </span>
          <div className="flex items-center gap-1 group-hover:text-orange-500 text-sm">
            Read <ArrowLeft className="rotate-180" size={16} />
          </div>
        </div>
      </div>
    </div>
  );
}