'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getUnlockedWeeks } from '@/lib/weekUnlockLogic';

interface Settimana {
  id: string;
  numero: number;
  settimana: string;
  titolo: string;
  tema: string;
  episodi: string;
  stato: string;
}

export default function Home() {
  const router = useRouter();
  const [settimane, setSettimane] = useState<Settimana[]>([]);
  const [unlockedWeeks, setUnlockedWeeks] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login');
        return;
      }

      setUserId(session.user.id);

      // ✅ Check onboarding PRIMA di caricare il resto
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      // ✅ Se non ha completato onboarding, redirect
      if (!profileData?.onboarding_completed) {
        router.push('/onboarding');
        return;
      }

      setProfile(profileData);

      // Carica episodi completati
      const { data: completedEpisodes } = await supabase
        .from('user_episode_progress')
        .select('episode_number, completed')
        .eq('user_id', session.user.id)
        .eq('completed', true);

      // Calcola settimane sbloccate
      const unlocked = getUnlockedWeeks(completedEpisodes || []);
      setUnlockedWeeks(unlocked);

      setCheckingAuth(false);
    };

    checkAuth();
  }, [router]);

  useEffect(() => {
    if (checkingAuth) return;
    
    fetch('/api/settimane')
      .then(res => res.json())
      .then(data => {
        // Filtra solo settimane 1-6 per MVP
        const settimaneFiltered = (data.settimane || []).filter((s: Settimana) => s.numero <= 6);
        setSettimane(settimaneFiltered);
        setLoading(false);
      })
      .catch(err => {
        console.error('Errore nel caricamento:', err);
        setLoading(false);
      });
  }, [checkingAuth]);

  if (checkingAuth) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-orange-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🍥</div>
          <p className="text-xl text-gray-600">Verifica accesso...</p>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-orange-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-spin">🍥</div>
          <p className="text-xl text-gray-600">Caricamento settimane...</p>
        </div>
      </main>
    );
  }

  const currentWeek = profile?.current_week || 1;

  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50 to-orange-100 py-8 px-4 pb-24">
      {/* Titolo */}
      <div className="max-w-7xl mx-auto mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-1">
          Ciao, {profile?.name || 'Guerriero'}! 👋
        </h1>
        <p className="text-gray-600">
          {unlockedWeeks.length} settimane sbloccate su 6
        </p>
      </div>

      {/* Grid settimane */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {settimane.map((settimana) => {
          const isUnlocked = unlockedWeeks.includes(settimana.numero);
          const isCurrentWeek = settimana.numero === currentWeek;
          
          return (
            <div
              key={settimana.id}
              onClick={() => isUnlocked && router.push(`/settimana/${settimana.id}?userId=${userId}`)}
              className={`bg-white rounded-lg shadow-lg p-6 transition-all border-l-4 ${
                isUnlocked 
                  ? 'cursor-pointer hover:shadow-xl transform hover:scale-102' 
                  : 'opacity-60 cursor-not-allowed'
              } ${
                isCurrentWeek 
                  ? 'border-orange-500 ring-2 ring-orange-300' 
                  : isUnlocked 
                    ? 'border-green-500' 
                    : 'border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                  isCurrentWeek 
                    ? 'text-orange-600 bg-orange-100' 
                    : isUnlocked
                      ? 'text-green-600 bg-green-100'
                      : 'text-gray-600 bg-gray-100'
                }`}>
                  {settimana.settimana}
                  {isCurrentWeek && ' 📍'}
                </span>
                <span className="text-2xl">
                  {isUnlocked ? (isCurrentWeek ? '🎯' : '✅') : '🔒'}
                </span>
              </div>
              
              <h3 className={`text-xl font-bold mb-2 ${
                isUnlocked ? 'text-gray-800' : 'text-gray-400'
              }`}>
                {settimana.titolo}
              </h3>
              
              <p className={`text-sm mb-3 ${
                isUnlocked ? 'text-gray-600' : 'text-gray-400'
              }`}>
                {settimana.tema}
              </p>
              
              <div className={`text-xs border-t pt-3 ${
                isUnlocked ? 'text-gray-500' : 'text-gray-400'
              }`}>
                📺 Episodi: {settimana.episodi}
              </div>

              {!isUnlocked && (
                <div className="mt-3 text-xs text-gray-500 bg-gray-50 p-2 rounded">
                  🔒 Completa la settimana precedente per sbloccare
                </div>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}