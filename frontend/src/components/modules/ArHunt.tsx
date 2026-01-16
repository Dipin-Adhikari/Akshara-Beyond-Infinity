'use client';
import React, { useRef, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useHandTracking } from '@/hooks/useHandTracking';

// --- Types matched to Backend Response ---
interface ArOption {
  id: string;
  name: string; // Used for logic/TTS/alt text
  is_correct: boolean;
  image_url: string;
  pos: 'top' | 'bottom' | 'left' | 'right'; 
}

interface ArLevel {
  task_id: string;
  level: number;
  epoch: number;
  prompt: string;
  target_word: string;
  audio_url?: string;
  options: ArOption[];
}

export default function ArHunt({ userId }: { userId: string }) {
  const router = useRouter();
  
  // --- MediaPipe Refs ---
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { loading: aiLoading, handData } = useHandTracking(videoRef, canvasRef);

  // --- Game State ---
  const [levelData, setLevelData] = useState<ArLevel | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [score, setScore] = useState(0);
  const selectionLock = useRef(false);

  // --- 1. Fetch Question from API ---
  const fetchLevel = async () => {
    try {
      setLoading(true);
      selectionLock.current = false;
      

      const res = await fetch('http://localhost:8000/api/module/ar-hunt/');
      
      if (!res.ok) throw new Error("Failed to load level");
      
      const data = await res.json();
      
      // Assign fixed positions to the shuffled options
      const positions = ['top', 'bottom', 'left', 'right'] as const;
      
      const mappedOptions = data.options.map((opt: any, i: number) => ({
        ...opt,
        // Fallback: If it's a 3D model url, use a 2D icon instead
        image_url: getDisplayImage(opt.name, opt.image_url),
        pos: positions[i] || 'top'
      }));

      setLevelData({
        ...data,
        options: mappedOptions
      });

      // Play Audio Prompt
      if (data.audio_url) {
        new Audio(data.audio_url).play().catch(() => playTTS(data.prompt));
      } else {
        playTTS(data.prompt);
      }

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Helper: Visual Fallback for 3D Models
  const getDisplayImage = (name: string, url: string) => {
    const safeName = name || 'object';
    // If URL is missing or points to a GLB/GLTF file (which <img> tag can't show), use Icon fallback
    if (!url || url.endsWith('.gltf') || url.endsWith('.glb')) {
      return `https://img.icons8.com/color/96/${safeName.toLowerCase()}.png`;
    }
    return url;
  };

  // Helper: Text-to-Speech
  const playTTS = (text: string) => {
    const u = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(u);
  };

  // Initial Load
  useEffect(() => { fetchLevel(); }, []);

  // --- 2. Hit Detection Logic ---
  useEffect(() => {
    if (!handData || !levelData || feedback || selectionLock.current) return;

    // Detect if hand is in "Fist" gesture (Grab action)
    if (handData.isFist) {
      levelData.options.forEach((opt) => {
        const targetPos = getPosCoords(opt.pos);
        
        // Calculate Distance between Hand and Option
        const dist = Math.sqrt(
          Math.pow(handData.x - targetPos.x, 2) + 
          Math.pow(handData.y - targetPos.y, 2)
        );
        
        // Hit Radius (12% of screen width)
        if (dist < 12) {
          handleSelection(opt);
        }
      });
    }
  }, [handData, levelData, feedback]);

  // --- 3. Handle User Selection ---
  const handleSelection = async (opt: ArOption) => {
    selectionLock.current = true;
    const isCorrect = opt.is_correct;

    // UI Feedback
    setFeedback(isCorrect ? 'correct' : 'wrong');
    playTTS(isCorrect ? "You found it!" : `That is a ${opt.name || 'wrong item'}. Try again.`);

    // Report to Database (UserId is used here!)
    if (levelData) {
      fetch('/api/report-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          module_id: 'ar-hunt',
          level: levelData.level,
          epoch: levelData.epoch,
          selected_id: opt.id,
          is_correct: isCorrect,
          response_time_ms: 0 
        })
      }).catch(e => console.error(e));
    }

    if (isCorrect) {
      setScore(s => s + 10);
      setTimeout(() => {
        setFeedback(null);
        fetchLevel(); // Load next random question
      }, 2000);
    } else {
      setTimeout(() => {
        setFeedback(null);
        selectionLock.current = false;
      }, 1500);
    }
  };

  // Helper: Get CSS % Coordinates based on position name
  const getPosCoords = (pos: string) => {
    switch(pos) {
      case 'top': return { x: 50, y: 20 };
      case 'bottom': return { x: 50, y: 80 };
      case 'left': return { x: 20, y: 50 };
      case 'right': return { x: 80, y: 50 };
      default: return { x: 50, y: 50 };
    }
  };

  // --- RENDER ---
  if (aiLoading) return <div className="text-center p-10 font-bold text-slate-600">Initializing AR Camera...</div>;

  return (
    <div className="relative w-full max-w-4xl mx-auto h-[600px] bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-200">
      
      {/* 1. Video Layer (Mirrored) */}
      <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover scale-x-[-1] opacity-70" playsInline muted autoPlay />
      
      {/* 2. Skeleton Canvas */}
      <canvas ref={canvasRef} width={1280} height={720} className="absolute inset-0 w-full h-full pointer-events-none opacity-60" />

      {/* 3. HUD */}
      <div className="absolute top-4 left-0 w-full flex flex-col items-center z-20 pointer-events-none">
        <div className="bg-white/90 px-8 py-3 rounded-full shadow-lg border-b-4 border-slate-300 backdrop-blur-md mb-2">
          <h2 className="text-xl font-black text-slate-800 tracking-wide">
            {levelData ? levelData.prompt : "Loading..."}
          </h2>
        </div>
        
        <div className="bg-yellow-400 text-yellow-900 px-4 py-1 rounded-full font-bold text-sm shadow-sm border border-yellow-200">
          Score: {score}
        </div>

        {feedback && (
           <div className={`mt-4 px-8 py-4 rounded-2xl text-white font-extrabold text-3xl animate-bounce shadow-xl
             ${feedback === 'correct' ? 'bg-green-500 ring-4 ring-green-200' : 'bg-red-500 ring-4 ring-red-200'}`}>
             {feedback === 'correct' ? "🎉 Found it!" : "❌ Oops!"}
           </div>
        )}
      </div>

      {/* 4. Interactive Objects */}
      {!loading && levelData && levelData.options.map((opt) => {
        const coords = getPosCoords(opt.pos);
        const isTarget = opt.is_correct && feedback === 'correct';
        
        return (
          <div key={opt.id} 
               className={`absolute w-36 h-36 flex flex-col items-center justify-center transition-all duration-300
                 ${isTarget ? 'scale-125 z-30' : 'z-10 hover:scale-105'}`}
               style={{ left: `${coords.x}%`, top: `${coords.y}%`, transform: 'translate(-50%, -50%)' }}>
            
            {/* Card Container - Label Removed */}
            <div className={`relative p-4 rounded-2xl shadow-xl border-b-4 transition-colors duration-300
              ${feedback === 'wrong' && !opt.is_correct ? 'bg-red-100 border-red-300' : 'bg-white border-slate-200'}`}>
              
              <img 
                src={opt.image_url} 
                alt={opt.name || "item"} 
                className="w-20 h-20 object-contain drop-shadow-md" 
                onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://img.icons8.com/color/96/question-mark.png';
                }}
              />
            </div>
          </div>
        );
      })}

      {/* 5. Hand Cursor */}
      {handData && (
        <div 
          className={`absolute w-16 h-16 rounded-full border-4 flex items-center justify-center transition-transform duration-100 z-50 pointer-events-none
            ${handData.isFist 
              ? 'bg-yellow-400/50 border-yellow-200 scale-90 ring-4 ring-yellow-400/30' 
              : 'bg-blue-400/30 border-white/80 border-dashed animate-pulse'}`}
          style={{ left: `${handData.x}%`, top: `${handData.y}%`, transform: 'translate(-50%, -50%)' }}
        >
          {handData.isFist ? (
            <span className="text-3xl filter drop-shadow-md">✊</span>
          ) : (
            <span className="text-3xl filter drop-shadow-md">✋</span>
          )}
        </div>
      )}

    </div>
  );
}