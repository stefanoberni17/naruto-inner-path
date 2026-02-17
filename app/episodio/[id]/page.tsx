'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';

export default function EpisodioPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [episodeData, setEpisodeData] = useState<any>(null);

  const episodeNumber = parseInt(params.id as string);
  const userId = searchParams.get('userId');

  useEffect(() => {
    const fetchEpisode = async () => {
      try {
        const response = await fetch(
          `/api/episodio?number=${episodeNumber}&userId=${userId}`
        );
        const data = await response.json();
        
        if (data.locked) {
          alert(data.message);
          router.back();
          return;
        }

        setEpisodeData(data.episode);
        setLoading(false);
      } catch (error) {
        console.error('Errore caricamento episodio:', error);
        router.back();
      }
    };

    fetchEpisode();
  }, [episodeNumber, userId, router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-orange-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🍥</div>
          <p className="text-xl text-gray-600">Caricamento episodio...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50 to-orange-100 py-8 px-4 pb-24">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-6">
            <span className="text-sm font-semibold text-orange-600 bg-orange-100 px-3 py-1 rounded-full">
              Episodio {episodeData?.number}
            </span>
          </div>

          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            {episodeData?.title}
          </h1>

          {episodeData?.mainTheme && (
            <p className="text-lg text-orange-600 font-semibold mb-6">
              🎯 {episodeData.mainTheme}
            </p>
          )}

          {episodeData?.miniLesson && (
            <div className="bg-orange-50 border-l-4 border-orange-500 p-6 rounded mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-3">
                📖 Mini-lezione
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {episodeData.miniLesson}
              </p>
            </div>
          )}

          {episodeData?.reflectionQuestion && (
            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-3">
                💭 Domanda riflessiva
              </h2>
              <p className="text-gray-700 italic">
                {episodeData.reflectionQuestion}
              </p>
            </div>
          )}

          {episodeData?.concepts && (
            <div className="bg-gray-50 p-6 rounded mb-6">
              <h3 className="font-semibold text-gray-700 mb-2">
                🔑 Concetti chiave
              </h3>
              <p className="text-gray-600 text-sm">
                {episodeData.concepts}
              </p>
            </div>
          )}

          <div className="flex gap-4 mt-8">
            <button
              onClick={() => router.back()}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-all"
            >
              ← Torna indietro
            </button>

            {!episodeData?.completed && (
              <button
                onClick={async () => {
                  const response = await fetch('/api/episodio', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ episodeNumber, userId }),
                  });
                  if (response.ok) {
                    alert('Episodio completato! ✅');
                    router.back();
                  }
                }}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg transition-all"
              >
                ✓ Completa episodio
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}