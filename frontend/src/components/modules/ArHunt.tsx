'use client';

import React, { useRef, useEffect, useState } from 'react';
import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { useRouter } from 'next/navigation';

// --- CONSTANTS ---
const IMG_BASE = "https://img.icons8.com/color/96";
const SELECTION_THRESHOLD_MS = 1000; 
const CURSOR_SMOOTHING = 0.15; 

const GAME_DATA = [
  // --- ENGLISH QUESTIONS ---
  { 
    id: '1', 
    target: 'A', 
    questionAudio: '/audio/en_a.wav', 
    options: [
      { name: 'Apple', letter: 'A', img: `${IMG_BASE}/apple.png`, pos: 'top' },
      { name: 'Ball', letter: 'B', img: `${IMG_BASE}/beach-ball.png`, pos: 'bottom' },
      { name: 'Cat', letter: 'C', img: `${IMG_BASE}/cat.png`, pos: 'left' },
      { name: 'Dog', letter: 'D', img: `${IMG_BASE}/dog.png`, pos: 'right' },
    ]
  },
  { 
    id: '2', 
    target: 'F', 
    questionAudio: '/audio/en_f.wav',
    options: [
      { name: 'Fish', letter: 'F', img: `${IMG_BASE}/fish.png`, pos: 'top' },
      { name: 'House', letter: 'H', img: `${IMG_BASE}/home.png`, pos: 'bottom' },
      { name: 'Sun', letter: 'S', img: `${IMG_BASE}/summer.png`, pos: 'left' },
      { name: 'Car', letter: 'C', img: `${IMG_BASE}/car.png`, pos: 'right' },
    ]
  },
  { 
    id: '3', 
    target: 'M', 
    questionAudio: '/audio/en_m.wav',
    options: [
      { name: 'Monkey', letter: 'M', img: `${IMG_BASE}/mango.png`, pos: 'top' },
      { name: 'Ball', letter: 'B', img: `${IMG_BASE}/beach-ball.png`, pos: 'bottom' },
      { name: 'Banana', letter: 'B', img: `${IMG_BASE}/banana.png`, pos: 'left' },
      { name: 'Elephant', letter: 'E', img: `${IMG_BASE}/elephant.png`, pos: 'right' },
    ]
  },

  // --- NEPALI QUESTIONS ---
  { 
    id: '4', 
    target: 'K', 
    questionAudio: '/audio/np_ka.wav', 
    options: [
      { name: 'Dog', letter: 'K', img: `${IMG_BASE}/dog.png`, pos: 'top' }, 
      { name: 'Cat', letter: 'B', img: `${IMG_BASE}/cat.png`, pos: 'bottom' },
      { name: 'Apple', letter: 'S', img: `${IMG_BASE}/apple.png`, pos: 'left' },
      { name: 'Fish', letter: 'M', img: `${IMG_BASE}/fish.png`, pos: 'right' },
    ]
  },
  { 
    id: '5', 
    target: 'G', 
    questionAudio: '/audio/np_ga.wav', 
    options: [
      { name: 'House', letter: 'G', img: `${IMG_BASE}/home.png`, pos: 'top' },
      { name: 'Car', letter: 'Ga', img: `${IMG_BASE}/car.png`, pos: 'bottom' },
      { name: 'Ball', letter: 'Bh', img: `${IMG_BASE}/beach-ball.png`, pos: 'left' },
      { name: 'Sun', letter: 'S', img: `${IMG_BASE}/summer.png`, pos: 'left' },
    ]
  }
];

const lerp = (start: number, end: number, factor: number) => start + (end - start) * factor;

export default function ArHunt() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handRef = useRef<HandLandmarker | null>(null);
  const gameLoopRef = useRef<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const cursorRef = useRef({ x: 50, y: 50 }); 
  const targetCursorRef = useRef({ x: 50, y: 50 }); 
  const selectionTimerRef = useRef<number>(0); 
  const lastTimeRef = useRef<number>(0);
  const isLockedRef = useRef(false); 

  const [questions] = useState(GAME_DATA);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(true);
  const [isGameOver, setIsGameOver] = useState(false);
  
  const [cursorState, setCursorState] = useState({ x: 50, y: 50, isFist: false, progress: 0 });
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  useEffect(() => {
    setTimeout(() => setLoading(false), 500);
  }, []);

  // --- AUDIO NARRATION EFFECT ---
  // Plays the question audio whenever the current level changes
  useEffect(() => {
    if (!loading && !isGameOver && questions[currentLevel]) {
        // Slight delay to ensure previous sounds are cleared
        const timer = setTimeout(() => {
            playAudio(questions[currentLevel].questionAudio);
        }, 500);
        return () => clearTimeout(timer);
    }
  }, [currentLevel, loading, isGameOver, questions]);

  useEffect(() => {
    if (loading) return;

    async function initAI() {
      try {
        const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm");
        handRef.current = await HandLandmarker.createFromOptions(vision, {
          baseOptions: { 
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task", 
            delegate: "GPU" 
          },
          runningMode: "VIDEO", 
          numHands: 1
        });
        
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setAiLoading(false);
          lastTimeRef.current = performance.now();
          render();
        }
      } catch (err) { console.error(err); }
    }
    initAI();
    return () => cancelAnimationFrame(gameLoopRef.current);
  }, [loading]);

  const render = () => {
    if (!videoRef.current || !canvasRef.current || !handRef.current) return;
    
    const now = performance.now();
    const deltaTime = now - lastTimeRef.current;
    lastTimeRef.current = now;

    const ctx = canvasRef.current.getContext('2d')!;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    const res = handRef.current.detectForVideo(videoRef.current, now);
    
    if (res.landmarks && res.landmarks.length > 0) {
      const pts = res.landmarks[0];
      const rawX = (1 - pts[8].x); 
      const rawY = pts[8].y;

      // Map coordinates to keep cursor reachable (0-100%)
      const mappedX = Math.max(0, Math.min(1, (rawX - 0.2) / 0.6)) * 100;
      const mappedY = Math.max(0, Math.min(1, (rawY - 0.2) / 0.6)) * 100;

      targetCursorRef.current = { x: mappedX, y: mappedY };

      const wrist = pts[0];
      const middleBase = pts[9];
      const fingerTips = [pts[8], pts[12], pts[16], pts[20]];
      const palmSize = Math.hypot(middleBase.x - wrist.x, middleBase.y - wrist.y);
      const avgTipDist = fingerTips.reduce((acc, t) => acc + Math.hypot(t.x - wrist.x, t.y - wrist.y), 0) / 4;
      
      const isFist = avgTipDist < palmSize * 1.4;

      cursorRef.current.x = lerp(cursorRef.current.x, targetCursorRef.current.x, CURSOR_SMOOTHING);
      cursorRef.current.y = lerp(cursorRef.current.y, targetCursorRef.current.y, CURSOR_SMOOTHING);

      if (!isLockedRef.current && !feedback && !isGameOver) {
        processInteraction(cursorRef.current.x, cursorRef.current.y, isFist, deltaTime);
      }
      drawSkeleton(ctx, pts);
    } else {
        setHoveredIdx(null);
        selectionTimerRef.current = 0;
    }
    gameLoopRef.current = requestAnimationFrame(render);
  };

  const processInteraction = (cx: number, cy: number, isFist: boolean, dt: number) => {
    const activeLevel = questions[currentLevel];
    if (!activeLevel) return;

    let hitIndex: number | null = null;
    activeLevel.options.forEach((opt, idx) => {
      const pos = getPos(opt.pos);
      const dist = Math.hypot(cx - pos.x, cy - pos.y);
      if (dist < 12) hitIndex = idx;
    });

    setHoveredIdx(hitIndex);

    if (hitIndex !== null && isFist) {
      selectionTimerRef.current += dt;
      const progress = Math.min(100, (selectionTimerRef.current / SELECTION_THRESHOLD_MS) * 100);
      setCursorState({ x: cx, y: cy, isFist: true, progress });

      if (selectionTimerRef.current >= SELECTION_THRESHOLD_MS) {
        handleSelect(hitIndex);
        selectionTimerRef.current = 0;
        isLockedRef.current = true;
      }
    } else {
      selectionTimerRef.current = 0;
      setCursorState({ x: cx, y: cy, isFist, progress: 0 });
    }
  };

  const handleSelect = (idx: number) => {
    const lvl = questions[currentLevel];
    const choice = lvl.options[idx];
    const isCorrect = choice.letter === lvl.target;

    setFeedback(isCorrect ? 'correct' : 'wrong');
    
    // Play sound effect for correct/wrong
    const audioPath = isCorrect ? '/audio/correct_sound.mp3' : '/audio/wrong_sound.mp3';
    // playAudio(audioPath); 

    setTimeout(() => {
        setFeedback(null);
        isLockedRef.current = false;
        if (isCorrect) {
            if (currentLevel < questions.length - 1) {
                setCurrentLevel(prev => prev + 1);
            } else {
                // Game Completed Logic
                setIsGameOver(true);
                // Redirect to modules page after 4 seconds
                setTimeout(() => {
                    router.push('/modules');
                }, 4000);
            }
        }
    }, 2000); 
  };

  const playAudio = (path: string) => {
    // Stop currently playing audio (essential so question stops when answer is selected)
    if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
    }
    const audio = new Audio(path);
    audioRef.current = audio;
    audio.play().catch(e => console.error("Audio play blocked or file missing:", e));
  };

  const drawSkeleton = (ctx: CanvasRenderingContext2D, landmarks: any[]) => {
    ctx.lineWidth = 4;
    ctx.strokeStyle = "rgba(0, 255, 0, 0.5)"; 
    const connections = [[0,1],[1,2],[2,3],[3,4], [0,5],[5,6],[6,7],[7,8], [5,9],[9,10],[10,11],[11,12]];
    ctx.beginPath();
    connections.forEach(([i, j]) => {
      const p1 = landmarks[i]; const p2 = landmarks[j];
      ctx.moveTo((1 - p1.x) * ctx.canvas.width, p1.y * ctx.canvas.height);
      ctx.lineTo((1 - p2.x) * ctx.canvas.width, p2.y * ctx.canvas.height);
    });
    ctx.stroke();
  };

  const getPos = (pos: string) => {
    switch(pos) {
      case 'top': return { x: 50, y: 25 };
      case 'bottom': return { x: 50, y: 75 };
      case 'left': return { x: 20, y: 50 };
      case 'right': return { x: 80, y: 50 };
      default: return { x: 50, y: 50 };
    }
  };

  if (loading) return <div className="h-full flex items-center justify-center text-slate-400 font-bold text-2xl">Loading Assets...</div>;

  return (
    <div className="relative w-full h-[75vh] md:h-[80vh] bg-slate-900 rounded-3xl overflow-hidden border-4 border-slate-300 shadow-2xl">
      <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover scale-x-[-1] opacity-50" playsInline muted />
      <canvas ref={canvasRef} width={1280} height={720} className="absolute inset-0 w-full h-full object-cover pointer-events-none" />

      {aiLoading && (
        <div className="absolute inset-0 z-50 bg-black/80 flex flex-col items-center justify-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <h2 className="text-white font-bold text-xl">Starting Camera...</h2>
        </div>
      )}

      {/* --- UI LAYER --- */}
      <div className="absolute top-6 left-0 w-full flex flex-col items-center z-10 pointer-events-none gap-4">
         
         {/* LEVEL INDICATOR (No question text, just the level number) */}
         {!isGameOver && !feedback && (
           <div className="bg-white/90 px-6 py-2 rounded-full shadow-lg border-2 border-blue-500">
               <span className="text-lg font-bold text-blue-600">Level {currentLevel + 1} / {questions.length}</span>
           </div>
         )}

         {/* FEEDBACK OVERLAY */}
         {feedback && (
             <div className={`animate-bounce px-8 py-4 rounded-2xl shadow-xl border-b-4 ${feedback === 'correct' ? 'bg-green-500 border-green-700' : 'bg-red-500 border-red-700'}`}>
                <h2 className="text-3xl font-black text-white">{feedback === 'correct' ? '🎉 Correct!' : '❌ Try Again'}</h2>
             </div>
         )}
      </div>

      {/* --- OPTIONS (IMAGES ONLY) --- */}
      {!isGameOver && !aiLoading && questions[currentLevel]?.options.map((opt, i) => {
         const p = getPos(opt.pos);
         const isHovered = hoveredIdx === i;
         return (
            <div key={i} className="absolute transition-transform duration-200 ease-out"
                 style={{ left: `${p.x}%`, top: `${p.y}%`, transform: `translate(-50%, -50%) scale(${isHovered ? 1.15 : 1})` }}>
                 <div className={`relative p-4 rounded-full bg-white shadow-2xl border-4 
                    ${isHovered ? 'border-blue-400' : 'border-white'}
                    ${feedback === 'correct' && isHovered ? '!border-green-500 !bg-green-100' : ''}
                    ${feedback === 'wrong' && isHovered ? '!border-red-500 !bg-red-100' : ''}
                 `}>
                    <img src={opt.img} className="w-24 h-24 object-contain" alt={opt.name} />
                 </div>
            </div>
         );
      })}

      {/* --- CURSOR --- */}
      {!aiLoading && !isGameOver && (
          <div className="absolute z-50 pointer-events-none flex items-center justify-center"
            style={{ left: `${cursorState.x}%`, top: `${cursorState.y}%`, transform: 'translate(-50%, -50%)' }}>
             <svg className="w-24 h-24 absolute -rotate-90">
                <circle cx="48" cy="48" r="40" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="6" />
                <circle cx="48" cy="48" r="40" fill="none" stroke="#FACC15" strokeWidth="6" 
                    strokeDasharray="251" strokeDashoffset={251 - (251 * cursorState.progress) / 100}
                    className="transition-all duration-75 ease-linear" />
             </svg>
             <div className={`w-12 h-12 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-sm border-2 
                ${cursorState.isFist ? 'border-yellow-400 bg-yellow-400/20' : 'border-white'}`}>
                <span className="text-2xl">{cursorState.isFist ? '✊' : '🖐️'}</span>
             </div>
          </div>
      )}
    </div>
  );
}