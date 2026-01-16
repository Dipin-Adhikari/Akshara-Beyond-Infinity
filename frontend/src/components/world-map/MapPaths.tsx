// components/world-map/MapPaths.tsx
import React, { useMemo } from 'react';
import { CONTINENT_GAMES } from './constants';

interface MapPathsProps {
  positions: any[];
}

export default function MapPaths({ positions }: MapPathsProps) {
  const pathSegments = useMemo(() => {
    // Only take the first N positions which correspond to games
    const gamePositions = positions.slice(0, CONTINENT_GAMES.length);
    
    return gamePositions.map((pos, i) => {
      if (i === gamePositions.length - 1) return null;

      const start = pos;
      const end = gamePositions[i + 1];

      const midX = (start.x + end.x) / 2;
      const midY = (start.y + end.y) / 2;
      
      const dx = end.x - start.x;
      const dy = end.y - start.y;
      
      const controlX = midX - dy * 0.3;
      const controlY = midY + dx * 0.3;

      return `M ${start.x},${start.y} Q ${controlX},${controlY} ${end.x},${end.y}`;
    }).filter(Boolean);
  }, [positions]);

  return (
    <svg 
      className="absolute inset-0 w-full h-full z-10 pointer-events-none"
      viewBox="0 0 100 100" 
      preserveAspectRatio="none"
    >
      <defs>
        <marker 
          id="arrowhead" 
          markerWidth="6" 
          markerHeight="6" 
          refX="5" 
          refY="3" 
          orient="auto"
        >
          <path d="M 0 0 L 6 3 L 0 6" fill="#000000" />
        </marker>
      </defs>

      {pathSegments.map((d, i) => (
        <path
          key={i}
          d={d as string}
          fill="none"
          stroke="#000000"
          strokeWidth="0.2"
          strokeDasharray="0.8, 1.5"
          strokeLinecap="round"
          markerEnd="url(#arrowhead)"
          opacity={0.6}
        />
      ))}
    </svg>
  );
}