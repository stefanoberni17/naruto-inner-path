'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

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
  const [loading, setLoading] = useState(true);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  // Verifica autenticazione
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // Non loggato → redirect a login
        router.push('/login');
        return;
      }

      // Carica profilo
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      setProfile(profileData);
      setCheckingAuth(false);
    };

    checkAuth();
  }, [router]);

  useEffect(() => {
    if (checkingAuth) return;
    
    fetch('/api/settimane')
      .then(res => res.json())
      .then(data => {
        setSettimane(data.settimane || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Errore nel caricamento:', err);
        setLoading(false);
      });
  }, [checkingAuth]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

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

  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50 to-orange-100 py-8 px-4">
      {/* Header con nome utente e logout */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between bg-white rounded-lg shadow-lg p-4">
          <div className="flex items-center gap-3">
            <div className="text-3xl">🍥</div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">
                Naruto Inner Path
              </h1>
              <p className="text-sm text-gray-600">
                Benvenuto, {profile?.name || 'Guerriero'}!
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-lg transition-all"
            >
              Dashboard
            </button>
            <button
              onClick={handleLogout}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-all"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Titolo sezione */}
      <div className="max-w-7xl mx-auto mb-8 text-center">
        <h2 className="text-4xl font-bold text-gray-800 mb-2">
          📅 Le Settimane del Percorso
        </h2>
        <p className="text-gray-600">
          Scegli una settimana per iniziare il tuo viaggio
        </p>
      </div>

      {/* Grid settimane */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {settimane.map((settimana) => (
          <div
            key={settimana.id}
            onClick={() => window.location.href = `/settimana/${settimana.id}`}
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all cursor-pointer border-l-4 border-orange-500 transform hover:scale-102"
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-xs font-semibold text-orange-600 bg-orange-100 px-3 py-1 rounded-full">
                {settimana.settimana}
              </span>
              <span className="text-xs text-gray-500">
                #{settimana.numero}
              </span>
            </div>
            
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              {settimana.titolo}
            </h3>
            
            <p className="text-gray-600 text-sm mb-3">
              {settimana.tema}
            </p>
            
            <div className="text-xs text-gray-500 border-t pt-3">
              📺 Episodi: {settimana.episodi}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}