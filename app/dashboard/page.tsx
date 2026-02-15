'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
const [profile, setProfile] = useState<any>(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      router.push('/login');
      return;
    }

    setUser(session.user);

    // Carica profilo
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', session.user.id)
      .single();
      
console.log('👤 User ID:', session.user.id);
console.log('📊 Profile data:', profileData);
console.log('❌ Profile error:', profileError);

    setProfile(profileData);
    setLoading(false);
  };

  checkUser();
}, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
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

  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50 to-orange-100 py-12 px-4">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center justify-between bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-4">
            <div className="text-4xl">🍥</div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Naruto Inner Path
              </h1>
              <p className="text-gray-600">
                Benvenuto, {profile?.name}!
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
                onClick={() => router.push('/profilo')}
                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-lg transition-all"
            >
                👤 Profilo
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

      {/* Dashboard content */}
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            🎯 La tua Dashboard
          </h2>
          <p className="text-gray-600 mb-6">
            Il tuo percorso personale inizia qui!
          </p>

          {/* Stats placeholder */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded">
              <div className="text-3xl font-bold text-orange-600">0</div>
              <div className="text-sm text-gray-600">Settimane completate</div>
            </div>
            
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
              <div className="text-3xl font-bold text-blue-600">12</div>
              <div className="text-sm text-gray-600">Settimane totali</div>
            </div>
            
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
              <div className="text-3xl font-bold text-green-600">0%</div>
              <div className="text-sm text-gray-600">Progressione</div>
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={() => router.push('/')}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-full transition-all transform hover:scale-105"
          >
            🚀 Inizia il Percorso
          </button>
        </div>

        
      </div>
    </main>
  );
}