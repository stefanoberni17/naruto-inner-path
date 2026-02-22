'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import ChatBot, { ChatBotRef } from '@/components/ChatBot';

const suggestions = [
  "Come posso lavorare sulla ferita del rifiuto?",
  "Aiutami a riflettere sulla settimana corrente",
  "Quali pratiche mi consigli per oggi?",
  "Cosa posso imparare dall'episodio di questa settimana?",
];

export default function ChatPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const chatBotRef = useRef<ChatBotRef>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      setLoading(false);
    };
    checkAuth();
  }, [router]);

  const handleSuggestionClick = (text: string) => {
    chatBotRef.current?.sendSuggestion(text);
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
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white pb-24">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">💬 Maestro AI</h1>
          <p className="text-gray-600">
            Parla con il tuo maestro spirituale personale. Chiedi consigli,
            condividi riflessioni o ricevi guidance sul tuo percorso.
          </p>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-orange-800 mb-3">💡 Suggerimenti per iniziare:</h3>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="text-left text-sm bg-white text-orange-700 border border-orange-300 rounded-full px-3 py-1.5 hover:bg-orange-100 hover:border-orange-400 transition-colors active:scale-95"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        <ChatBot ref={chatBotRef} />

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Le conversazioni sono private e non vengono salvate.</p>
        </div>
      </div>
    </div>
  );
}
