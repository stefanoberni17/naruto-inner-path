'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const WEEK_NAMES: Record<number, string> = {
  1: 'Week 1 - La ferita del rifiuto',
  2: 'Week 2 - La ferita del rifiuto',
  3: 'Week 3 - Presenza e ascolto',
  4: 'Week 4 - Presenza e ascolto',
  5: 'Week 5 - Valore e appartenenza',
  6: 'Week 6 - Valore e appartenenza',
};

const WEEK_IDS: Record<number, string> = {
  1: '2b1655f7-26c7-8025-8afe-df0ed131d708',
  2: '2b1655f7-26c7-8025-8afe-df0ed131d708',
  3: '2b1655f7-26c7-8054-a0d4-c4a48c509852',
  4: '2b1655f7-26c7-8054-a0d4-c4a48c509852',
  5: '2b1655f7-26c7-8038-bd91-c3fa9e5b31cb',
  6: '2b1655f7-26c7-8038-bd91-c3fa9e5b31cb',
};

const DAY_LABELS: Record<string, string> = {
  day1: '1', day2: '2', day3: '3', day4: '4', day5: '5', day6: '6', day7: '7',
  day8: '8', day9: '9', day10: '10', day11: '11', day12: '12', day13: '13', day14: '14',
};

const DAY_KEYS = ['day1', 'day2', 'day3', 'day4', 'day5', 'day6', 'day7', 'day8', 'day9', 'day10', 'day11', 'day12', 'day13', 'day14'] as const;
type DayKey = typeof DAY_KEYS[number];

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [completedEpisodes, setCompletedEpisodes] = useState(0);
  const [weekData, setWeekData] = useState<any>(null);
  
  // ✅ Meditation popup state
  const [showMeditationPopup, setShowMeditationPopup] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isTimerComplete, setIsTimerComplete] = useState(false);
  const [audioMode, setAudioMode] = useState<'nature' | 'naruto' | 'mute'>('nature');
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'exhale'>('inhale');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // ✅ Pratiche state
  const [practices, setPractices] = useState<any[]>([]);
  const [loadingPractices, setLoadingPractices] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login');
        return;
      }

      setUser(session.user);

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      setProfile(profileData);

      // ✅ Check se mostrare popup meditazione
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const lastMeditation = profileData?.last_meditation_completed;
      
      if (!lastMeditation || lastMeditation !== today) {
        setShowMeditationPopup(true);
      }

      const { count } = await supabase
        .from('user_episode_progress')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', session.user.id)
        .eq('completed', true);

      setCompletedEpisodes(count || 0);

      const currentWeek = profileData?.current_week || 1;
      const weekId = WEEK_IDS[currentWeek];
      
      if (weekId) {
        const response = await fetch(`/api/settimana?id=${weekId}`);
        const data = await response.json();
        setWeekData(data);
      }

      // ✅ Carica pratiche
      loadPractices(session.user.id, currentWeek);

      setLoading(false);
    };

    checkUser();
  }, [router]);

  // ✅ Timer countdown
  useEffect(() => {
    if (!showMeditationPopup || timeLeft === 0) return;

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
  }, [showMeditationPopup, timeLeft]);

  // ✅ Breath animation (4s inhale, 4s exhale)
  useEffect(() => {
    if (!showMeditationPopup) return;

    const breathTimer = setInterval(() => {
      setBreathPhase(prev => prev === 'inhale' ? 'exhale' : 'inhale');
    }, 4000);

    return () => clearInterval(breathTimer);
  }, [showMeditationPopup]);

  // ✅ Audio control
  useEffect(() => {
    if (!showMeditationPopup) return;

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
  }, [showMeditationPopup, audioMode]);

  const loadPractices = async (userId: string, weekNumber: number) => {
    setLoadingPractices(true);
    try {
      const response = await fetch(`/api/practices?userId=${userId}&weekNumber=${weekNumber}`);
      const data = await response.json();
      setPractices(data.practices || []);
    } catch (error) {
      console.error('Errore caricamento pratiche:', error);
    } finally {
      setLoadingPractices(false);
    }
  };

  const togglePracticeDay = async (practiceNumber: number, day: DayKey) => {
    const practice = practices.find(p => p.practice_number === practiceNumber);
    if (!practice) return;

    const currentValue = practice.completed_days[day];
    const newValue = !currentValue;

    setPractices(prev => prev.map(p => 
      p.practice_number === practiceNumber
        ? { ...p, completed_days: { ...p.completed_days, [day]: newValue } }
        : p
    ));

    try {
      await fetch('/api/practices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          weekNumber: profile.current_week,
          practiceNumber,
          day,
          completed: newValue,
        }),
      });
    } catch (error) {
      console.error('Errore salvataggio pratica:', error);
      setPractices(prev => prev.map(p => 
        p.practice_number === practiceNumber
          ? { ...p, completed_days: { ...p.completed_days, [day]: currentValue } }
          : p
      ));
    }
  };

  const completeMeditation = async () => {
    if (!isTimerComplete) return;

    const today = new Date().toISOString().split('T')[0];
    
    await supabase
      .from('profiles')
      .update({ last_meditation_completed: today })
      .eq('user_id', user.id);

    setShowMeditationPopup(false);
    audioRef.current?.pause();
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-orange-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🍥</div>
          <p className="text-xl text-gray-600">Caricamento...</p>
        </div>
      </main>
    );
  }

  const currentWeek = profile?.current_week || 1;
  const progressPercentage = Math.round((completedEpisodes / 19) * 100);
  
  const properties = weekData?.page?.properties || {};
  const pratiche = (properties.Pratiche?.rich_text?.[0]?.plain_text || '')
    .replace(/<br>/g, '\n');
  const mantra = (properties.Mantra?.rich_text?.[0]?.plain_text || '')
    .replace(/<br>/g, '\n');

  const practicheArray = pratiche.split('\n').filter((p: string) => p.trim().length > 0);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <>
      {/* ✅ POPUP MEDITAZIONE CON TIMER - RESPONSIVE FIX */}
        {showMeditationPopup && mantra && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 animate-fadeIn overflow-y-auto">
            <audio ref={audioRef} />
            
            <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 rounded-3xl shadow-2xl w-full max-w-lg p-6 md:p-10 relative animate-scaleIn my-auto">
              
              <div className="text-center mb-6">
                <div className="text-5xl md:text-6xl mb-3">🧘‍♂️</div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                  Respiro Consapevole
                </h2>
                <p className="text-xs md:text-sm text-gray-600">
                  {WEEK_NAMES[currentWeek]}
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
                  {/* Cerchio pulsante */}
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
                {isTimerComplete ? 'Inizia la giornata 🌅' : 'Completa il respiro...'}
              </button>

              {!isTimerComplete && (
                <p className="text-xs text-center text-gray-500 mt-3">
                  Prenditi questo minuto per te stesso 💙
                </p>
              )}
            </div>
          </div>
        )}

  
      <main className="min-h-screen bg-gradient-to-b from-orange-50 to-orange-100 py-8 px-4 pb-24">
        {/* Header */}
        <div className="max-w-6xl mx-auto mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Ciao, {profile?.name || 'Guerriero'}! 👋
          </h1>
          <p className="text-gray-600 mt-1">
            Benvenuto nella tua dashboard personale
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Card Week corrente */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 mb-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm mb-1">📍 Sei qui</p>
                <h2 className="text-2xl font-bold">
                  {WEEK_NAMES[currentWeek] || `Week ${currentWeek}`}
                </h2>
              </div>
              <div className="text-5xl">🍥</div>
            </div>
          </div>

          {/* ✅ 1. MANTRA (SOPRA - 1° POSTO) */}
          {mantra && (
            <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-l-4 border-purple-500 p-6 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-bold text-purple-800 flex items-center gap-2">
                    <span>🔮</span>
                    <span>Mantra della Settimana</span>
                  </h3>
                  <button
                    onClick={() => {
                      setShowMeditationPopup(true);
                      setTimeLeft(60);
                      setIsTimerComplete(false);
                    }}
                    className="text-xs text-purple-600 hover:text-purple-800 underline"
                  >
                    Ripeti meditazione
                  </button>
                </div>
                <p className="text-purple-900 text-lg italic font-medium whitespace-pre-line">
                  "{mantra}"
                </p>
              </div>
            </div>
          )}

          {/* ✅ 2. PRATICHE (SOPRA - 2° POSTO) - 14 GIORNI */}
          {practicheArray.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                <span>✨</span>
                <span>Pratiche della Settimana</span>
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                Opzionale - per aiutarti a ricordare le pratiche nei 14 giorni (2 settimane)
              </p>

              <div className="space-y-4">
                {practicheArray.slice(0, 3).map((praticaText: string, index: number) => {
                  const practice = practices.find(p => p.practice_number === index + 1);
                  const completedDays = practice?.completed_days || {};
                  const completedCount = DAY_KEYS.filter(day => completedDays[day]).length;

                  return (
                    <div key={index} className="bg-gradient-to-r from-green-50 to-teal-50 border-l-4 border-green-500 p-5 rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-bold text-green-800 mb-1">
                            {index + 1}. {praticaText}
                          </h3>
                          <p className="text-xs text-green-600">
                            {completedCount}/14 giorni completati
                          </p>
                        </div>
                      </div>

                      {/* Tracker 14 giorni - 2 righe da 7 */}
                      <div className="space-y-2 mt-3">
                        {/* Prima settimana (1-7) */}
                        <div className="flex gap-2">
                          {DAY_KEYS.slice(0, 7).map(day => (
                            <button
                              key={day}
                              onClick={() => togglePracticeDay(index + 1, day)}
                              disabled={loadingPractices}
                              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                                completedDays[day]
                                  ? 'bg-green-500 text-white'
                                  : 'bg-white text-gray-600 border border-gray-200 hover:border-green-300'
                              } disabled:opacity-50`}
                            >
                              {DAY_LABELS[day]}
                            </button>
                          ))}
                        </div>
                        {/* Seconda settimana (8-14) */}
                        <div className="flex gap-2">
                          {DAY_KEYS.slice(7, 14).map(day => (
                            <button
                              key={day}
                              onClick={() => togglePracticeDay(index + 1, day)}
                              disabled={loadingPractices}
                              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                                completedDays[day]
                                  ? 'bg-green-500 text-white'
                                  : 'bg-white text-gray-600 border border-gray-200 hover:border-green-300'
                              } disabled:opacity-50`}
                            >
                              {DAY_LABELS[day]}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <p className="text-xs text-gray-500 mt-4 text-center italic">
                💡 Questo tracker è solo per te - non influenza il percorso
              </p>
            </div>
          )}

          {/* ✅ 3. PROGRESSO (SOTTO - 3° POSTO) */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              🎯 Il Tuo Percorso
            </h2>
            <p className="text-gray-600 mb-6">
              Traccia i tuoi progressi attraverso il percorso MVP (19 episodi)
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded">
                <div className="text-3xl font-bold text-orange-600">{completedEpisodes}</div>
                <div className="text-sm text-gray-600">Episodi completati</div>
              </div>
              
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <div className="text-3xl font-bold text-blue-600">19</div>
                <div className="text-sm text-gray-600">Episodi totali MVP</div>
              </div>
              
              <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                <div className="text-3xl font-bold text-green-600">{progressPercentage}%</div>
                <div className="text-sm text-gray-600">Progressione</div>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progresso MVP</span>
                <span>{completedEpisodes}/19 episodi</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-orange-500 to-orange-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>

            <button
              onClick={() => router.push('/')}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-full transition-all transform hover:scale-105"
            >
              🚀 Esplora le Settimane
            </button>
          </div>
        </div>
      </main>

      {/* CSS Animations */}
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
    </>
  );
}