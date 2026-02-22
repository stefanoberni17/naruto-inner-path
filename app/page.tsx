'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ChevronDown, ChevronUp } from 'lucide-react';

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

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [completedEpisodes, setCompletedEpisodes] = useState(0);
  const [weekData, setWeekData] = useState<any>(null);
  const [practices, setPractices] = useState<any[]>([]);
  const [loadingPractices, setLoadingPractices] = useState(false);
  const [expandedPractices, setExpandedPractices] = useState<Set<number>>(new Set());

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

      loadPractices(session.user.id, currentWeek);
      setLoading(false);
    };

    checkUser();
  }, [router]);

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

  const togglePracticeExpanded = (index: number) => {
    setExpandedPractices(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
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

  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50 to-orange-100 py-8 px-4 pb-24">
      <div className="max-w-6xl mx-auto mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Ciao, {profile?.name || 'Guerriero'}! 👋
        </h1>
        <p className="text-gray-600 mt-1">
          Benvenuto nella tua dashboard personale
        </p>
      </div>

      <div className="max-w-6xl mx-auto">
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

        {mantra && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-l-4 border-purple-500 p-6 rounded-lg">
              <h3 className="text-xl font-bold text-purple-800 flex items-center gap-2 mb-3">
                <span>🔮</span>
                <span>Mantra della Settimana</span>
              </h3>
              <p className="text-purple-900 text-lg italic font-medium whitespace-pre-line">
                "{mantra}"
              </p>
            </div>
          </div>
        )}

        {practicheArray.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg mb-6 overflow-hidden">
            <div className="p-5 pb-3">
              <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                <span>✨</span>
                <span>Pratiche della Settimana</span>
              </h2>
              <p className="text-sm text-gray-500">
                Opzionale - per aiutarti a ricordare le pratiche nei 14 giorni (2 settimane)
              </p>
            </div>

            <div className="space-y-0">
              {practicheArray.slice(0, 3).map((praticaText: string, index: number) => {
                const practice = practices.find(p => p.practice_number === index + 1);
                const completedDays = practice?.completed_days || {};
                const completedCount = DAY_KEYS.filter(day => completedDays[day]).length;

                return (
                  <div key={index} className="bg-gradient-to-r from-green-50 to-teal-50 border-l-4 border-green-500 border-b border-b-green-100 last:border-b-0">
                    <button
                      onClick={() => togglePracticeExpanded(index)}
                      className="w-full p-4 text-left"
                    >
                      <h3 className="text-sm font-semibold text-green-800">
                        {index + 1}. {praticaText}
                      </h3>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-green-600">
                          {completedCount}/14 giorni completati
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center">
                            <span className="text-xs font-bold text-green-700">{completedCount}</span>
                          </div>
                          {expandedPractices.has(index) ? (
                            <ChevronUp className="w-4 h-4 text-green-600" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-green-600" />
                          )}
                        </div>
                      </div>
                    </button>

                    {expandedPractices.has(index) && (
                      <div className="px-4 pb-4 space-y-2">
                        <div className="flex gap-1.5">
                          {DAY_KEYS.slice(0, 7).map(day => (
                            <button
                              key={day}
                              onClick={() => togglePracticeDay(index + 1, day)}
                              disabled={loadingPractices}
                              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                completedDays[day]
                                  ? 'bg-green-500 text-white'
                                  : 'bg-white text-gray-600 border border-gray-200 hover:border-green-300'
                              } disabled:opacity-50`}
                            >
                              {DAY_LABELS[day]}
                            </button>
                          ))}
                        </div>
                        <div className="flex gap-1.5">
                          {DAY_KEYS.slice(7, 14).map(day => (
                            <button
                              key={day}
                              onClick={() => togglePracticeDay(index + 1, day)}
                              disabled={loadingPractices}
                              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
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
                    )}
                  </div>
                );
              })}
            </div>

            <p className="text-xs text-gray-500 py-3 text-center italic">
              💡 Questo tracker è solo per te - non influenza il percorso
            </p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            🎯 Il Tuo Percorso
          </h2>
          <p className="text-gray-600 mb-6">
            Traccia i tuoi progressi attraverso il percorso MVP (19 episodi)
          </p>

          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-orange-50 border-l-4 border-orange-500 p-3 rounded">
              <div className="text-2xl font-bold text-orange-600">{completedEpisodes}</div>
              <div className="text-xs text-gray-600">Completati</div>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded">
              <div className="text-2xl font-bold text-blue-600">19</div>
              <div className="text-xs text-gray-600">Totali MVP</div>
            </div>

            <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded">
              <div className="text-2xl font-bold text-green-600">{progressPercentage}%</div>
              <div className="text-xs text-gray-600">Progresso</div>
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
            onClick={() => router.push('/settimane')}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-full transition-all transform hover:scale-105"
          >
            🚀 Esplora le Settimane
          </button>
        </div>
      </div>
    </main>
  );
}