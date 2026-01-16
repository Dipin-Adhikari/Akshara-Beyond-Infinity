// components/world-map/MapCreature.tsx
import React from 'react';

interface MapCreatureProps {
  index: number;
  position: { x: number; y: number; isDragging: boolean };
  imageSrc: string;
  width: number;
  height: number;
  alt: string;
  animationStyle?: React.CSSProperties;
  scaleX?: number; // -1 to flip horizontally
  onPointerDown: (index: number, e: React.PointerEvent) => void;
}

export default function MapCreature({
  index,
  position,
  imageSrc,
  width,
  height,
  alt,
  animationStyle = {},
  scaleX = 1,
  onPointerDown
}: MapCreatureProps) {
  return (
    <div
      className="absolute cursor-grab active:cursor-grabbing transition-transform pointer-events-auto"
      style={{
        top: `${position.y}%`,
        left: `${position.x}%`,
        transform: `translate(-50%, -50%) scale(${position.isDragging ? 1.1 : 1}) scaleX(${scaleX})`,
        zIndex: 13
      }}
      onPointerDown={(e) => onPointerDown(index, e)}
    >
      <img
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        className="object-contain drop-shadow-xl"
        style={animationStyle}
      />
    </div>
  );
}