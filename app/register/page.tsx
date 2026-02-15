'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function RegisterPage() {
  const router = useRouter();
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nome, setNome] = useState('');
  const [eta, setEta] = useState('');
  const [obiettivi, setObiettivi] = useState('');
  const [passioni, setPassioni] = useState('');
  const [sogno, setSogno] = useState('');
  const [situazioneAttuale, setSituazioneAttuale] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    // Validazione password
    if (password !== confirmPassword) {
      setError('Le password non coincidono');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('La password deve essere di almeno 6 caratteri');
      setLoading(false);
      return;
    }

    if (!nome.trim()) {
      setError('Il nome è obbligatorio');
      setLoading(false);
      return;
    }

    try {
      // 1. Registra utente
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      console.log('✅ Utente creato:', authData);

      // 2. Crea profilo
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: authData.user?.id,
          name: nome.trim(),
          age: eta ? parseInt(eta) : null,
          goals: obiettivi.trim() || null,
          passions: passioni.trim() || null,
          dream: sogno.trim() || null,
          current_situation: situazioneAttuale.trim() || null,
        });

      if (profileError) {
            console.error('❌ Errore profilo COMPLETO:', profileError);
            console.error('Message:', profileError.message);
            console.error('Details:', profileError.details);
            console.error('Hint:', profileError.hint);
            console.error('Code:', profileError.code);
            throw new Error(profileError.message || 'Errore nella creazione del profilo');
            }

      console.log('✅ Profilo creato!');
      setSuccess(true);

      // Redirect dopo 2 secondi
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);

    } catch (error: any) {
      setError(error.message);
      console.error('❌ Errore registrazione:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50 to-orange-100 py-12 px-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🍥</div>
          <h1 className="text-3xl font-bold text-gray-800">
            Inizia il tuo viaggio
          </h1>
          <p className="text-gray-600 mt-2">
            Raccontaci un po' di te
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleRegister} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              ✅ Registrazione completata! Reindirizzamento...
            </div>
          )}

          {/* Email & Password */}
          <div className="space-y-4 pb-6 border-b">
            <h3 className="font-semibold text-gray-700">Account</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="tua@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password *
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Minimo 6 caratteri"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Conferma Password *
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Ripeti la password"
                required
              />
            </div>
          </div>

          {/* Info Personali */}
          <div className="space-y-4 pb-6 border-b">
            <h3 className="font-semibold text-gray-700">Su di te</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome *
              </label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Come ti chiami?"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Età (opzionale)
              </label>
              <input
                type="number"
                value={eta}
                onChange={(e) => setEta(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Es. 25"
                min="13"
                max="120"
              />
            </div>
          </div>

          {/* Percorso */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-700">Il tuo percorso</h3>
            <p className="text-sm text-gray-500">
              Queste info ci aiuteranno a personalizzare l'esperienza (opzionali)
            </p>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quali sono i tuoi obiettivi con questo percorso?
              </label>
              <textarea
                value={obiettivi}
                onChange={(e) => setObiettivi(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Es. Voglio lavorare sulla mia autostima, gestire meglio le emozioni..."
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Passioni e interessi
              </label>
              <input
                type="text"
                value={passioni}
                onChange={(e) => setPassioni(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Es. Anime, crescita personale, sport..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Il tuo sogno più grande
              </label>
              <input
                type="text"
                value={sogno}
                onChange={(e) => setSogno(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Es. Diventare la versione migliore di me stesso..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dove ti trovi ora nella vita?
              </label>
              <textarea
                value={situazioneAttuale}
                onChange={(e) => setSituazioneAttuale(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Es. Sto attraversando un periodo difficile, sto cercando direzione..."
                rows={3}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creazione account...' : 'Inizia il Percorso'}
          </button>
        </form>

        {/* Link login */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Hai già un account?{' '}
            <button
              onClick={() => router.push('/login')}
              className="text-orange-600 hover:text-orange-700 font-semibold"
            >
              Accedi
            </button>
          </p>
        </div>
      </div>
    </main>
  );
}