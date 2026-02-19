'use client';

import { useEffect, useState } from 'react';
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

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [completedEpisodes, setCompletedEpisodes] = useState(0);
  const [weekData, setWeekData] = useState<any>(null);

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

      setLoading(false);
    };

    checkUser();
  }, [router]);

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

  return (
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

        {/* ✅ 1. MANTRA E PRATICHE (PRIMA) */}
        {(mantra || pratiche) && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              🧘 Questa Settimana
            </h2>

            {mantra && (
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-l-4 border-purple-500 p-6 rounded-lg mb-6">
                <h3 className="text-lg font-bold text-purple-800 mb-2 flex items-center gap-2">
                  <span>🔮</span>
                  <span>Mantra della Settimana</span>
                </h3>
                <p className="text-purple-900 text-lg italic font-medium whitespace-pre-line">
                  {mantra}
                </p>
              </div>
            )}

            {pratiche && (
              <div className="bg-gradient-to-r from-green-50 to-teal-50 border-l-4 border-green-500 p-6 rounded-lg">
                <h3 className="text-lg font-bold text-green-800 mb-3 flex items-center gap-2">
                  <span>✨</span>
                  <span>Pratiche Consigliate</span>
                </h3>
                <div className="text-green-900 whitespace-pre-line leading-relaxed">
                  {pratiche}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ✅ 2. PROGRESSO (DOPO) */}
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
  );
}