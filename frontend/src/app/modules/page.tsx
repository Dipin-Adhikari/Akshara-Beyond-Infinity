"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Added for navigation
import { CONTINENT_GAMES } from '@/components/world-map/constants';
import MapPaths from '@/components/world-map/MapPaths';
import MapCreature from '@/components/world-map/MapCreature';
import GameNode from '@/components/world-map/GameNode';

export default function InteractiveWorldMap() {
  const router = useRouter();
  const [hoveredGame, setHoveredGame] = useState<string | null>(null);
  const [clickedGame, setClickedGame] = useState<string | null>(null);
  const [boatFrame, setBoatFrame] = useState(1);
  
  // --- PHYSICS SETUP (Identical to original) ---
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
      { x: 10, y: 3, vx: 0.015, vy: 0, isDragging: false, dragOffsetX: 0, dragOffsetY: 0 }, // 4: Boat
      { x: 80, y: 80, vx: -0.01, vy: 0.005, isDragging: false, dragOffsetX: 0, dragOffsetY: 0 }, // 5: Tortuga
      { x: 45, y: 30, vx: 0.012, vy: 0.008, isDragging: false, dragOffsetX: 0, dragOffsetY: 0 }, // 6: Whale
      { x: 70, y: 60, vx: 0.008, vy: -0.006, isDragging: false, dragOffsetX: 0, dragOffsetY: 0 }, // 7: 3 Fish
      { x: 55, y: 85, vx: -0.015, vy: 0.003, isDragging: false, dragOffsetX: 0, dragOffsetY: 0 }, // 8: Red Fish
      { x: 32, y: 55, vx: 0.008, vy: -0.007, isDragging: false, dragOffsetX: 0, dragOffsetY: 0 }  // 9: Crab
    ]
  );

  // Boat Animation Loop
  useEffect(() => {
    const interval = setInterval(() => setBoatFrame(prev => (prev % 6) + 1), 200);
    return () => clearInterval(interval);
  }, []);

  // Physics Loop
  useEffect(() => {
    const interval = setInterval(() => {
      setPositions(prev => prev.map((pos) => {
        if (pos.isDragging) return pos;
        let { x, y, vx, vy } = pos;
        x += vx; y += vy;
        
        const padding = 8;
        if (x <= padding || x >= 100 - padding) { vx = -vx * 0.5; x = x <= padding ? padding : 100 - padding; }
        if (y <= padding || y >= 100 - padding) { vy = -vy * 0.5; y = y <= padding ? padding : 100 - padding; }
        vx *= 0.98; vy *= 0.98;
        return { ...pos, x, y, vx, vy };
      }));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Handlers
  const handlePointerDown = (index: number, e: React.PointerEvent) => {
    e.preventDefault(); e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const parentRect = e.currentTarget.offsetParent?.getBoundingClientRect();
    if (!parentRect) return;
    
    setPositions(prev => prev.map((pos, i) => i === index ? { 
      ...pos, isDragging: true,
      dragOffsetX: (e.clientX - rect.left) / parentRect.width * 100,
      dragOffsetY: (e.clientY - rect.top) / parentRect.height * 100
    } : pos));
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
        ...pos, x: Math.max(8, Math.min(92, newX)), y: Math.max(8, Math.min(92, newY)),
        vx: deltaX * 0.1, vy: deltaY * 0.1
      };
    }));
  };

  const handlePointerUp = () => setPositions(prev => prev.map(pos => ({ ...pos, isDragging: false })));

  const handleClick = (gameId: string) => {
    setClickedGame(gameId);
    setTimeout(() => {
        setClickedGame(null);
        router.push(`/modules/${gameId}`); // Actual navigation
    }, 300);
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
      <MapPaths positions={positions} />

      {/* Decorative Static Elements */}
      <div className="absolute pointer-events-none z-12 top-1/2 left-[20%] -translate-x-1/2 -translate-y-1/2 animate-[seagullTilt_3s_ease-in-out_infinite]">
        <img src="/seagull.png" alt="Seagull" width={150} height={150} className="object-contain drop-shadow-lg" />
      </div>
      <div className="absolute pointer-events-none z-12 top-1/2 right-[10%] -translate-y-1/2 animate-[whaleTilt_4s_ease-in-out_infinite]">
        <img src="/whale.png" alt="Whale" width={200} height={200} className="object-contain drop-shadow-lg" />
      </div>

      {/* --- CREATURES --- */}
      {/* 4. Boat */}
      <MapCreature index={4} position={positions[4]} imageSrc={`/boat0${boatFrame}.png`} width={100} height={100} alt="Boat" onPointerDown={handlePointerDown} style={{ zIndex: 15 }} />
      {/* 5. Tortuga */}
      <MapCreature index={5} position={positions[5]} imageSrc="/tortuga.png" width={120} height={120} alt="Turtle" scaleX={-1} animationStyle={{ animation: 'bobbing 3s ease-in-out infinite' }} onPointerDown={handlePointerDown} />
      {/* 6. Flying Whale */}
      <MapCreature index={6} position={positions[6]} imageSrc="/flywhale.png" width={140} height={140} alt="Flying Whale" animationStyle={{ animation: 'floating 4s ease-in-out infinite' }} onPointerDown={handlePointerDown} />
      {/* 7. 3 Fish */}
      <MapCreature index={7} position={positions[7]} imageSrc="/3fish.png" width={110} height={110} alt="Fish" animationStyle={{ animation: 'swimming 2.5s ease-in-out infinite' }} onPointerDown={handlePointerDown} />
      {/* 8. Red Fish */}
      <MapCreature index={8} position={positions[8]} imageSrc="/redfish.png" width={100} height={100} alt="Red Fish" scaleX={-1} animationStyle={{ animation: 'swimming 3s ease-in-out infinite' }} onPointerDown={handlePointerDown} />
      {/* 9. Crab */}
      <MapCreature index={9} position={positions[9]} imageSrc="/crab.png" width={90} height={90} alt="Crab" animationStyle={{ animation: 'crabWalk 2s ease-in-out infinite' }} onPointerDown={handlePointerDown} />

      {/* --- GAME BUTTONS --- */}
      <div className="relative z-20 w-full h-screen">
        {CONTINENT_GAMES.map((game, index) => (
          <GameNode
            key={game.id}
            game={game}
            index={index}
            position={positions[index]}
            isHovered={hoveredGame === game.id}
            setHoveredGame={setHoveredGame}
            onClick={handleClick}
            onPointerDown={handlePointerDown}
          />
        ))}
      </div>

      {/* --- STYLES --- */}
      <style>{`
        @keyframes seagullTilt { 0%, 100% { transform: translate(-50%, -50%) rotate(5deg); } 50% { transform: translate(-50%, -50%) rotate(-5deg); } }
        @keyframes whaleTilt { 0%, 100% { transform: translateY(-50%) rotate(-4deg); } 50% { transform: translateY(-50%) rotate(4deg); } }
        @keyframes bobbing { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-8px); } }
        @keyframes floating { 0%, 100% { transform: translateY(0px) rotate(-2deg); } 50% { transform: translateY(-12px) rotate(2deg); } }
        @keyframes swimming { 0%, 100% { transform: translateY(0px) translateX(0px); } 25% { transform: translateY(-5px) translateX(3px); } 50% { transform: translateY(0px) translateX(0px); } 75% { transform: translateY(5px) translateX(-3px); } }
        @keyframes crabWalk { 0%, 100% { transform: translateX(0px) rotate(0deg); } 25% { transform: translateX(-4px) rotate(-3deg); } 50% { transform: translateX(0px) rotate(0deg); } 75% { transform: translateX(4px) rotate(3deg); } }
        @keyframes animate-in { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-in { animation: animate-in 0.5s ease-out; }
      `}</style>
    </div>
  );
}