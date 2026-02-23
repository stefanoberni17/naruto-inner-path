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
      <div className="max-w-4xl mx-auto px-4 pt-6 pb-4">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-1">💬 Maestro AI</h1>
          <p className="text-sm text-gray-500">
            Il tuo specchio consapevole — parla del percorso, chiedi riflessioni, esplora.
          </p>
        </div>

        <ChatBot ref={chatBotRef} suggestions={suggestions} />

        <div className="mt-3 text-center text-xs text-gray-400">
          Le conversazioni sono private e non vengono salvate.
        </div>
      </div>
    </div>
  );
}
