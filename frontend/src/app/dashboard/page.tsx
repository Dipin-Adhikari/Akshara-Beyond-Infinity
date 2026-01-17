"use client";
import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  BookOpen,
  Zap,
  Clock,
  Brain,
  Settings,
  RefreshCcw,
  Star,
  CheckCircle2,
  Eye,
  Volume2,
  FileText,
  Ear,
  MessageSquare,
  PenTool,
  ChevronDown,
  ChevronUp,
  Plus,
  Volume1,
  Map
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import DashboardCard from '@/components/dashboard/DashboardCard';
import ActivityCard from '@/components/dashboard/ActivityCard';
import ProgressBar from '@/components/dashboard/ProgressBar';
import AddContentModal from '@/components/dashboard/AddContentModal';

const USER_ID = 'child_123'; // This should come from auth context

export default function Dashboard() {
  const [learningIssues, setLearningIssues] = useState<any[]>([]);
  const [activityHistory, setActivityHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    issues: true,
    activities: true,
    parentControl: false
  });
  const [simpleIssueTooltip, setSimpleIssueTooltip] = useState<string | null>(null);
  const [progressReportTooltip, setProgressReportTooltip] = useState<string | null>(null);
  const [addContentModal, setAddContentModal] = useState<{ isOpen: boolean; type: 'sound' | 'letter' | null }>({
    isOpen: false,
    type: null
  });
  const [contentLoading, setContentLoading] = useState(false);

  const API_BASE = 'http://localhost:8000/api';

  // Fetch all dashboard data
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch learning issues from backend
      const issuesRes = await fetch(`${API_BASE}/dashboard/learning-issues/${USER_ID}`);
      const issuesData = await issuesRes.json();
      let issues = issuesData.issues || [];
      
      // If no issues from backend, use mock data for demo
      if (issues.length === 0) {
        issues = [
          {
            "id": "phonic",
            "title": "Phonic Issues",
            "emoji": "🔤",
            "color": "from-blue-400 to-blue-500",
            "description": "Difficulty in associating sounds with letters or letter combinations",
            "progress": 80,
            "attempts": 15,
            "correct": 12,
            "wrong": 3
          },
          {
            "id": "comprehensive",
            "title": "Comprehension Issues",
            "emoji": "📖",
            "color": "from-purple-400 to-purple-500",
            "description": "Challenges in understanding and grasping written content",
            "progress": 75,
            "attempts": 8,
            "correct": 6,
            "wrong": 2
          },
          {
            "id": "vocabulary",
            "title": "Vocabulary Issues",
            "emoji": "📚",
            "color": "from-green-400 to-green-500",
            "description": "Limited word recognition and vocabulary building difficulties",
            "progress": 80,
            "attempts": 10,
            "correct": 8,
            "wrong": 2
          },
          {
            "id": "writing",
            "title": "Writing Issues",
            "emoji": "✍️",
            "color": "from-pink-400 to-pink-500",
            "description": "Difficulty in written expression and spelling accuracy",
            "progress": 80,
            "attempts": 4,
            "correct": 3,
            "wrong": 1
          }
        ];
      }
      
      setLearningIssues(issues);

      // Fetch activity history from backend
      const activitiesRes = await fetch(`${API_BASE}/dashboard/activity-history/${USER_ID}`);
      const activitiesData = await activitiesRes.json();
      setActivityHistory(activitiesData.activities || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // If backend fails, show mock data
      setLearningIssues([
        {
          "id": "phonic",
          "title": "Phonic Issues",
          "emoji": "🔤",
          "color": "from-blue-400 to-blue-500",
          "description": "Difficulty in associating sounds with letters or letter combinations",
          "progress": 80,
          "attempts": 15,
          "correct": 12,
          "wrong": 3
        },
        {
          "id": "comprehensive",
          "title": "Comprehension Issues",
          "emoji": "📖",
          "color": "from-purple-400 to-purple-500",
          "description": "Challenges in understanding and grasping written content",
          "progress": 75,
          "attempts": 8,
          "correct": 6,
          "wrong": 2
        },
        {
          "id": "vocabulary",
          "title": "Vocabulary Issues",
          "emoji": "📚",
          "color": "from-green-400 to-green-500",
          "description": "Limited word recognition and vocabulary building difficulties",
          "progress": 80,
          "attempts": 10,
          "correct": 8,
          "wrong": 2
        },
        {
          "id": "writing",
          "title": "Writing Issues",
          "emoji": "✍️",
          "color": "from-pink-400 to-pink-500",
          "description": "Difficulty in written expression and spelling accuracy",
          "progress": 80,
          "attempts": 4,
          "correct": 3,
          "wrong": 1
        }
      ]);
      setActivityHistory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const openAddContentModal = (type: 'sound' | 'letter') => {
    setAddContentModal({ isOpen: true, type });
  };

  const closeAddContentModal = () => {
    setAddContentModal({ isOpen: false, type: null });
  };

  const handleContentAdded = async (data: any) => {
    // Refresh learning issues after adding content
    await fetchDashboardData();
    closeAddContentModal();
  };

  const handleAddModule = async (moduleType: 'sound-safari' | 'twin-letters-ar') => {
    try {
      const endpoint = moduleType === 'sound-safari' 
        ? `${API_BASE}/modules/sound-safari/add?user_id=${USER_ID}`
        : `${API_BASE}/modules/twin-letters-ar/add?user_id=${USER_ID}`;
      
      console.log('Calling endpoint:', endpoint);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      console.log('Response status:', response.status);
      
      const data = await response.json();
      console.log('Response data:', data);
      
      if (data.status === 'success' || data.status === 'already_exists') {
        // Refresh dashboard to show updated modules
        await fetchDashboardData();
        alert(`${data.name} ${data.status === 'success' ? 'added' : 'already exists'} successfully! ✅`);
      } else {
        alert(`Error: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error(`Error adding module:`, error);
      alert(`Failed to add module: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="text-6xl"
        >
          📚
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-4xl">📚</div>
            <div>
              <h1 className="text-2xl font-black text-slate-900">Learning Dashboard</h1>
              <p className="text-sm text-slate-600 font-medium">Good morning, learner! 👋</p>
            </div>
          </div>
          
          <motion.button
            onClick={handleRefresh}
            disabled={refreshing}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2 rounded-lg font-bold text-sm hover:bg-slate-800 transition-all shadow-md"
          >
            <RefreshCcw size={18} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Loading...' : 'Refresh'}
          </motion.button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* === SECTION 1: LEARNING ISSUES & PROGRESS === */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-white rounded-3xl shadow-lg border border-slate-100 mb-8"
        >
          {/* Section Header */}
          <div className="px-6 pt-6 pb-2 flex items-center gap-3">
            <div className="text-3xl">🧠</div>
            <h2 className="text-2xl font-black text-slate-900">Learning Issues & Progress</h2>
          </div>

          {/* 4 Flashcards - Always Visible at Top */}
          <div className="px-6 pt-4 pb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {learningIssues && learningIssues.length > 0 ? (
                learningIssues.map((issue) => (
                  <motion.div
                    key={issue.id}
                    whileHover={{ scale: 1.05, y: -4 }}
                    className={`bg-gradient-to-br ${issue.color} rounded-2xl p-6 text-white shadow-lg relative group cursor-pointer min-h-32 flex flex-col justify-between`}
                  >
                    {/* Top: Emoji and Eye Button */}
                    <div className="flex justify-between items-start">
                      <div className="text-4xl">{issue.emoji}</div>
                      <motion.button
                        whileHover={{ scale: 1.2 }}
                        onClick={() => setSimpleIssueTooltip(simpleIssueTooltip === issue.id ? null : issue.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity bg-white bg-opacity-20 p-2 rounded-full hover:bg-opacity-30"
                        title="What does this issue mean?"
                      >
                        <Eye size={20} />
                      </motion.button>
                    </div>

                    {/* Middle: Title Only */}
                    <h4 className="font-black text-lg mb-4">{issue.title}</h4>

                    {/* Info Tooltip */}
                    {simpleIssueTooltip === issue.id && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute inset-0 bg-slate-900 bg-opacity-95 rounded-2xl p-4 flex flex-col justify-between z-50 backdrop-blur-sm"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-black text-sm mb-2">{issue.title}</p>
                            <p className="text-xs leading-relaxed text-slate-200">{issue.description}</p>
                          </div>
                          <button
                            onClick={() => setSimpleIssueTooltip(null)}
                            className="text-slate-400 hover:text-white text-lg font-bold"
                          >
                            ✕
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
              ))
              ) : (
                <div className="col-span-1 md:col-span-2 lg:col-span-4 text-center py-8">
                  <p className="text-slate-500 font-medium">Loading learning issues...</p>
                </div>
              )}
            </div>
          </div>

          {/* Section Header */}
          <motion.div
            onClick={() => toggleSection('issues')}
            className="px-6 py-4 cursor-pointer hover:bg-slate-50 transition-colors flex items-center justify-between border-t border-slate-100"
          >
            <div className="flex items-center gap-3">
              <Brain size={28} className="text-purple-500" />
              <h3 className="text-lg font-black text-slate-900">Learning Issues & Progress</h3>
            </div>
            <motion.div
              animate={{ rotate: expandedSections.issues ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDown size={24} className="text-slate-600" />
            </motion.div>
          </motion.div>

          {expandedSections.issues && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="px-6 pb-6 border-t border-slate-200"
            >
              {/* Detailed Report Section - 4 Flashcards with Eye Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-purple-50 via-pink-50 to-blue-50 rounded-2xl p-6 border-2 border-purple-200 mb-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="text-2xl">📊</div>
                  <h4 className="font-black text-slate-900">Learning Progress Report</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {learningIssues.map((issue) => {
                    const accuracy = issue.attempts > 0 ? Math.round((issue.correct / issue.attempts) * 100) : 0;
                    const statusIcon = accuracy >= 80 ? '🎯' : accuracy >= 60 ? '📈' : '⚠️';
                    
                    return (
                      <motion.div
                        key={issue.id}
                        whileHover={{ scale: 1.02, y: -4 }}
                        className={`bg-gradient-to-br ${issue.color} rounded-2xl p-4 text-white shadow-lg relative group cursor-pointer`}
                      >
                        {/* Header with emoji and eye button */}
                        <div className="flex justify-between items-start mb-3">
                          <div className="text-4xl">{issue.emoji}</div>
                          <motion.button
                            whileHover={{ scale: 1.2 }}
                            onClick={() => setProgressReportTooltip(progressReportTooltip === issue.id ? null : issue.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity bg-white bg-opacity-20 p-1.5 rounded-full hover:bg-opacity-30"
                            title="What does this issue mean?"
                          >
                            <Eye size={18} />
                          </motion.button>
                        </div>

                        {/* Title and Status */}
                        <h5 className="font-black text-sm mb-1">{issue.title}</h5>
                        <p className="text-xs opacity-90 mb-3">{statusIcon} {accuracy}% Accuracy</p>

                        {/* Metrics */}
                        <div className="space-y-2 text-xs mb-3">
                          <div className="flex justify-between">
                            <span>Attempts:</span>
                            <span className="font-bold">{issue.attempts}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>✓ Correct:</span>
                            <span className="font-bold text-green-100">{issue.correct}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>✗ Incorrect:</span>
                            <span className="font-bold text-red-100">{issue.wrong}</span>
                          </div>
                        </div>

                        {/* Progress bar */}
                        <div className="w-full bg-white bg-opacity-30 rounded-full h-2.5">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${issue.progress}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="bg-white h-2.5 rounded-full shadow-lg"
                          />
                        </div>
                        <p className="text-xs mt-2 font-bold">Progress: {Math.round(issue.progress)}%</p>

                        {/* Eye Button Tooltip */}
                        {progressReportTooltip === issue.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute inset-0 bg-slate-900 bg-opacity-95 rounded-2xl p-4 flex flex-col justify-between z-50 backdrop-blur-sm"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-black text-sm mb-2">{issue.title}</p>
                                <p className="text-xs leading-relaxed text-slate-200">{issue.description}</p>
                              </div>
                              <button
                                onClick={() => setProgressReportTooltip(null)}
                                className="text-slate-400 hover:text-white text-lg font-bold"
                              >
                                ✕
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>

                {/* Tips section */}
                <div className="mt-6 pt-4 border-t border-purple-200">
                  <p className="text-sm text-slate-700 font-medium">
                    💡 <span className="font-bold">Tips:</span> Focus on issues with lower progress. Regular practice improves accuracy. Keep consistent!
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </motion.div>

        {/* === SECTION 2: RECENT ACTIVITIES === */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="bg-white rounded-3xl shadow-lg border border-slate-100 mb-8"
        >
          <motion.div
            onClick={() => toggleSection('activities')}
            className="p-6 cursor-pointer hover:bg-slate-50 transition-colors flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <Zap size={28} className="text-orange-500" />
              <h3 className="text-lg font-black text-slate-900">Your Recent Activities</h3>
            </div>
            <motion.div
              animate={{ rotate: expandedSections.activities ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDown size={24} className="text-slate-600" />
            </motion.div>
          </motion.div>

          {expandedSections.activities && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="px-6 pb-6 border-t border-slate-200"
            >
              {/* Activities List */}
              {activityHistory && activityHistory.length > 0 ? (
                <div className="space-y-3 mb-6">
                  {activityHistory.map((activity) => {
                    const isCorrect = activity.correct;
                    const timestamp = activity.timestamp ? new Date(activity.timestamp).toLocaleString() : 'Just now';
                    
                    return (
                      <motion.div
                        key={activity._id || Math.random()}
                        whileHover={{ x: 4, scale: 1.01 }}
                        className={`rounded-2xl p-4 border-2 flex items-center justify-between shadow-sm hover:shadow-md transition-all ${
                          isCorrect 
                            ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300' 
                            : 'bg-gradient-to-r from-orange-50 to-red-50 border-orange-300'
                        }`}
                      >
                        <div className="flex items-center gap-4 flex-1">
                          {/* Module Icon */}
                          <div className={`p-3 rounded-xl font-black text-xl ${
                            activity.module?.includes('Sound') 
                              ? 'bg-blue-100 text-blue-600' 
                              : activity.module?.includes('Twin')
                              ? 'bg-purple-100 text-purple-600'
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {activity.emoji || '📚'}
                          </div>
                          
                          {/* Activity Details */}
                          <div className="flex-1">
                            <p className="font-black text-slate-900 text-sm">{activity.module || 'Activity'}</p>
                            <p className="text-xs text-slate-600 mt-1">{timestamp}</p>
                            {activity.content && (
                              <p className="text-xs text-slate-600 opacity-75 mt-1">Content: {activity.content.substring(0, 40)}...</p>
                            )}
                          </div>
                        </div>

                        {/* Performance Stats */}
                        <div className="flex items-center gap-3 ml-4">
                          <div className={`text-center px-3 py-2 rounded-lg font-bold ${
                            isCorrect
                              ? 'bg-green-200 text-green-700'
                              : 'bg-orange-200 text-orange-700'
                          }`}>
                            <p className="text-lg">{isCorrect ? '✓' : '✗'}</p>
                            <p className="text-xs font-bold">{isCorrect ? 'Correct' : 'Review'}</p>
                          </div>
                          
                          {activity.response_time_ms && (
                            <div className="text-right hidden sm:block">
                              <p className="text-xs text-slate-600 font-medium">{(activity.response_time_ms / 1000).toFixed(1)}s</p>
                              <p className="text-xs text-slate-500">Response Time</p>
                            </div>
                          )}
                          
                          {activity.level && (
                            <div className="text-center hidden sm:block">
                              <p className="text-lg font-black text-slate-900">L{activity.level}</p>
                              <p className="text-xs text-slate-600">Level</p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-slate-600 font-medium">No activities yet</p>
                  <p className="text-xs text-slate-500 mt-1">Start practicing to see your activity history!</p>
                </div>
              )}
              
              {/* Module Info Cards */}
              <div className="mt-6 p-4 bg-slate-50 rounded-2xl border-2 border-slate-300">
                <p className="text-sm font-black text-slate-900 mb-3">📚 About Activity Types</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="flex gap-2">
                    <span className="text-xl">🦁</span>
                    <div>
                      <p className="font-bold text-slate-900">Sound Safari</p>
                      <p className="text-slate-600">Audio-based learning for phonics</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-xl">📱</span>
                    <div>
                      <p className="font-bold text-slate-900">Twin Letters AR</p>
                      <p className="text-slate-600">AR experience for letter pairs</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* === SECTION 3: PARENT & TEACHER CONTROLS === */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl shadow-lg mb-8 text-white overflow-hidden"
        >
          <motion.div
            onClick={() => toggleSection('parentControl')}
            className="p-6 cursor-pointer hover:bg-white/5 transition-colors flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="bg-yellow-400/20 p-3 rounded-xl">
                <Settings size={28} className="text-yellow-400" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Parent & Teacher Controls</h3>
                <p className="text-xs text-slate-400">Manage modules and add new learning content</p>
              </div>
            </div>
            <motion.div
              animate={{ rotate: expandedSections.parentControl ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDown size={24} className="text-slate-400" />
            </motion.div>
          </motion.div>

          {expandedSections.parentControl && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="px-6 pb-8 border-t border-slate-700/50"
            >
              <p className="text-sm text-slate-400 mt-4 mb-6">
                Activate new learning modules or add specific exercises for your child.
              </p>

              {/* Module Management Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* 🦁 Sound Safari Module Card */}
                <motion.div 
                  whileHover={{ y: -4 }}
                  className="bg-slate-800 rounded-2xl p-6 border border-slate-700 relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                  
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-blue-500/20 p-3 rounded-xl">
                      <Volume2 size={24} className="text-blue-400" />
                    </div>
                    <span className="px-3 py-1 bg-blue-500/10 text-blue-300 text-xs font-bold rounded-full border border-blue-500/20">
                      Phonics
                    </span>
                  </div>

                  <h4 className="text-xl font-black text-white mb-2">Sound Safari</h4>
                  <p className="text-sm text-slate-400 mb-6">
                    Audio-based learning to associate sounds with animals and objects.
                  </p>

                  <div className="space-y-3">
                    {/* Add Content Button */}
                    <button
                      onClick={() => openAddContentModal('sound')}
                      className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-900/20"
                    >
                      <Plus size={18} />
                      Add New Sound
                    </button>
                    
                    {/* Activate Module Button */}
                    <button
                      onClick={() => handleAddModule('sound-safari')}
                      className="w-full flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-200 py-3 rounded-xl font-bold text-sm transition-all border border-slate-600"
                    >
                      <Zap size={18} className="text-yellow-400" />
                      Activate Module
                    </button>
                  </div>
                </motion.div>

                {/* 👯 Twin Letters Module Card */}
                <motion.div 
                  whileHover={{ y: -4 }}
                  className="bg-slate-800 rounded-2xl p-6 border border-slate-700 relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                  
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-purple-500/20 p-3 rounded-xl">
                      <Map size={24} className="text-purple-400" />
                    </div>
                    <span className="px-3 py-1 bg-purple-500/10 text-purple-300 text-xs font-bold rounded-full border border-purple-500/20">
                      AR Visuals
                    </span>
                  </div>

                  <h4 className="text-xl font-black text-white mb-2">Twin Letters AR</h4>
                  <p className="text-sm text-slate-400 mb-6">
                    Augmented reality exercises for matching letter pairs and patterns.
                  </p>

                  <div className="space-y-3">
                    {/* Add Content Button */}
                    <button
                      onClick={() => openAddContentModal('letter')}
                      className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-purple-900/20"
                    >
                      <Plus size={18} />
                      Add Letter Pair
                    </button>
                    
                    {/* Activate Module Button */}
                    <button
                      onClick={() => handleAddModule('twin-letters-ar')}
                      className="w-full flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-200 py-3 rounded-xl font-bold text-sm transition-all border border-slate-600"
                    >
                      <Zap size={18} className="text-yellow-400" />
                      Activate Module
                    </button>
                  </div>
                </motion.div>

              </div>
            </motion.div>
          )}
        </motion.div>
    </div>
</div>
  );
}