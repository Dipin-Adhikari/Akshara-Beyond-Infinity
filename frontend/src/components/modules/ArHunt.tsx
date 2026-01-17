'use client';
import React, { useRef, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useHandTracking } from '@/hooks/useHandTracking';

// --- Types matched to Backend Response ---
interface ArOption {
  id: string;
  name: string;
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

  // --- Fetch Level ---
  const fetchLevel = async () => {
    try {
      setLoading(true);
      selectionLock.current = false;

      const res = await fetch('http://localhost:8000/api/modules/ar-hunt');

      if (!res.ok) throw new Error("Failed to load level");

      const data = await res.json();

      const positions = ['top', 'bottom', 'left', 'right'] as const;

      const mappedOptions = data.options.map((opt: any, i: number) => ({
        ...opt,
        image_url: getDisplayImage(opt.name, opt.image_url),
        pos: positions[i] || 'top'
      }));

      setLevelData({
        ...data,
        options: mappedOptions
      });

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

  // --- Helpers ---
  const getDisplayImage = (name: string, url: string) => {
    const safeName = name || 'object';
    if (!url || url.endsWith('.gltf') || url.endsWith('.glb')) {
      return `https://img.icons8.com/color/96/${safeName.toLowerCase()}.png`;
    }
    return url;
  };

  const playTTS = (text: string) => {
    const u = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(u);
  };

  useEffect(() => { fetchLevel(); }, []);

  // --- Hit Detection ---
  useEffect(() => {
    if (!handData || !levelData || feedback || selectionLock.current) return;

    if (handData.isFist) {
      levelData.options.forEach((opt) => {
        const targetPos = getPosCoords(opt.pos);

        const dist = Math.sqrt(
          Math.pow(handData.x - targetPos.x, 2) +
          Math.pow(handData.y - targetPos.y, 2)
        );

        if (dist < 12) {
          handleSelection(opt);
        }
      });
    }
  }, [handData, levelData, feedback]);

  const handleSelection = async (opt: ArOption) => {
    selectionLock.current = true;
    const isCorrect = opt.is_correct;

    setFeedback(isCorrect ? 'correct' : 'wrong');
    playTTS(isCorrect ? "You found it!" : `That is a ${opt.name}. Try again.`);

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
      }).catch(console.error);
    }

    if (isCorrect) {
      setScore(s => s + 10);
      setTimeout(() => {
        setFeedback(null);
        fetchLevel();
      }, 2000);
    } else {
      setTimeout(() => {
        setFeedback(null);
        selectionLock.current = false;
      }, 1500);
    }
  };

  const getPosCoords = (pos: string) => {
    switch (pos) {
      case 'top': return { x: 50, y: 20 };
      case 'bottom': return { x: 50, y: 80 };
      case 'left': return { x: 20, y: 50 };
      case 'right': return { x: 80, y: 50 };
      default: return { x: 50, y: 50 };
    }
  };

  if (aiLoading) return <div className="p-10 text-center">Initializing AR Camera...</div>;

  return (
    <div className="relative w-full max-w-4xl mx-auto h-[600px] bg-slate-900 rounded-3xl overflow-hidden">
      <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover scale-x-[-1] opacity-70" autoPlay muted />
      <canvas ref={canvasRef} width={1280} height={720} className="absolute inset-0 w-full h-full pointer-events-none" />

      {!loading && levelData && levelData.options.map((opt) => {
        const coords = getPosCoords(opt.pos);
        return (
          <div key={opt.id}
            className="absolute w-36 h-36"
            style={{ left: `${coords.x}%`, top: `${coords.y}%`, transform: 'translate(-50%, -50%)' }}>
            <img src={opt.image_url} className="w-full h-full object-contain" />
          </div>
        );
      })}
    </div>
  );
}
