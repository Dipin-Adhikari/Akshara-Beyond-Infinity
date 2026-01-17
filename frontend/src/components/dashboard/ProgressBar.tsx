"use client";
import React from 'react';
import { motion } from 'framer-motion';

interface ProgressBarProps {
  value: number;
  total?: number;
  color?: 'orange' | 'purple' | 'green' | 'blue' | 'pink';
  height?: string;
  showLabel?: boolean;
  animated?: boolean;
}

export default function ProgressBar({
  value,
  total = 100,
  color = 'orange',
  height = 'h-4',
  showLabel = true,
  animated = true
}: ProgressBarProps) {
  const percentage = (value / total) * 100;

  const colorClasses = {
    orange: 'bg-orange-500',
    purple: 'bg-purple-500',
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    pink: 'bg-pink-500'
  };

  return (
    <div className="w-full">
      <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${height}`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className={`${colorClasses[color]} h-full rounded-full transition-all`}
        />
      </div>
      {showLabel && (
        <p className="text-sm font-semibold text-gray-700 mt-2">
          {value} / {total} ({percentage.toFixed(0)}%)
        </p>
      )}
    </div>
  );
}
