'use client';

import { useEffect, useState } from 'react';

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
  const [settimane, setSettimane] = useState<Settimana[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
  }, []);

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
      <div className="text-center space-y-6 mb-12">
        <div className="text-6xl">🍥</div>
        <h1 className="text-5xl font-bold text-orange-600">
          Naruto Inner Path
        </h1>
        <p className="text-xl text-gray-700">
          La via del Guerriero Gentile
        </p>
        <p className="text-lg text-gray-600 max-w-md mx-auto">
          Più di un anime. Un viaggio per crescere.
        </p>
      </div>

      {/* Settimane Grid */}
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">
          📅 Le Settimane del Percorso
        </h2>
        
        {settimane.length === 0 ? (
          <p className="text-center text-gray-600">Nessuna settimana trovata</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {settimane.map((settimana) => (
              <div
                key={settimana.id}
                className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow border-l-4 border-orange-500"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-sm font-semibold text-orange-600 bg-orange-100 px-3 py-1 rounded-full">
                    {settimana.settimana}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    settimana.stato === 'Completata' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {settimana.stato}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {settimana.titolo}
                </h3>
                
                <p className="text-sm text-gray-600 mb-3">
                  {settimana.tema}
                </p>
                
                <div className="text-xs text-gray-500 border-t pt-3 mt-3">
                  📺 Episodi: {settimana.episodi}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="text-center mt-12">
        <button className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-full transition-all transform hover:scale-105">
          🚀 Inizia il Percorso
        </button>
      </div>
    </main>
  );
}