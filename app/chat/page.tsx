import ChatBot from '@/components/ChatBot';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Maestro AI - Naruto Inner Path',
  description: 'Parla con il tuo maestro spirituale AI',
};

export default function ChatPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Torna alla home
          </Link>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Maestro AI
          </h1>
          <p className="text-gray-600">
            Parla con il tuo maestro spirituale personale. Chiedi consigli, 
            condividi riflessioni o ricevi guidance sul tuo percorso.
          </p>
        </div>

        {/* Suggerimenti */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-orange-800 mb-2">
            💡 Suggerimenti per iniziare:
          </h3>
          <ul className="space-y-1 text-sm text-orange-700">
            <li>• "Come posso lavorare sulla ferita del rifiuto?"</li>
            <li>• "Aiutami a riflettere sulla settimana corrente"</li>
            <li>• "Quali pratiche mi consigli per oggi?"</li>
            <li>• "Cosa posso imparare dall'episodio di Naruto di questa settimana?"</li>
          </ul>
        </div>

        {/* Chat Component */}
        <ChatBot />

        {/* Note */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            Il Maestro AI usa l'intelligenza artificiale per guidarti nel tuo percorso.
            Le conversazioni sono private e non vengono salvate.
          </p>
        </div>
      </div>
    </div>
  );
}
