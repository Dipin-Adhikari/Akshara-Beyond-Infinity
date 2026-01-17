"use client";
import React from 'react';
import { motion } from 'framer-motion';

interface ActivityCardProps {
  id: string;
  title: string;
  description: string;
  emoji: string;
  difficulty: string;
  duration_minutes: number;
  recommended: boolean;
  onClick?: () => void;
}

export default function ActivityCard({
  title,
  description,
  emoji,
  difficulty,
  duration_minutes,
  recommended,
  onClick
}: ActivityCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`rounded-3xl p-6 cursor-pointer transition-all relative overflow-hidden border-2 ${
        recommended 
          ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-orange-300 shadow-lg' 
          : 'bg-gradient-to-br from-blue-50 to-purple-50 border-purple-200 shadow-md'
      }`}
    >
      {/* Recommended badge */}
      {recommended && (
        <div className="absolute top-2 right-2 bg-orange-400 text-white px-3 py-1 rounded-full text-xs font-bold">
          ⭐ Recommended
        </div>
      )}

      {/* Content */}
      <div className="flex items-start gap-4">
        <div className="text-4xl">{emoji}</div>
        <div className="flex-1">
          <h3 className="font-black text-lg text-slate-800 mb-1">{title}</h3>
          <p className="text-sm text-slate-600 mb-3">{description}</p>
          
          {/* Meta info */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold bg-white px-3 py-1 rounded-full text-slate-700">
              {duration_minutes}min
            </span>
            <span className="text-xs font-bold bg-white px-3 py-1 rounded-full text-slate-700 capitalize">
              {difficulty.replace(/_/g, ' ')}
            </span>
          </div>
        </div>
      </div>

      {/* Click indicator */}
      <div className="mt-4 flex items-center justify-end">
        <button className="bg-gradient-to-r from-orange-400 to-orange-500 text-white px-4 py-2 rounded-full font-bold text-sm hover:shadow-lg transition-shadow">
          START →
        </button>
      </div>
    </motion.div>
  );
}
