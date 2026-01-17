import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Volume2, Map, Plus, Upload } from 'lucide-react';

interface AddContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentType: 'sound' | 'letter' | null;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

export default function AddContentModal({
  isOpen,
  onClose,
  contentType,
  onSubmit,
  isLoading = false
}: AddContentModalProps) {
  const [soundData, setSoundData] = useState({
    word: '',
    sound: '',
    difficulty: 'easy',
    category: 'animals'
  });

  const [letterData, setLetterData] = useState({
    letterPair: '',
    description: '',
    difficulty: 'easy',
    imageUrl: ''
  });

  const handleSoundSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!soundData.word.trim() || !soundData.sound.trim()) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const response = await fetch('/api/content/sounds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          word: soundData.word,
          sound: soundData.sound,
          difficulty: soundData.difficulty,
          category: soundData.category
        })
      });

      if (response.ok) {
        const result = await response.json();
        onSubmit(result);
        setSoundData({ word: '', sound: '', difficulty: 'easy', category: 'animals' });
      }
    } catch (error) {
      console.error('Error adding sound:', error);
    }
  };

  const handleLetterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!letterData.letterPair.trim()) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const response = await fetch('/api/content/letters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          letterPair: letterData.letterPair,
          description: letterData.description,
          difficulty: letterData.difficulty,
          imageUrl: letterData.imageUrl
        })
      });

      if (response.ok) {
        const result = await response.json();
        onSubmit(result);
        setLetterData({ letterPair: '', description: '', difficulty: 'easy', imageUrl: '' });
      }
    } catch (error) {
      console.error('Error adding letter pair:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {contentType === 'sound' ? (
              <>
                <Volume2 size={28} className="text-white" />
                <h2 className="text-xl font-black text-white">Add Sound Safari</h2>
              </>
            ) : (
              <>
                <Map size={28} className="text-white" />
                <h2 className="text-xl font-black text-white">Add Twin Letters</h2>
              </>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 p-1.5 rounded-full transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {contentType === 'sound' ? (
            <form onSubmit={handleSoundSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">
                  Word / Sound
                </label>
                <input
                  type="text"
                  placeholder="e.g., Lion"
                  value={soundData.word}
                  onChange={(e) => setSoundData({ ...soundData, word: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">
                  Audio URL
                </label>
                <input
                  type="text"
                  placeholder="https://example.com/sound.mp3"
                  value={soundData.sound}
                  onChange={(e) => setSoundData({ ...soundData, sound: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-2">
                    Difficulty
                  </label>
                  <select
                    value={soundData.difficulty}
                    onChange={(e) => setSoundData({ ...soundData, difficulty: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 font-medium"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-2">
                    Category
                  </label>
                  <select
                    value={soundData.category}
                    onChange={(e) => setSoundData({ ...soundData, category: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 font-medium"
                  >
                    <option value="animals">Animals</option>
                    <option value="objects">Objects</option>
                    <option value="actions">Actions</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-slate-400 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <Plus size={20} />
                {isLoading ? 'Adding...' : 'Add Sound'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleLetterSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">
                  Letter Pair
                </label>
                <input
                  type="text"
                  placeholder="e.g., AB or th"
                  maxLength={3}
                  value={letterData.letterPair}
                  onChange={(e) => setLetterData({ ...letterData, letterPair: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-purple-500 font-bold text-center text-xl"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">
                  Description
                </label>
                <textarea
                  placeholder="e.g., Make the sound together"
                  rows={3}
                  value={letterData.description}
                  onChange={(e) => setLetterData({ ...letterData, description: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-purple-500 font-medium resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-2">
                    Difficulty
                  </label>
                  <select
                    value={letterData.difficulty}
                    onChange={(e) => setLetterData({ ...letterData, difficulty: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-purple-500 font-medium"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-2">
                    Image URL
                  </label>
                  <input
                    type="text"
                    placeholder="Optional"
                    value={letterData.imageUrl}
                    onChange={(e) => setLetterData({ ...letterData, imageUrl: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-purple-500 font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-slate-400 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <Plus size={20} />
                {isLoading ? 'Adding...' : 'Add Letter Pair'}
              </button>
            </form>
          )}

          <p className="text-xs text-slate-600 text-center mt-4">
            📌 Content will be available for learners immediately
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
