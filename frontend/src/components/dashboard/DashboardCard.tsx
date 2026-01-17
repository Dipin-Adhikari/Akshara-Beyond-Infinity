"use client";
import React from 'react';
import { motion } from 'framer-motion';

interface DashboardCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: React.ReactNode;
  color: 'orange' | 'purple' | 'green' | 'blue' | 'pink';
  size?: 'small' | 'medium' | 'large';
}

const colorMap = {
  orange: 'bg-gradient-to-br from-orange-400 to-orange-500 text-white',
  purple: 'bg-gradient-to-br from-purple-400 to-purple-500 text-white',
  green: 'bg-gradient-to-br from-green-400 to-green-500 text-white',
  blue: 'bg-gradient-to-br from-blue-400 to-blue-500 text-white',
  pink: 'bg-gradient-to-br from-pink-400 to-pink-500 text-white'
};

export default function DashboardCard({ 
  title, 
  value, 
  unit = '', 
  icon, 
  color, 
  size = 'medium' 
}: DashboardCardProps) {
  const sizeClass = {
    small: 'p-4',
    medium: 'p-6',
    large: 'p-8'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}
      className={`rounded-3xl ${colorMap[color]} shadow-lg transition-all cursor-pointer ${sizeClass[size]}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="text-4xl">{icon}</div>
      </div>
      <h3 className="text-sm font-semibold opacity-90 mb-2">{title}</h3>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-black">{value}</span>
        {unit && <span className="text-sm opacity-75">{unit}</span>}
      </div>
    </motion.div>
  );
}
