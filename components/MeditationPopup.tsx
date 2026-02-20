'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';

interface MeditationPopupProps {
  mantra: string;
  weekName: string;
  userId: string;
}

export default function MeditationPopup({ mantra, weekName, userId }: MeditationPopupProps) {
  const [showPopup, setShowPopup] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isTimerComplete, setIsTimerComplete] = useState(false);
  const [audioMode, setAudioMode] = useState<'nature' | 'naruto' | 'mute'>('nature');
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'exhale'>('inhale');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const checkMeditation = async () => {
      const today = new Date().toISOString().split('T')[0];
      
      const { data: profileData } = await supabase
        .from('profiles')
        .select('last_meditation_completed')
        .eq('user_id', userId)
        .single();

      const lastMeditation = profileData?.last_meditation_completed;
      
      if (!lastMeditation || lastMeditation !== today) {
        setShowPopup(true);
      }
    };

    if (userId) {
      checkMeditation();
    }
  }, [userId]);

  // Timer countdown
  useEffect(() => {
    if (!showPopup || timeLeft === 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsTimerComplete(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showPopup, timeLeft]);

  // Breath animation
  useEffect(() => {
    if (!showPopup) return;

    const breathTimer = setInterval(() => {
      setBreathPhase(prev => prev === 'inhale' ? 'exhale' : 'inhale');
    }, 4000);

    return () => clearInterval(breathTimer);
  }, [showPopup]);

  // Audio control
  useEffect(() => {
    if (!showPopup) return;

    if (audioMode === 'mute') {
      audioRef.current?.pause();
      return;
    }

    const audioSrc = audioMode === 'nature' 
      ? '/audio/nature-meditation.mp3' 
      : '/audio/naruto-meditation.mp3';

    if (audioRef.current) {
      audioRef.current.src = audioSrc;
      audioRef.current.volume = 0.3;
      audioRef.current.loop = true;
      audioRef.current.play().catch(e => console.log('Audio autoplay blocked:', e));
    }

    return () => {
      audioRef.current?.pause();
    };
  }, [showPopup, audioMode]);

  const completeMeditation = async () => {
    if (!isTimerComplete) return;

    const today = new Date().toISOString().split('T')[0];
    
    await supabase
      .from('profiles')
      .update({ last_meditation_completed: today })
      .eq('user_id', userId);

    setShowPopup(false);
    audioRef.current?.pause();
  };

  if (!showPopup || !mantra) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 animate-fadeIn overflow-y-auto">
      <audio ref={audioRef} />
      
      <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 rounded-3xl shadow-2xl w-full max-w-lg p-6 md:p-10 relative animate-scaleIn my-auto">
        
        <div className="text-center mb-6">
          <div className="text-5xl md:text-6xl mb-3">🧘‍♂️</div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
            Respiro Consapevole
          </h2>
          <p className="text-xs md:text-sm text-gray-600 mb-2">
            {weekName}
          </p>
          <p className="text-sm md:text-base text-gray-700 font-medium">
            Prima di proseguire, prenditi un minuto per te
          </p>
        </div>

        {/* Mantra */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 md:p-6 mb-6 border border-purple-200">
          <p className="text-base md:text-lg text-purple-900 italic font-medium text-center leading-relaxed">
            "{mantra}"
          </p>
        </div>

        {/* Timer e animazione respiro */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative w-36 h-36 md:w-48 md:h-48 mb-4 md:mb-6">
            <div 
              className={`absolute inset-0 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 transition-transform duration-[4000ms] ease-in-out ${
                breathPhase === 'inhale' ? 'scale-100' : 'scale-75'
              }`}
              style={{ opacity: 0.6 }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-white mb-1 md:mb-2">
                  {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </div>
                <div className="text-xs md:text-sm text-white/90 font-medium">
                  {breathPhase === 'inhale' ? '🌬️ Inspira...' : '💨 Espira...'}
                </div>
              </div>
            </div>
          </div>

          {/* Toggle Audio */}
          <div className="flex gap-1 md:gap-2 bg-white/60 backdrop-blur-sm rounded-full p-1.5 md:p-2">
            <button
              onClick={() => setAudioMode('nature')}
              className={`px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-semibold transition-all ${
                audioMode === 'nature'
                  ? 'bg-green-500 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              🌊 Natura
            </button>
            <button
              onClick={() => setAudioMode('naruto')}
              className={`px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-semibold transition-all ${
                audioMode === 'naruto'
                  ? 'bg-orange-500 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              🍥 Naruto
            </button>
            <button
              onClick={() => setAudioMode('mute')}
              className={`px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-semibold transition-all ${
                audioMode === 'mute'
                  ? 'bg-gray-500 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              🔇
            </button>
          </div>
        </div>

        {/* Bottone completamento */}
        <button
          onClick={completeMeditation}
          disabled={!isTimerComplete}
          className={`w-full font-bold py-3 md:py-4 rounded-2xl transition-all text-sm md:text-base ${
            isTimerComplete
              ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white cursor-pointer'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isTimerComplete ? 'Continua 🌅' : 'Respira consapevolmente...'}
        </button>

        {!isTimerComplete && (
          <p className="text-xs text-center text-gray-500 mt-3">
            Questo minuto è solo tuo 💙
          </p>
        )}
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}