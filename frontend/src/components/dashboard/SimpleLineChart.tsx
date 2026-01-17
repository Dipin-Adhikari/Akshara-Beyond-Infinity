"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface SimpleLineChartProps {
  data: number[];
  title?: string;
  height?: number;
  color?: string;
}

export default function SimpleLineChart({
  data,
  title,
  height = 120,
  color = 'rgb(249, 115, 22)' // orange-400
}: SimpleLineChartProps) {
  if (!data || data.length === 0) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  // Calculate points for SVG
  const width = 100;
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1 || 1)) * width;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  // Calculate trend
  const trend = data.length >= 2 ? data[data.length - 1] - data[0] : 0;
  const isTrendingUp = trend >= 0;

  return (
    <div className="w-full">
      {title && <p className="text-sm font-semibold text-gray-700 mb-2">{title}</p>}
      
      <div className="flex items-end gap-3">
        <svg width="100%" height={height + 20} viewBox={`0 0 ${width} ${height + 20}`} className="flex-1">
          {/* Grid lines */}
          {[0, 0.5, 1].map((ratio, i) => (
            <line
              key={i}
              x1="0"
              y1={height * ratio}
              x2={width}
              y2={height * ratio}
              stroke="#e5e7eb"
              strokeWidth="0.5"
            />
          ))}
          
          {/* Line */}
          <polyline
            points={points}
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Dots */}
          {data.map((value, index) => {
            const x = (index / (data.length - 1 || 1)) * width;
            const y = height - ((value - min) / range) * height;
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="2"
                fill={color}
                opacity="0.7"
              />
            );
          })}
        </svg>

        {/* Trend indicator */}
        <div className="flex flex-col items-center">
          {isTrendingUp ? (
            <TrendingUp className="text-green-500" size={20} />
          ) : (
            <TrendingDown className="text-red-500" size={20} />
          )}
          <span className="text-xs font-semibold text-gray-600 mt-1">
            {Math.abs(trend).toFixed(0)}%
          </span>
        </div>
      </div>
    </div>
  );
}
