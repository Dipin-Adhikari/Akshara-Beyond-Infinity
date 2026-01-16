"use client";
import React, { useRef, useState, useEffect } from 'react';
import { ReactSketchCanvas, ReactSketchCanvasRef } from 'react-sketch-canvas';
import { 
  Eraser, RotateCcw, ArrowRight, Loader2, Volume2, 
  Sparkles, Star, Trophy, Mic, Square, Play, CheckCircle
} from 'lucide-react';
import Link from 'next/link';

// --- TYPES ---
type Question = {
  id: number;
  type: 'writing' | 'speaking';
  lang: 'english' | 'nepali';
  target: string; // We keep this for logic, but won't show it as text instructions
  content: string; // The instruction text (spoken via TTS)
};

type AnalysisResult = {
  question_type: string;
  target: string;
  predicted: string;
  confidence: number;
  is_correct: boolean;
  risk_weight: number;
  feedback: string;
};

export default function BilingualAssessment() {
  const canvasRef = useRef<ReactSketchCanvasRef>(null);
  
  // --- STATE ---
  const [questions, setQuestions] = useState<Question[]>([]);
  const [step, setStep] = useState(0); 
  const [loading, setLoading] = useState(false);     
  const [dataLoading, setDataLoading] = useState(true); 
  
  // Audio State
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  
  const [results, setResults] = useState<AnalysisResult[]>([]); 
  const [finalAnalysis, setFinalAnalysis] = useState<any>(null); 

  // --- 1. FETCH CURRICULUM ---
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/test/curriculum");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setQuestions(data);
      } catch (e) {
        console.error("Failed to load questions", e);
      } finally {
        setDataLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  // Derived state
  const currentQ = questions[step];
  const progressPercent = questions.length > 0 ? ((step + 1) / questions.length) * 100 : 0;

  // --- HANDLERS ---

  const playSound = async (text: string, lang: string) => {
    try {
      const url = `http://localhost:8000/api/test/speak?text=${encodeURIComponent(text)}&language=${lang}`;
      const response = await fetch(url, { method: "POST" });
      const blob = await response.blob();
      const audio = new Audio(URL.createObjectURL(blob));
      audio.play();
    } catch (err) {
      console.error("Audio failed", err);
    } 
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      alert("Microphone access denied. Please enable permissions.");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const handleReset = () => {
    if (currentQ?.type === 'writing') {
      canvasRef.current?.clearCanvas();
    } else {
      setAudioBlob(null);
    }
  };

  const handleUndo = () => canvasRef.current?.undo();

  const handleSubmit = async () => {
    if (!currentQ) return;
    setLoading(true);

    try {
      let data;
      
      if (currentQ.type === 'writing') {
        const imageBase64 = await canvasRef.current?.exportImage("png");
        if (!imageBase64) return;

        const response = await fetch("http://localhost:8000/api/test/analyze/writing", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            target_letter: currentQ.target,
            image_base64: imageBase64,
            language: currentQ.lang 
          })
        });
        data = await response.json();
      } 
      else if (currentQ.type === 'speaking') {
        if (!audioBlob) return; 
        
        const formData = new FormData();
        formData.append("file", audioBlob, "recording.webm");
        formData.append("target_text", currentQ.target);
        formData.append("language", currentQ.lang);

        const response = await fetch("http://localhost:8000/api/test/analyze/speaking", {
          method: "POST",
          body: formData 
        });
        data = await response.json();
      }

      const newResults = [...results, data];
      setResults(newResults);

      if (step < questions.length - 1) {
        setStep(step + 1);
        setAudioBlob(null);
        setTimeout(() => {
           if (canvasRef.current) canvasRef.current.clearCanvas();
        }, 100); 
      } else {
        const scoreResponse = await fetch("http://localhost:8000/api/test/finish-assessment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ results: newResults })
        });
        const scoreData = await scoreResponse.json();
        setFinalAnalysis(scoreData);
      }

    } catch (error) {
      console.error("Submission failed", error);
    } finally {
      setLoading(false);
    }
  };

  // --- VIEW 1: LOADING ---
  if (dataLoading) {
    return (
        <div className="h-screen flex items-center justify-center bg-[#E0F7FA]">
            <div className="flex flex-col items-center">
                <Loader2 className="animate-spin w-16 h-16 text-teal-500 mb-4"/>
                <p className="text-xl font-bold text-teal-700 font-comic">Loading Magic...</p>
            </div>
        </div>
    );
  }

  // --- VIEW 2: RESULTS ---
  if (finalAnalysis) {
     return (
       <div className="min-h-screen bg-[#FFF9C4] p-6 flex flex-col items-center justify-center font-sans">
         <div className="max-w-2xl w-full bg-white rounded-[3rem] p-8 shadow-[0_10px_0_rgba(0,0,0,0.1)] text-center border-4 border-yellow-300">
            <Trophy className="w-24 h-24 text-yellow-500 mx-auto mb-4 animate-bounce" />
            <h1 className="text-4xl font-black text-indigo-900 mb-2 font-comic">Adventure Complete!</h1>
            <p className="text-indigo-400 font-bold text-lg mb-6">{finalAnalysis.summary_text}</p>
            
            <div className="space-y-4 text-left max-h-[300px] overflow-y-auto p-4 bg-slate-50 rounded-2xl mb-6">
               {results.map((res, i) => (
                 <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm border border-slate-100">
                   <div className={`p-3 rounded-full ${res.is_correct ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-500'}`}>
                      {res.is_correct ? <CheckCircle size={24} /> : <AlertCircle size={24}/>}
                   </div>
                   <div>
                      <p className="font-bold text-slate-700">Level {i+1}</p>
                      <p className="text-sm text-slate-500">{res.feedback}</p>
                   </div>
                 </div>
               ))}
            </div>
            
            <Link href="/dashboard">
              <button className="w-full bg-indigo-500 text-white py-4 rounded-2xl font-black text-xl shadow-[0_6px_0_#3730a3] active:translate-y-1 active:shadow-none transition-all hover:bg-indigo-600">
                  Play Again?
              </button>
            </Link>
         </div>
       </div>
     );
  }

  if (!currentQ) return null;

  // --- VIEW 3: MAIN GAME INTERFACE ---
  return (
    <div className="min-h-screen bg-sky-100 p-4 font-sans selection:bg-yellow-200 flex flex-col items-center relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-10 left-10 text-sky-200 opacity-50 animate-pulse"><Sparkles size={60} /></div>
      <div className="absolute bottom-20 right-10 text-sky-200 opacity-50 animate-bounce"><Star size={80} /></div>

      {/* HEADER: Progress Bar */}
      <div className="w-full max-w-2xl mt-4 mb-8 z-10">
        <div className="flex justify-between items-end px-4 mb-2">
            <h1 className="text-2xl font-black text-sky-800 tracking-wider">LEVEL {step + 1}</h1>
            <div className="text-sky-600 font-bold bg-white px-3 py-1 rounded-full shadow-sm">{questions.length - step} to go!</div>
        </div>
        <div className="h-6 bg-white rounded-full p-1 shadow-inner border-2 border-sky-200">
            <div 
              className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full transition-all duration-700 ease-out shadow-sm" 
              style={{ width: `${progressPercent}%` }}
            ></div>
        </div>
      </div>

      {/* CENTRAL GAME AREA */}
      <div className="flex-1 w-full max-w-5xl flex flex-col md:flex-row gap-6 items-stretch z-10">

        {/* 1. THE COMPANION (Audio Instruction) */}
        <div className="md:w-1/3 flex flex-col">
            <div className="flex-1 bg-white rounded-[2.5rem] p-6 shadow-[0_8px_0_rgba(0,0,0,0.05)] border-4 border-white flex flex-col items-center justify-center text-center gap-4 relative group">
                
                <div className="absolute -top-4 bg-yellow-400 text-yellow-900 text-sm font-black px-4 py-1 rounded-full shadow-sm animate-bounce">
                    CLICK ME FIRST!
                </div>

                <button 
                  onClick={() => playSound(currentQ.content, currentQ.lang)}
                  className="relative w-40 h-40 rounded-full bg-indigo-500 hover:bg-indigo-600 shadow-[0_10px_0_#312e81] active:shadow-none active:translate-y-2 transition-all flex items-center justify-center group-hover:scale-105"
                >
                    <Volume2 className="w-16 h-16 text-white" strokeWidth={2.5} />
                    {/* Ring animation */}
                    <span className="absolute w-full h-full rounded-full border-4 border-indigo-300 opacity-0 animate-ping"></span>
                </button>
                
                <div className="mt-4">
                    <h2 className="text-2xl font-black text-slate-700">Listen</h2>
                    <p className="text-slate-400 font-bold">Tap the button to hear magic words!</p>
                </div>
            </div>
        </div>

        {/* 2. THE PLAYGROUND (Interaction) */}
        <div className="md:w-2/3 flex flex-col">
            <div className="flex-1 bg-white rounded-[2.5rem] border-8 border-indigo-100 shadow-xl overflow-hidden relative flex flex-col">
                
                {/* Writing Task */}
                {currentQ.type === 'writing' && (
                    <div className="flex-1 relative bg-[url('https://www.transparenttextures.com/patterns/graphy.png')]">
                         <div className="absolute top-4 left-4 z-20 flex gap-2">
                            <div className="bg-indigo-100 text-indigo-600 px-3 py-1 rounded-lg font-bold text-sm flex items-center gap-2">
                                <span className="text-xl">✏️</span> Draw here
                            </div>
                         </div>

                        {/* Controls */}
                        <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
                            <button onClick={handleUndo} className="p-3 bg-white border-2 border-slate-100 rounded-xl shadow-md hover:bg-slate-50 text-slate-600 active:scale-95 transition-transform"><RotateCcw size={24}/></button>
                            <button onClick={handleReset} className="p-3 bg-white border-2 border-red-100 rounded-xl shadow-md hover:bg-red-50 text-red-500 active:scale-95 transition-transform"><Eraser size={24}/></button>
                        </div>

                         <ReactSketchCanvas
                            ref={canvasRef}
                            strokeWidth={15}
                            strokeColor="#4F46E5"
                            canvasColor="transparent"
                            className="w-full h-full cursor-crosshair"
                        />
                    </div>
                )}

                {/* Speaking Task */}
                {currentQ.type === 'speaking' && (
                    <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-b from-indigo-50 to-white relative p-6">
                        
                         <div className="absolute top-4 left-4 bg-indigo-100 text-indigo-600 px-3 py-1 rounded-lg font-bold text-sm flex items-center gap-2">
                            <span className="text-xl">🎤</span> Speak here
                         </div>

                        {!isRecording ? (
                             <button 
                                onClick={startRecording}
                                className="w-48 h-48 rounded-full bg-red-500 border-8 border-red-200 shadow-[0_12px_0_#991b1b] active:shadow-none active:translate-y-3 transition-all flex flex-col items-center justify-center text-white hover:bg-red-600 hover:scale-105"
                             >
                                 <Mic size={64} />
                                 <span className="text-xl font-black mt-2">RECORD</span>
                             </button>
                        ) : (
                            <div className="flex flex-col items-center gap-6">
                                <div className="text-red-500 font-bold animate-pulse text-xl">Listening...</div>
                                <button 
                                    onClick={stopRecording}
                                    className="w-48 h-48 rounded-3xl bg-slate-800 border-8 border-slate-600 shadow-[0_12px_0_#0f172a] active:shadow-none active:translate-y-3 transition-all flex flex-col items-center justify-center text-white"
                                >
                                    <Square size={64} fill="currentColor" />
                                    <span className="text-xl font-black mt-2">STOP</span>
                                </button>
                            </div>
                        )}

                        {audioBlob && !isRecording && (
                            <div className="mt-8 flex gap-4 animate-in fade-in slide-in-from-bottom-4">
                                <button 
                                    onClick={() => {
                                        const a = new Audio(URL.createObjectURL(audioBlob));
                                        a.play();
                                    }}
                                    className="flex items-center gap-2 bg-green-100 text-green-700 px-6 py-3 rounded-xl font-bold hover:bg-green-200 transition-colors"
                                >
                                    <Play size={20} fill="currentColor" /> Replay My Voice
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* FOOTER: Submit Button */}
      <div className="w-full max-w-5xl mt-8 flex justify-center pb-8 z-10">
          <button 
            onClick={handleSubmit}
            disabled={loading || (currentQ.type === 'speaking' && !audioBlob)}
            className={`
                group relative px-12 py-5 rounded-3xl font-black text-2xl shadow-[0_8px_0_rgba(0,0,0,0.2)] active:translate-y-2 active:shadow-none transition-all flex items-center gap-4
                ${loading 
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed' 
                    : 'bg-green-500 text-white hover:bg-green-400 hover:-translate-y-1 hover:shadow-[0_12px_0_rgba(0,0,0,0.2)]'
                }
            `}
          >
            {loading ? (
                <>
                 <Loader2 className="animate-spin" size={32} />
                 Checking...
                </>
            ) : (
                <>
                 I'm Done! 
                 <ArrowRight size={32} strokeWidth={4} className="group-hover:translate-x-1 transition-transform"/>
                </>
            )}
          </button>
      </div>

    </div>
  );
}