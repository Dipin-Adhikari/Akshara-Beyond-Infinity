"use client";
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

// Import your game components
import SoundSafari from '@/components/modules/SoundSafari';
import ArHunt from '@/components/modules/ArHunt'; 

export default function ModuleRunner() {
  const { id } = useParams(); // 'sound-safari', 'ar-hunt', etc.
  const router = useRouter();

  // ⚠️ TODO: Replace this with your actual user ID from auth context
  const currentUserId = "test-user-123"; 

  const renderGame = () => {
    switch (id) {
      case 'sound-safari':
        return <SoundSafari />;
        
      case 'twin-letters':
        // We pass the userId here so the component can fetch data
        return <ArHunt />;
        
      case 'word-builder':
        return <div className="text-center py-20 font-bold text-2xl text-slate-400">Word Builder Loading...</div>;
        
      default:
        return <div className="text-center py-20 font-bold text-2xl">Game Not Found</div>;
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFBEB] p-6">
      {/* Universal Header */}
      <div className="max-w-5xl mx-auto flex items-center mb-12">
        <button 
          onClick={() => router.push('/modules')}
          className="bg-white p-4 rounded-2xl shadow-sm border-2 border-slate-100 hover:bg-slate-50 transition-colors"
        >
          <ChevronLeft size={32} className="text-slate-600" />
        </button>
        <h1 className="ml-6 text-3xl font-black text-slate-800 capitalize">
          {id?.toString().replace('-', ' ')}
        </h1>
      </div>

      {/* The Dynamic Game Area */}
      <div className="max-w-5xl mx-auto">
        {renderGame()}
      </div>
    </div>
  );
}