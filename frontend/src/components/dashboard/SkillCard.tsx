"use client";
import React from 'react';
import { motion } from 'framer-motion';
import ProgressBar from './ProgressBar';

interface SkillCardProps {
  name: string;
  accuracy: number;
  level: number;
  attempts: number;
  recent_accuracy: number[];
}

export default function SkillCard({
  name,
  accuracy,
  level,
  attempts,
  recent_accuracy
}: SkillCardProps) {
  const getAccuracyColor = (acc: number): 'orange' | 'purple' | 'green' | 'blue' | 'pink' => {
    if (acc >= 80) return 'green';
    if (acc >= 60) return 'orange';
    return 'blue';
  };

  const getTrendArrow = (recent: number[]) => {
    if (recent.length < 2) return '→';
    const lastThree = recent.slice(-3);
    const trend = lastThree.reduce((a, b) => a + b, 0) / lastThree.length;
    return trend >= 0.66 ? '↗️' : trend >= 0.33 ? '→' : '↘️';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-2xl p-4 shadow-md border border-gray-100 hover:shadow-lg transition-all"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-black text-slate-800">{name}</h4>
          <p className="text-xs text-slate-500">Level {level}</p>
        </div>
        <div className="text-2xl">{getTrendArrow(recent_accuracy)}</div>
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <ProgressBar 
          value={accuracy} 
          total={100} 
          color={getAccuracyColor(accuracy)}
          height="h-3"
          showLabel={false}
        />
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold text-slate-700">{accuracy}% Accuracy</span>
        <span className="text-slate-500">{attempts} attempts</span>
      </div>
    </motion.div>
  );
}
