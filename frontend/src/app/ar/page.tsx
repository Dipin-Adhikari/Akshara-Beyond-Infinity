'use client';

import React, { useRef, useEffect, useState } from 'react';
import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { useRouter } from 'next/navigation';

// --- FALLBACK DATA ---
const IMG_BASE = "https://img.icons8.com/color/96";
const FALLBACK_QUESTIONS = [
  { 
    id: '1', target: 'C', prompt: "Find the item that starts with C", 
    options: [
      { name: 'Cat', letter: 'C', img: `${IMG_BASE}/cat.png`, pos: 'top' },
      { name: 'Apple', letter: 'A', img: `${IMG_BASE}/apple.png`, pos: 'bottom' },
      { name: 'Dog', letter: 'D', img: `${IMG_BASE}/dog.png`, pos: 'left' },
      { name: 'Fish', letter: 'F', img: `${IMG_BASE}/fish.png`, pos: 'right' },
    ]
  },
  { 
    id: '2', target: 'B', prompt: "Find the item that starts with B", 
    options: [
      { name: 'Ball', letter: 'B', img: `${IMG_BASE}/beach-ball.png`, pos: 'top' },
      { name: 'Sun', letter: 'S', img: `${IMG_BASE}/summer.png`, pos: 'bottom' },
      { name: 'Ant', letter: 'A', img: `${IMG_BASE}/ant.png`, pos: 'left' },
      { name: 'Moon', letter: 'M', img: `${IMG_BASE}/moon-satellite.png`, pos: 'right' },
    ]
  }
];

interface QuestionData {
  id: string;
  target: string;
  prompt: string;
  options: {
    name: string;
    letter: string;
    img: string;
    pos: string;
  }[];
}

export default function ArHunt() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handRef = useRef<HandLandmarker | null>(null);
  const gameLoopRef = useRef<number>(0);
  const selectionLockedRef = useRef(false);

  // State
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(true);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [stats, setStats] = useState({ correct: 0, wrong: 0 });
  
  // Hand State
  const [hand, setHand] = useState({ x: 0, y: 0, isFist: false });
  
  const [isGameOver, setIsGameOver] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  // --- 1. FETCH DATA ---
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('http://localhost:8000/modules/ar-hunt');
        if (!res.ok) throw new Error("Backend offline");
        const data = await res.json();
        
        const mappedQuestions = data.map((item: any) => {
          const content = item.content;
          const positions = ['top', 'bottom', 'left', 'right'];
          return {
            id: item.task_id,
            target: content.target_letter,
            prompt: content.prompt_text,
            options: content.choices.map((c: any, idx: number) => ({
              name: c.content,
              letter: c.content.charAt(0).toUpperCase(),
              img: c.image_url,
              pos: positions[idx] || 'top' 
            }))
          };
        });
        setQuestions(mappedQuestions);
      } catch (err) {
        console.warn("Using Fallback Data");
        setQuestions(FALLBACK_QUESTIONS);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // --- 2. SETUP CAMERA & AI ---
  useEffect(() => {
    async function initAI() {
      if (loading) return; 

      try {
        console.log("Initializing Vision...");
        const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm");
        
        handRef.current = await HandLandmarker.createFromOptions(vision, {
          baseOptions: { 
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task", 
            delegate: "GPU" 
          },
          runningMode: "VIDEO", 
          numHands: 1
        });
        
        console.log("Starting Camera...");
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          // IMPORTANT: Force video to play
          await videoRef.current.play(); 
          setAiLoading(false);
          render();
        }
      } catch (error) {
        console.error("AI Init Failed:", error);
      }
    }
    initAI();
    return () => { if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current); }
  }, [loading]);

  // --- 3. GAME LOOP & DRAWING ---
  const render = () => {
    if (!videoRef.current || !canvasRef.current || !handRef.current) return;
    
    // Safety check: video must be playing
    if (videoRef.current.readyState < 2) {
       gameLoopRef.current = requestAnimationFrame(render);
       return;
    }

    const ctx = canvasRef.current.getContext('2d')!;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    // Detect Hands
    const res = handRef.current.detectForVideo(videoRef.current, performance.now());
    
    if (res.landmarks && res.landmarks.length > 0) {
      const pts = res.landmarks[0];
      
      // VISUAL DEBUG: Draw Skeleton
      drawSkeleton(ctx, pts);

      // Logic
      const wrist = pts[0];
      const middleBase = pts[9];
      const fingerTips = [pts[8], pts[12], pts[16], pts[20]];
      
      const palmSize = Math.sqrt(Math.pow(middleBase.x - wrist.x, 2) + Math.pow(middleBase.y - wrist.y, 2));
      const avgTipDist = fingerTips.reduce((sum, tip) => sum + Math.sqrt(Math.pow(tip.x - wrist.x, 2) + Math.pow(tip.y - wrist.y, 2)), 0) / 4;
      
      // Easier Fist Detection (1.5x threshold instead of 1.25x)
      const isFist = avgTipDist < palmSize * 1.5; 
      
      // Coordinates (Mirrored X)
      const x = (1 - pts[8].x) * 100; 
      const y = pts[8].y * 100;

      setHand({ x, y, isFist });

      if (isFist && !selectionLockedRef.current && !isGameOver && !feedback && !loading) {
        checkHit(x, y);
      } else if (!isFist && !feedback) {
        selectionLockedRef.current = false;
      }
    }
    gameLoopRef.current = requestAnimationFrame(render);
  };

  // Helper to draw skeleton lines
  const drawSkeleton = (ctx: CanvasRenderingContext2D, landmarks: any[]) => {
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#00FF00"; // Green lines
    ctx.fillStyle = "#FF0000";   // Red dots

    // Connect key points (simplified)
    const connections = [[0,1],[1,2],[2,3],[3,4], [0,5],[5,6],[6,7],[7,8], [5,9],[9,10],[10,11],[11,12]];
    
    connections.forEach(([i, j]) => {
      const p1 = landmarks[i];
      const p2 = landmarks[j];
      ctx.beginPath();
      // Mirror X coord for drawing
      ctx.moveTo((1 - p1.x) * ctx.canvas.width, p1.y * ctx.canvas.height);
      ctx.lineTo((1 - p2.x) * ctx.canvas.width, p2.y * ctx.canvas.height);
      ctx.stroke();
    });
  };

  const checkHit = (hx: number, hy: number) => {
    if (currentLevel >= questions.length) return;
    const lvl = questions[currentLevel];
    
    lvl.options.forEach((opt, idx) => {
      const p = getPos(opt.pos);
      // Distance Check
      const d = Math.sqrt(Math.pow(hx - p.x, 2) + Math.pow(hy - p.y, 2));

      if (d < 12) { // Hit Radius
        selectionLockedRef.current = true;
        setSelectedIdx(idx);
        
        if (opt.letter === lvl.target) {
          setStats(s => ({ ...s, correct: s.correct + 1 }));
          setFeedback('correct');
          speak(`Correct! That is a ${opt.name}`);
        } else {
          setStats(s => ({ ...s, wrong: s.wrong + 1 }));
          setFeedback('wrong');
          speak(`Oops! That is a ${opt.name}`);
        }

        setTimeout(() => {
          setFeedback(null);
          setSelectedIdx(null);
          if (currentLevel < questions.length - 1) {
            setCurrentLevel(prev => prev + 1);
          } else {
            handleGameEnd(stats.correct + (opt.letter === lvl.target ? 1 : 0));
          }
        }, 1500);
      }
    });
  };

  const handleGameEnd = async (finalScore: number) => {
    setIsGameOver(true);
    speak("Great job! Returning to menu.");
    try {
      await fetch('http://localhost:8000/modules/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ module_id: 'ar-hunt', score: finalScore, total_questions: questions.length })
      });
    } catch (e) { console.log("Score saved locally"); }
    setTimeout(() => { router.push('/modules'); }, 3000);
  };

  const speak = (text: string) => {
    const u = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(u);
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

  if (loading) return <div className="h-screen flex items-center justify-center text-4xl font-bold bg-slate-900 text-white">Loading Game Data...</div>;

  return (
    <div className="relative w-full h-[85vh] bg-slate-900 rounded-3xl overflow-hidden border-4 border-slate-300 shadow-2xl">
      
      {/* CAMERA LAYER */}
      <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover scale-x-[-1] opacity-60" playsInline muted />
      
      {/* CANVAS LAYER (Visual Feedback) */}
      <canvas ref={canvasRef} width={1280} height={720} className="absolute inset-0 w-full h-full object-cover pointer-events-none" />

      {/* LOADING OVERLAY */}
      {aiLoading && (
        <div className="absolute inset-0 z-[500] bg-black/80 flex items-center justify-center">
            <h2 className="text-white text-3xl font-bold animate-pulse">Starting Camera & AI...</h2>
        </div>
      )}

      {/* --- HUD --- */}
      <div className="absolute top-4 left-0 w-full flex flex-col items-center z-[100] gap-4">
        <div className="bg-white/90 px-8 py-2 rounded-full shadow-xl border-b-4 border-blue-500">
             <span className="text-xl font-black text-slate-800 uppercase">
                Level {Math.min(currentLevel + 1, questions.length)} / {questions.length}
             </span>
        </div>

        {!isGameOver && (
            <div className={`transition-all duration-300 px-8 py-4 rounded-2xl border-b-8 shadow-lg
                ${feedback === 'correct' ? 'bg-green-500 border-green-700' : 
                  feedback === 'wrong' ? 'bg-red-500 border-red-700' : 'bg-white border-blue-400'}`}>
                <h1 className={`text-3xl font-black tracking-tight text-center ${feedback ? 'text-white' : 'text-slate-800'}`}>
                   {feedback === 'correct' ? "✅ Awesome!" : feedback === 'wrong' ? "❌ Try again!" : questions[currentLevel]?.prompt}
                </h1>
            </div>
        )}
      </div>

      {/* --- HAND CURSOR --- */}
      <div 
        className={`absolute z-[150] w-16 h-16 rounded-full border-4 flex items-center justify-center transition-transform duration-75
          ${hand.isFist ? 'bg-yellow-400 border-white scale-110 shadow-lg' : 'bg-white/30 border-dashed border-white'}`}
        style={{ left: `${hand.x}%`, top: `${hand.y}%`, transform: 'translate(-50%, -50%)' }}
      >
        <span className="text-3xl">{hand.isFist ? '✊' : '🖐️'}</span>
      </div>

      {/* --- OPTIONS --- */}
      {!isGameOver && questions[currentLevel]?.options.map((opt, i) => {
        const p = getPos(opt.pos);
        const isThisSelected = selectedIdx === i;

        return (
          <div key={i} className="absolute z-10 transition-all duration-300" 
            style={{ 
                left: `${p.x}%`, top: `${p.y}%`, 
                transform: `translate(-50%, -50%) scale(${isThisSelected ? 1.2 : 1})` 
            }}>
            
            <div className={`bg-white p-4 rounded-[30px] shadow-2xl border-[6px] 
              ${isThisSelected && feedback === 'correct' ? 'border-green-500 bg-green-100' : 
                isThisSelected && feedback === 'wrong' ? 'border-red-500 bg-red-100' : 'border-white hover:border-blue-200'}`}>
              
              <img src={opt.img} className="w-24 h-24 object-contain" alt={opt.name} />
              <div className="mt-2 text-center">
                  <span className="inline-block bg-slate-100 text-slate-800 font-black px-3 py-1 rounded-lg text-xl border border-slate-200 uppercase">
                    <span className="text-indigo-600">{opt.name.charAt(0)}</span>{opt.name.slice(1)}
                  </span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  );
}