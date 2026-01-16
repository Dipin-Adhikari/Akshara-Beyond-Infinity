"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Volume2, Sparkles, Loader2 } from 'lucide-react';

// Define the shape of our new API response for TypeScript safety
interface TaskData {
  task_id: string;
  module_id: string;
  level: number;
  epoch: number;
  content: {
    task_type: string;
    audio_url: string;
    target_letter: string;
    choices: Array<{
      id: string;
      content: string; // Used to be 'letter'
      type: string;
    }>;
  };
}

export default function SoundSafari() {
  const [data, setData] = useState<TaskData | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const startTimeRef = useRef<number>(0);

  const loadLevel = async () => {
    setFeedback(null);
    setSelected(null);
    setIsProcessing(false);
    
    try {
      // NOTE: Using 'sound_safari' (underscore) to match the seeded module_id
      const res = await fetch('http://localhost:8000/api/module/sound_safari/child_123');
      if (!res.ok) throw new Error("Failed to fetch");
      
      const json = await res.json();
      setData(json);
      startTimeRef.current = performance.now();
    } catch (error) {
      console.error("Failed to load next task:", error);
    }
  };

  useEffect(() => { loadLevel(); }, []);

  const handleChoice = async (choiceId: string) => {
    if (isProcessing || feedback === 'correct' || !data) return;

    // 1. Find the selected choice in the NEW content structure
    const selectedChoice = data.content.choices.find((c) => c.id === choiceId);
    
    // 2. Validate against target_letter
    const isCorrect = selectedChoice?.content === data.content.target_letter;
    const responseTime = Math.round(performance.now() - startTimeRef.current);

    setSelected(choiceId);
    setFeedback(isCorrect ? 'correct' : 'wrong');

    // 3. Report Progress
    try {
      await fetch('http://localhost:8000/api/report-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: "child_123",
          module_id: data.module_id,
          level: data.level,
          epoch: data.epoch,
          selected_id: choiceId,
          is_correct: isCorrect,
          response_time_ms: responseTime
        })
      });
    } catch (err) {
      console.error("Failed to report progress", err);
    }

    // 4. Handle UI feedback loop
    if (!isCorrect) {
      // Wrong: reset after 1s
      setTimeout(() => {
        setFeedback(null);
        setSelected(null);
      }, 1000);
    } else {
      // Correct: wait 1.5s then load next
      setIsProcessing(true);
      setTimeout(loadLevel, 1500);
    }
  };

  const playSound = () => {
    // Audio URL is now relative (e.g., "/static/audio/...")
    // Ensure your FastAPI main.py mounts "/static"
    if (data?.content?.audio_url) {
      const url = `http://localhost:8000${data.content.audio_url}`;
      const audio = new Audio(url);
      audio.play().catch(e => console.error("Audio play failed", e));
    }
  };

  if (!data) return (
    <div className="flex flex-col items-center justify-center h-64 text-orange-500">
      <Loader2 className="animate-spin mb-4" size={48} />
      <span className="font-bold text-xl">Loading Safari...</span>
    </div>
  );

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto">
      <div className="mb-8 text-slate-400 font-bold uppercase tracking-widest text-sm">
        Level {data.level} • Round {data.epoch + 1}
      </div>

      {/* BIG SPEAKER BUTTON */}
      <button 
        onClick={playSound}
        className="w-40 h-40 bg-orange-500 rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(249,115,22,0.4)] hover:scale-105 active:scale-95 transition-all mb-16 ring-8 ring-orange-100"
      >
        <Volume2 size={64} className="text-white" />
      </button>

      {/* CHOICES GRID */}
      <div className="flex flex-wrap justify-center gap-6">
        {data.content.choices.map((choice) => (
          <button
            key={choice.id}
            onClick={() => handleChoice(choice.id)}
            disabled={isProcessing}
            className={`
              relative w-32 h-44 rounded-3xl text-6xl font-black transition-all duration-300 border-b-[8px]
              ${selected === choice.id 
                ? (feedback === 'correct' 
                    ? 'bg-green-500 border-green-700 text-white translate-y-2 border-b-0 shadow-none' 
                    : 'bg-red-500 border-red-700 text-white shake')
                : 'bg-white border-slate-200 text-slate-800 hover:-translate-y-2 hover:shadow-xl hover:border-orange-300'
              }
            `}
          >
            {/* Render Text Content */}
            {choice.content}

            {/* Sparkle Effect on Correct */}
            {selected === choice.id && feedback === 'correct' && (
              <div className="absolute -top-10 -right-10 animate-bounce">
                 <Sparkles className="text-yellow-400 fill-yellow-400" size={56} />
              </div>
            )}
          </button>
        ))}
      </div>
      
      <p className="mt-12 text-slate-400 font-medium text-sm">
        Tap the speaker to hear the sound, then find the matching letter!
      </p>
    </div>
  );
}