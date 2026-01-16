// components/world-map/GameNode.tsx
import React from 'react';

interface GameNodeProps {
  game: any;
  index: number;
  position: { x: number; y: number; isDragging: boolean };
  isHovered: boolean;
  setHoveredGame: (id: string | null) => void;
  onClick: (id: string) => void;
  onPointerDown: (index: number, e: React.PointerEvent) => void;
}

export default function GameNode({
  game,
  index,
  position,
  isHovered,
  setHoveredGame,
  onClick,
  onPointerDown
}: GameNodeProps) {
  return (
    <div
      className="absolute cursor-grab active:cursor-grabbing transition-transform"
      style={{
        top: `${position.y}%`,
        left: `${position.x}%`,
        transform: `translate(-50%, -50%) scale(${position.isDragging ? 1.1 : 1})`,
      }}
      onPointerDown={(e) => onPointerDown(index, e)}
    >
      <div className="relative flex flex-col items-center group">
        {/* Hover Label */}
        {isHovered && (
          <div className="absolute bottom-full mb-3 z-30 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div 
              className="px-4 py-1.5 rounded-xl shadow-lg text-white font-bold text-sm whitespace-nowrap border-2 border-white"
              style={{ backgroundColor: game.color }}
            >
              {game.title}
            </div>
          </div>
        )}

        {/* Button */}
        <button
          onMouseEnter={() => setHoveredGame(game.id)}
          onMouseLeave={() => setHoveredGame(null)}
          onClick={() => onClick(game.id)}
          className="relative pointer-events-auto transition-transform active:scale-90"
        >
          {/* Glow Ring */}
          <div
            className="absolute inset-0 rounded-full blur-md opacity-40"
            style={{ 
              backgroundColor: game.color,
              transform: 'scale(1.15)'
            }}
          ></div>
          
          {/* Main Circle */}
          <div
            className="relative w-16 h-16 md:w-20 md:h-20 rounded-full shadow-2xl border-[3px] flex items-center justify-center transition-all duration-300"
            style={{ 
              backgroundColor: isHovered ? game.hoverColor : game.color,
              borderColor: 'white',
              boxShadow: `0 4px 20px rgba(0,0,0,0.3), inset 0 -2px 8px rgba(0,0,0,0.2), 0 0 0 2px ${game.color}`
            }}
          >
            <div className="text-white drop-shadow-md">
              {React.cloneElement(game.icon, { size: 20 })}
            </div>
            
            {/* Shines */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-8 h-3 bg-white/40 rounded-full blur-sm"></div>
            <div className="absolute top-1/4 left-2 w-2 h-8 bg-white/20 rounded-full blur-[2px]"></div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-b from-transparent via-transparent to-black/10"></div>
          </div>
        </button>
      </div>
    </div>
  );
}