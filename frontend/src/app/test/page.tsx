"use client";
import React, { useRef, useState, useEffect } from 'react';
import { ReactSketchCanvas, ReactSketchCanvasRef } from 'react-sketch-canvas';
import { 
  Eraser, RotateCcw, ArrowRight, Loader2, Volume2, 
  Sparkles, Star, Mic, Square, Play, CheckCircle, Trophy, RefreshCcw
} from 'lucide-react';

// --- CONFIGURATION ---
const API_BASE = "http://localhost:8000"; // Ensure this matches your FastAPI port

// --- TYPES ---
type Question = {
  id: number;
  type: 'writing' | 'speaking';
  lang: 'english' | 'nepali';
  target: string;
  audio_filename?: string; // New field from your updated backend
  instruction?: string;    // New field from your updated backend
  content?: string;        // Fallback
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

type FinalScore = {
  score_percentage: number;
  risk_label: string;
  risk_color: string;
  summary_text: string;
};

export default function DyslexiaAssessment() {
  const canvasRef = useRef<ReactSketchCanvasRef>(null);
  
  // --- STATE ---
  const [questions, setQuestions] = useState<Question[]>([]);
  const [step, setStep] = useState(0); 
  const [loading, setLoading] = useState(false);     
  const [appState, setAppState] = useState<'loading' | 'active' | 'finished'>('loading');
  
  // Audio Recording State
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  
  // Results State
  const [results, setResults] = useState<AnalysisResult[]>([]); 
  const [finalAnalysis, setFinalAnalysis] = useState<FinalScore | null>(null); 

  // --- 1. INITIAL FETCH ---
  useEffect(() => {
    const fetchCurriculum = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/test/curriculum`);
        if (!res.ok) throw new Error("Failed to connect to backend");
        const data = await res.json();
        setQuestions(data);
        setAppState('active');
      } catch (e) {
        console.error("Backend Error:", e);
        alert("Could not connect to the Teacher (Backend). Is it running?");
      }
    };
    fetchCurriculum();
  }, []);

  const currentQ = questions[step];
  const progressPercent = questions.length > 0 ? ((step + 1) / questions.length) * 100 : 0;

  // --- HELPERS ---

  // Play static audio files served by FastAPI
  const playInstructionAudio = () => {
    if (currentQ?.audio_filename) {
      const audioPath = `${API_BASE}/audio/${currentQ.audio_filename}`;
      const audio = new Audio(audioPath);
      audio.play().catch(e => console.error("Audio play error:", e));
    }
  };

  // Recording Logic
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/mp3' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      alert("Please allow microphone access to play!");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  // Canvas Logic
  const handleClearCanvas = () => canvasRef.current?.clearCanvas();
  const handleUndoCanvas = () => canvasRef.current?.undo();

  // --- SUBMISSION HANDLER ---
  const handleNextStep = async () => {
    if (!currentQ) return;
    setLoading(true);

    try {
      let resultData;
      
      // 1. Process Writing
      if (currentQ.type === 'writing') {
        const imageBase64 = await canvasRef.current?.exportImage("png");
        if (!imageBase64) return;

        const res = await fetch(`${API_BASE}/api/test/analyze/writing`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            target_letter: currentQ.target,
            image_base64: imageBase64,
            language: currentQ.lang 
          })
        });
        resultData = await res.json();
      } 
      
      // 2. Process Speaking
      else if (currentQ.type === 'speaking') {
        if (!audioBlob) return; 
        
        const formData = new FormData();
        formData.append("file", audioBlob, "recording.mp3");
        formData.append("target_text", currentQ.target);
        formData.append("language", currentQ.lang);

        const res = await fetch(`${API_BASE}/api/test/analyze/speaking`, {
          method: "POST",
          body: formData 
        });
        resultData = await res.json();
      }

      // 3. Save & Advance
      const newResults = [...results, resultData];
      setResults(newResults);

      if (step < questions.length - 1) {
        setStep(s => s + 1);
        // Reset Inputs
        setAudioBlob(null);
        setAudioUrl(null);
        setTimeout(() => handleClearCanvas(), 100); 
      } else {
        // Finalize
        const scoreRes = await fetch(`${API_BASE}/api/test/finish-assessment`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ results: newResults })
        });
        const scoreData = await scoreRes.json();
        setFinalAnalysis(scoreData);
        setAppState('finished');
      }

    } catch (error) {
      console.error("Submission failed", error);
      alert("Something went wrong processing your answer.");
    } finally {
      setLoading(false);
    }
  };

  // --- VIEW 1: LOADING ---
  if (appState === 'loading') {
    return (
        <div className="h-screen flex items-center justify-center bg-sky-50 font-sans">
            <div className="flex flex-col items-center">
                <Loader2 className="animate-spin w-20 h-20 text-indigo-500 mb-6"/>
                <p className="text-2xl font-bold text-indigo-800">Setting up the playground...</p>
            </div>
        </div>
    );
  }

  // --- VIEW 2: RESULTS ---
  if (appState === 'finished' && finalAnalysis) {
     return (
       <div className="min-h-screen bg-yellow-50 p-6 flex items-center justify-center font-sans">
         <div className="max-w-3xl w-full bg-white rounded-[3rem] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.1)] text-center border-4 border-yellow-200">
            <div className="flex justify-center mb-6">
                <Trophy className="w-32 h-32 text-yellow-400 drop-shadow-lg animate-bounce" />
            </div>
            
            <h1 className="text-5xl font-black text-indigo-900 mb-4 tracking-tight">Great Job!</h1>
            <p className="text-xl text-slate-500 font-medium mb-8">{finalAnalysis.summary_text}</p>
            
            {/* Risk Meter */}
            <div className="bg-slate-50 rounded-3xl p-6 mb-8 border border-slate-100">
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Analysis Result</p>
                <div className={`text-4xl font-black ${finalAnalysis.risk_color}`}>
                    {finalAnalysis.risk_label}
                </div>
                <div className="w-full bg-slate-200 h-4 rounded-full mt-4 overflow-hidden">
                    <div 
                        className={`h-full ${finalAnalysis.score_percentage < 50 ? 'bg-green-500' : 'bg-red-500'}`} 
                        style={{width: `${finalAnalysis.score_percentage}%`}}
                    />
                </div>
            </div>

            <button 
                onClick={() => window.location.reload()}
                className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold text-xl hover:bg-indigo-700 hover:scale-105 transition-all shadow-xl"
            >
                Start Over
            </button>
         </div>
       </div>
     );
  }

  if (!currentQ) return null;

  // --- VIEW 3: ACTIVE GAME ---
  return (
    <div className="min-h-screen bg-[#FFFBEB] font-sans selection:bg-yellow-200 flex flex-col items-center relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-10 left-10 text-yellow-300 opacity-60 animate-pulse"><Sparkles size={80} /></div>
      <div className="absolute bottom-20 right-10 text-indigo-200 opacity-60 animate-bounce"><Star size={100} /></div>

      {/* HEADER: Progress */}
      <div className="w-full max-w-4xl mt-6 px-6 z-10">
        <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-3">
                <span className="bg-white p-2 rounded-xl shadow-sm text-2xl">
                    {currentQ.type === 'writing' ? '✏️' : '🎤'}
                </span>
                <h1 className="text-xl font-bold text-slate-700">
                    Question {step + 1} <span className="text-slate-400">/ {questions.length}</span>
                </h1>
            </div>
            {currentQ.lang === 'nepali' && (
                <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-bold border border-red-200">
                    🇳🇵 Nepali
                </span>
            )}
        </div>
        <div className="h-4 bg-white rounded-full p-1 shadow-sm border border-slate-200">
            <div 
              className="h-full bg-indigo-500 rounded-full transition-all duration-700 ease-out" 
              style={{ width: `${progressPercent}%` }}
            ></div>
        </div>
      </div>

      {/* MAIN CARD */}
      <div className="flex-1 w-full max-w-5xl flex flex-col md:flex-row gap-6 p-6 z-10 items-stretch">

        {/* LEFT: INSTRUCTIONS */}
        <div className="md:w-1/3 flex flex-col">
            <div className="flex-1 bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center gap-6 relative">
                
                <h2 className="text-2xl font-black text-slate-800">
                    {currentQ.type === 'writing' ? "Listen & Write" : "Read Aloud"}
                </h2>

                {/* If Writing: Show Audio Button */}
                {currentQ.type === 'writing' && (
                    <button 
                      onClick={playInstructionAudio}
                      className="group relative w-48 h-48 rounded-full bg-yellow-400 hover:bg-yellow-300 shadow-[0_10px_0_#d97706] active:translate-y-2 active:shadow-none transition-all flex flex-col items-center justify-center cursor-pointer"
                    >
                        <Volume2 className="w-16 h-16 text-yellow-900 mb-2 group-hover:scale-110 transition-transform" />
                        <span className="text-yellow-900 font-bold text-lg">Click to Hear</span>
                    </button>
                )}

                {/* If Speaking: Show Text to Read */}
                {currentQ.type === 'speaking' && (
                    <div className="bg-indigo-50 p-6 rounded-3xl border-2 border-indigo-100 w-full">
                        <p className="text-3xl font-bold text-indigo-900 leading-relaxed">
                            "{currentQ.target}"
                        </p>
                    </div>
                )}
                
                <p className="text-slate-500 font-medium">
                    {currentQ.instruction || currentQ.content}
                </p>
            </div>
        </div>

        {/* RIGHT: ACTION AREA */}
        <div className="md:w-2/3 flex flex-col">
            <div className="flex-1 bg-white rounded-[2.5rem] shadow-xl border-4 border-white overflow-hidden relative flex flex-col">
                
                {/* --- WRITING CANVAS --- */}
                {currentQ.type === 'writing' && (
                    <div className="flex-1 relative bg-[url('https://www.transparenttextures.com/patterns/graphy.png')] bg-slate-50">
                        {/* Canvas Tools */}
                        <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
                            <button onClick={handleUndoCanvas} className="p-4 bg-white rounded-2xl shadow-md hover:bg-slate-50 text-slate-600 transition-transform hover:scale-105" title="Undo"><RotateCcw size={24}/></button>
                            <button onClick={handleClearCanvas} className="p-4 bg-white rounded-2xl shadow-md hover:bg-red-50 text-red-500 transition-transform hover:scale-105" title="Clear"><Eraser size={24}/></button>
                        </div>

                         <ReactSketchCanvas
                            ref={canvasRef}
                            strokeWidth={12}
                            strokeColor="#4F46E5"
                            canvasColor="transparent"
                            className="w-full h-full cursor-crosshair"
                        />
                    </div>
                )}

                {/* --- SPEAKING RECORDER --- */}
                {currentQ.type === 'speaking' && (
                    <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-b from-indigo-50/50 to-white relative p-6">
                         
                         {!isRecording && !audioBlob ? (
                             <button 
                                onClick={startRecording}
                                className="w-40 h-40 rounded-full bg-red-500 border-8 border-red-100 shadow-lg hover:bg-red-600 hover:scale-105 transition-all flex flex-col items-center justify-center text-white"
                             >
                                 <Mic size={48} />
                                 <span className="font-bold mt-2">RECORD</span>
                             </button>
                         ) : isRecording ? (
                            <div className="flex flex-col items-center animate-pulse">
                                <button 
                                    onClick={stopRecording}
                                    className="w-40 h-40 rounded-3xl bg-slate-800 border-8 border-slate-200 shadow-lg flex flex-col items-center justify-center text-white"
                                >
                                    <Square size={48} fill="currentColor" />
                                    <span className="font-bold mt-2">STOP</span>
                                </button>
                                <p className="mt-6 text-red-500 font-bold tracking-widest">LISTENING...</p>
                            </div>
                         ) : (
                            <div className="flex flex-col items-center gap-6">
                                <div className="bg-green-100 text-green-700 px-6 py-4 rounded-2xl flex items-center gap-4">
                                    <CheckCircle size={32} />
                                    <span className="font-bold text-lg">Audio Saved!</span>
                                </div>
                                <div className="flex gap-4">
                                    <button 
                                        onClick={() => {
                                            if(audioUrl) new Audio(audioUrl).play();
                                        }}
                                        className="p-4 bg-white border-2 border-slate-100 rounded-2xl hover:bg-slate-50 text-slate-700"
                                    >
                                        <Play size={24} fill="currentColor"/>
                                    </button>
                                    <button 
                                        onClick={() => setAudioBlob(null)}
                                        className="p-4 bg-white border-2 border-red-100 rounded-2xl hover:bg-red-50 text-red-500"
                                    >
                                        <RefreshCcw size={24} />
                                    </button>
                                </div>
                            </div>
                         )}
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* FOOTER NAV */}
      <div className="w-full max-w-5xl flex justify-end px-6 pb-8 z-20">
          <button 
            onClick={handleNextStep}
            disabled={loading || (currentQ.type === 'speaking' && !audioBlob)}
            className={`
                px-10 py-4 rounded-2xl font-black text-xl flex items-center gap-3 transition-all
                ${loading 
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                    : 'bg-indigo-600 text-white shadow-[0_8px_0_#312e81] hover:-translate-y-1 hover:shadow-[0_12px_0_#312e81] active:translate-y-2 active:shadow-none'
                }
            `}
          >
            {loading ? <Loader2 className="animate-spin" /> : <>Next Question <ArrowRight strokeWidth={4}/></>}
          </button>
      </div>

    </div>
  );
}