"use client";
import React, { useState, useMemo } from 'react';
import { Volume2, Combine, Scissors, ArrowLeftRight } from 'lucide-react';

const CONTINENT_GAMES = [
  { 
    id: 'twin-letters', 
    continent: 'North America',
    title: 'Twin Letters', 
    icon: <ArrowLeftRight size={24} />,
    position: { top: 83, left: 17 }, 
    color: '#8B5FBF',
    hoverColor: '#B98FD6'
  },
  { 
    id: 'sound-slicer', 
    continent: 'South America',
    title: 'Sound Slicer', 
    icon: <Scissors size={24} />,
    position: { top: 33, left: 30 },
    color: '#35A853',
    hoverColor: '#5BD17C'
  },
  { 
    id: 'sound-safari', 
    continent: 'Africa',
    title: 'Sound Safari', 
    icon: <Volume2 size={24} />,
    position: { top: 47, left: 58 },
    color: '#FF6B35',
    hoverColor: '#FF8A5C'
  },
  { 
    id: 'word-builder', 
    continent: 'Asia',
    title: 'Word Builder', 
    icon: <Combine size={24} />,
    position: { top: 19, left: 68 },
    color: '#2B9EB3',
    hoverColor: '#4ECDC4'
  },
];

export default function InteractiveWorldMap() {
  const [hoveredGame, setHoveredGame] = useState<string | null>(null);
  const [clickedGame, setClickedGame] = useState<string | null>(null);
  const [boatFrame, setBoatFrame] = useState(1);
  
  // Physics state for each game circle + boat + ocean creatures
  const [positions, setPositions] = useState(
    [
      ...CONTINENT_GAMES.map(game => ({
        x: game.position.left,
        y: game.position.top,
        vx: (Math.random() - 0.5) * 0.02,
        vy: (Math.random() - 0.5) * 0.02,
        isDragging: false,
        dragOffsetX: 0,
        dragOffsetY: 0
      })),
      // Boat position
      {
        x: 10,
        y: 3,
        vx: 0.015,
        vy: 0,
        isDragging: false,
        dragOffsetX: 0,
        dragOffsetY: 0
      },
      // Tortuga (Pacific Ocean - between South America and Asia)
      {
        x: 80,
        y: 80,
        vx: -0.01,
        vy: 0.005,
        isDragging: false,
        dragOffsetX: 0,
        dragOffsetY: 0
      },
      // Flying Whale (Atlantic Ocean - between North America and Africa)
      {
        x: 45,
        y: 30,
        vx: 0.012,
        vy: 0.008,
        isDragging: false,
        dragOffsetX: 0,
        dragOffsetY: 0
      },
      // 3 Fish (Indian Ocean - near Africa/Asia)
      {
        x: 70,
        y: 60,
        vx: 0.008,
        vy: -0.006,
        isDragging: false,
        dragOffsetX: 0,
        dragOffsetY: 0
      },
      // Red Fish (Southern Ocean - near Antarctica)
      {
        x: 55,
        y: 85,
        vx: -0.015,
        vy: 0.003,
        isDragging: false,
        dragOffsetX: 0,
        dragOffsetY: 0
      },
      // Crab (Near Brazil coast)
      {
        x: 32,
        y: 55,
        vx: 0.008,
        vy: -0.007,
        isDragging: false,
        dragOffsetX: 0,
        dragOffsetY: 0
      }
    ]
  );

  // Animate boat paddling frames
  React.useEffect(() => {
    const interval = setInterval(() => {
      setBoatFrame(prev => (prev % 6) + 1);
    }, 200);
    return () => clearInterval(interval);
  }, []);

  // Physics animation loop
  React.useEffect(() => {
    const interval = setInterval(() => {
      setPositions(prev => prev.map((pos, i) => {
        if (pos.isDragging) return pos;

        let { x, y, vx, vy } = pos;
        
        // Apply velocity
        x += vx;
        y += vy;
        
        // Boundary checking with bounce
        const padding = 8;
        if (x <= padding || x >= 100 - padding) {
          vx = -vx * 0.5;
          x = x <= padding ? padding : 100 - padding;
        }
        if (y <= padding || y >= 100 - padding) {
          vy = -vy * 0.5;
          y = y <= padding ? padding : 100 - padding;
        }
        
        // Damping
        vx *= 0.98;
        vy *= 0.98;
        
        return { ...pos, x, y, vx, vy };
      }));
    }, 50);
    
    return () => clearInterval(interval);
  }, []);

  // Mouse/Touch handlers for dragging
  const handlePointerDown = (index: number, e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const rect = e.currentTarget.getBoundingClientRect();
    const parentRect = e.currentTarget.offsetParent?.getBoundingClientRect();
    if (!parentRect) return;
    
    setPositions(prev => prev.map((pos, i) => 
      i === index 
        ? { 
            ...pos, 
            isDragging: true,
            dragOffsetX: (e.clientX - rect.left) / parentRect.width * 100,
            dragOffsetY: (e.clientY - rect.top) / parentRect.height * 100
          }
        : pos
    ));
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const draggedIndex = positions.findIndex(p => p.isDragging);
    if (draggedIndex === -1) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const newX = ((e.clientX - rect.left) / rect.width * 100);
    const newY = ((e.clientY - rect.top) / rect.height * 100);

    setPositions(prev => prev.map((pos, i) => {
      if (i !== draggedIndex) return pos;
      
      const deltaX = newX - pos.x;
      const deltaY = newY - pos.y;
      
      return {
        ...pos,
        x: Math.max(8, Math.min(92, newX)),
        y: Math.max(8, Math.min(92, newY)),
        vx: deltaX * 0.1,
        vy: deltaY * 0.1
      };
    }));
  };

  const handlePointerUp = () => {
    setPositions(prev => prev.map(pos => ({ ...pos, isDragging: false })));
  };

  // Generate curved dashed paths between circles (excluding boat and creatures)
  const pathSegments = useMemo(() => {
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

  const handleClick = (gameId: string) => {
    setClickedGame(gameId);
    setTimeout(() => setClickedGame(null), 300);
  };

  return (
    <div 
      className="relative min-h-screen w-full overflow-hidden touch-none select-none"
      style={{
        backgroundImage: 'url(/world-map.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: '#4CC9F0'
      }}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >

      {/* SVG Layer for Dashed Lines */}
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

      {/* Static Seagull with Tilt Animation */}
      <div
        className="absolute pointer-events-none z-12"
        style={{
          top: '50%',
          left: '20%',
          transform: 'translate(-50%, -50%)',
          animation: 'seagullTilt 3s ease-in-out infinite'
        }}
      >
        <img
          src="/seagull.png"
          alt="Seagull"
          width={150}
          height={150}
          className="object-contain drop-shadow-lg"
        />
      </div>

      {/* Whale on Right Side with Tilt Animation */}
      <div
        className="absolute pointer-events-none z-12"
        style={{
          top: '50%',
          right: '10%',
          transform: 'translateY(-50%)',
          animation: 'whaleTilt 4s ease-in-out infinite'
        }}
      >
        <img
          src="/whale.png"
          alt="Whale"
          width={200}
          height={200}
          className="object-contain drop-shadow-lg"
        />
      </div>

      {/* Animated Boat - Slow movement across top */}
      <div
        className="absolute cursor-grab active:cursor-grabbing transition-transform pointer-events-auto"
        style={{
          top: `${positions[4].y}%`,
          left: `${positions[4].x}%`,
          transform: `translate(-50%, -50%) scale(${positions[4].isDragging ? 1.1 : 1})`,
          zIndex: 15
        }}
        onPointerDown={(e) => handlePointerDown(4, e)}
      >
        <img
          src={`/boat0${boatFrame}.png`}
          alt="Paddling Boat"
          width={100}
          height={100}
          className="object-contain drop-shadow-2xl"
        />
      </div>

      {/* Ocean Creatures */}
      
      {/* Tortuga - Swimming left */}
      <div
        className="absolute cursor-grab active:cursor-grabbing transition-transform pointer-events-auto"
        style={{
          top: `${positions[5].y}%`,
          left: `${positions[5].x}%`,
          transform: `translate(-50%, -50%) scale(${positions[5].isDragging ? 1.1 : 1}) scaleX(-1)`,
          zIndex: 13
        }}
        onPointerDown={(e) => handlePointerDown(5, e)}
      >
        <img
          src="/tortuga.png"
          alt="Sea Turtle"
          width={120}
          height={120}
          className="object-contain drop-shadow-xl"
          style={{ animation: 'bobbing 3s ease-in-out infinite' }}
        />
      </div>

      {/* Flying Whale - Swimming right */}
      <div
        className="absolute cursor-grab active:cursor-grabbing transition-transform pointer-events-auto"
        style={{
          top: `${positions[6].y}%`,
          left: `${positions[6].x}%`,
          transform: `translate(-50%, -50%) scale(${positions[6].isDragging ? 1.1 : 1})`,
          zIndex: 13
        }}
        onPointerDown={(e) => handlePointerDown(6, e)}
      >
        <img
          src="/flywhale.png"
          alt="Flying Whale"
          width={140}
          height={140}
          className="object-contain drop-shadow-xl"
          style={{ animation: 'floating 4s ease-in-out infinite' }}
        />
      </div>

      {/* 3 Fish - Swimming right */}
      <div
        className="absolute cursor-grab active:cursor-grabbing transition-transform pointer-events-auto"
        style={{
          top: `${positions[7].y}%`,
          left: `${positions[7].x}%`,
          transform: `translate(-50%, -50%) scale(${positions[7].isDragging ? 1.1 : 1})`,
          zIndex: 13
        }}
        onPointerDown={(e) => handlePointerDown(7, e)}
      >
        <img
          src="/3fish.png"
          alt="Three Fish"
          width={110}
          height={110}
          className="object-contain drop-shadow-xl"
          style={{ animation: 'swimming 2.5s ease-in-out infinite' }}
        />
      </div>

      {/* Red Fish - Swimming left */}
      <div
        className="absolute cursor-grab active:cursor-grabbing transition-transform pointer-events-auto"
        style={{
          top: `${positions[8].y}%`,
          left: `${positions[8].x}%`,
          transform: `translate(-50%, -50%) scale(${positions[8].isDragging ? 1.1 : 1}) scaleX(-1)`,
          zIndex: 13
        }}
        onPointerDown={(e) => handlePointerDown(8, e)}
      >
        <img
          src="/redfish.png"
          alt="Red Fish"
          width={100}
          height={100}
          className="object-contain drop-shadow-xl"
          style={{ animation: 'swimming 3s ease-in-out infinite' }}
        />
      </div>

      {/* Crab - Near Brazil */}
      <div
        className="absolute cursor-grab active:cursor-grabbing transition-transform pointer-events-auto"
        style={{
          top: `${positions[9].y}%`,
          left: `${positions[9].x}%`,
          transform: `translate(-50%, -50%) scale(${positions[9].isDragging ? 1.1 : 1})`,
          zIndex: 13
        }}
        onPointerDown={(e) => handlePointerDown(9, e)}
      >
        <img
          src="/crab.png"
          alt="Crab"
          width={90}
          height={90}
          className="object-contain drop-shadow-xl"
          style={{ animation: 'crabWalk 2s ease-in-out infinite' }}
        />
      </div>

      {/* Game Buttons Container */}
      <div className="relative z-20 w-full h-screen">
        {CONTINENT_GAMES.map((game, index) => (
          <div
            key={game.id}
            className="absolute cursor-grab active:cursor-grabbing transition-transform"
            style={{
              top: `${positions[index].y}%`,
              left: `${positions[index].x}%`,
              transform: `translate(-50%, -50%) scale(${positions[index].isDragging ? 1.1 : 1})`,
            }}
            onPointerDown={(e) => handlePointerDown(index, e)}
          >
            <div className="relative flex flex-col items-center group">
              {/* Game Label */}
              {hoveredGame === game.id && (
                <div className="absolute bottom-full mb-3 z-30 animate-in fade-in slide-in-from-bottom-2 duration-200">
                  <div 
                    className="px-4 py-1.5 rounded-xl shadow-lg text-white font-bold text-sm whitespace-nowrap border-2 border-white"
                    style={{ backgroundColor: game.color }}
                  >
                    {game.title}
                  </div>
                </div>
              )}

              {/* Game Button */}
              <button
                onMouseEnter={() => setHoveredGame(game.id)}
                onMouseLeave={() => setHoveredGame(null)}
                onClick={() => handleClick(game.id)}
                className="relative pointer-events-auto transition-transform active:scale-90"
              >
                {/* Outer glow ring */}
                <div
                  className="absolute inset-0 rounded-full blur-md opacity-40"
                  style={{ 
                    backgroundColor: game.color,
                    transform: 'scale(1.15)'
                  }}
                ></div>
                
                {/* Main button */}
                <div
                  className="relative w-16 h-16 md:w-20 md:h-20 rounded-full shadow-2xl border-[3px] flex items-center justify-center transition-all duration-300"
                  style={{ 
                    backgroundColor: hoveredGame === game.id ? game.hoverColor : game.color,
                    borderColor: 'white',
                    boxShadow: `0 4px 20px rgba(0,0,0,0.3), inset 0 -2px 8px rgba(0,0,0,0.2), 0 0 0 2px ${game.color}`
                  }}
                >
                  <div className="text-white drop-shadow-md">
                    {React.cloneElement(game.icon, { size: 20 })}
                  </div>
                  
                  {/* Top shine */}
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-8 h-3 bg-white/40 rounded-full blur-sm"></div>
                  
                  {/* Side highlight */}
                  <div className="absolute top-1/4 left-2 w-2 h-8 bg-white/20 rounded-full blur-[2px]"></div>
                  
                  {/* Bottom inner shadow effect */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-b from-transparent via-transparent to-black/10"></div>
                </div>
              </button>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes animate-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-in {
          animation: animate-in 0.5s ease-out;
        }

        @keyframes seagullTilt {
          0%, 100% {
            transform: translate(-50%, -50%) rotate(5deg);
          }
          50% {
            transform: translate(-50%, -50%) rotate(-5deg);
          }
        }

        @keyframes whaleTilt {
          0%, 100% {
            transform: translateY(-50%) rotate(-4deg);
          }
          50% {
            transform: translateY(-50%) rotate(4deg);
          }
        }

        @keyframes bobbing {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        @keyframes floating {
          0%, 100% {
            transform: translateY(0px) rotate(-2deg);
          }
          50% {
            transform: translateY(-12px) rotate(2deg);
          }
        }

        @keyframes swimming {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
          }
          25% {
            transform: translateY(-5px) translateX(3px);
          }
          50% {
            transform: translateY(0px) translateX(0px);
          }
          75% {
            transform: translateY(5px) translateX(-3px);
          }
        }

        @keyframes crabWalk {
          0%, 100% {
            transform: translateX(0px) rotate(0deg);
          }
          25% {
            transform: translateX(-4px) rotate(-3deg);
          }
          50% {
            transform: translateX(0px) rotate(0deg);
          }
          75% {
            transform: translateX(4px) rotate(3deg);
          }
        }
      `}</style>
    </div>
  );
}