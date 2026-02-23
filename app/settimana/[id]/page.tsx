'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import EpisodeCard from '@/components/EpisodeCard';
import { isWeekUnlockedInBeta } from '@/lib/weekUnlockLogic';

const WEEK_EPISODES: Record<string, number[]> = {
  '1': [1, 2, 3, 4, 5],
  '2': [1, 2, 3, 4, 5],
  '3': [6, 7, 8, 9, 10, 11, 12],
  '4': [6, 7, 8, 9, 10, 11, 12],
  '5': [13, 14, 15, 16, 17, 18, 19],
  '6': [13, 14, 15, 16, 17, 18, 19],
};

const EPISODE_TITLES: Record<number, string> = {
  1: 'Enter: Naruto Uzumaki!',
  2: 'My Name is Konohamaru!',
  3: 'Sasuke and Sakura: Friends or Foes?',
  4: 'Pass or Fail: Survival Test',
  5: 'You Failed! Kakashi\'s Final Decision',
  6: 'A Dangerous Mission! Journey to the Land of Waves!',
  7: 'The Assassin of the Mist!',
  8: 'The Oath of Pain',
  9: 'Kakashi: Sharingan Warrior!',
  10: 'The Forest of Chakra',
  11: 'The Land Where a Hero Once Lived',
  12: 'Battle on the Bridge! Zabuza Returns!',
  13: 'Haku\'s Secret Jutsu: Crystal Ice Mirrors',
  14: 'The Number One Hyperactive, Knucklehead Ninja Joins the Fight!',
  15: 'Zero Visibility: The Sharingan Shatters',
  16: 'The Broken Seal',
  17: 'White Past: Hidden Ambition',
  18: 'The Weapons Known as Shinobi',
  19: 'The Demon in the Snow',
};

export default function SettimanaPage() {
  const params = useParams();
  const router = useRouter();
  const episodesRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [userId, setUserId] = useState<string>('');
  const [completedEpisodes, setCompletedEpisodes] = useState<number[]>([]);
  const [weekNumber, setWeekNumber] = useState<number>(1);
  const [allSettimane, setAllSettimane] = useState<any[]>([]);
  const [isWeekComplete, setIsWeekComplete] = useState(false);
  const [showWeekCompletePopup, setShowWeekCompletePopup] = useState(false);
  const [nextWeekId, setNextWeekId] = useState<string | null>(null);
  const [nextWeekNumber, setNextWeekNumber] = useState<number | null>(null);

  const loadProgress = async (uid: string): Promise<number[]> => {
    const { data: progress } = await supabase
      .from('user_episode_progress')
      .select('episode_number, completed')
      .eq('user_id', uid)
      .eq('completed', true);
    const nums = (progress || []).map((p: any) => p.episode_number);
    setCompletedEpisodes(nums);
    return nums;
  };

  const checkCompletion = (
    completed: number[],
    weekEps: number[],
    settimane: any[],
    wn: number,
    triggerPopup: boolean
  ) => {
    if (weekEps.length === 0) return;
    const allDone = weekEps.every(ep => completed.includes(ep));
    if (allDone) {
      setIsWeekComplete(true);
      const nextW = settimane.find((s: any) => s.numero === wn + 1);
      if (nextW) {
        setNextWeekId(nextW.id);
        setNextWeekNumber(nextW.numero);
      }
      if (triggerPopup) setShowWeekCompletePopup(true);
    } else {
      setIsWeekComplete(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      setUserId(session.user.id);

      const id = params.id as string;
      const [settimanaRes, settimaneRes] = await Promise.all([
        fetch(`/api/settimana?id=${id}`),
        fetch('/api/settimane'),
      ]);
      const settimanaData = await settimanaRes.json();
      const settimaneData = await settimaneRes.json();
      setData(settimanaData);

      const settimaneList = (settimaneData.settimane || []).filter((s: any) => s.numero <= 6);
      setAllSettimane(settimaneList);

      const settimanaText = settimanaData.page?.properties?.Settimana?.title?.[0]?.plain_text || '';
      const match = settimanaText.match(/Week (\d+)/);
      const wn = match ? parseInt(match[1]) : 1;
      setWeekNumber(wn);

      const weekEpsList = WEEK_EPISODES[wn.toString()] || [];
      const completed = await loadProgress(session.user.id);

      // Controlla completamento senza popup (già completata in sessione precedente)
      checkCompletion(completed, weekEpsList, settimaneList, wn, false);

      setLoading(false);
    };

    init();
  }, [params.id, router]);

  const scrollToEpisodes = () => {
    episodesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-orange-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🍥</div>
          <p className="text-xl text-gray-600">Caricamento settimana...</p>
        </div>
      </main>
    );
  }

  if (!data || data.error) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-orange-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-red-600">Errore nel caricamento</p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 bg-orange-500 text-white px-6 py-2 rounded-full"
          >
            Torna alla home
          </button>
        </div>
      </main>
    );
  }

  const properties = data.page?.properties || {};
  const settimana = properties.Settimana?.title?.[0]?.plain_text || '';
  const titolo = properties.Titolo?.rich_text?.[0]?.plain_text || '';
  const tema = properties['Tema principale']?.rich_text?.[0]?.plain_text || '';
  const episodi = properties.Episodi?.rich_text?.[0]?.plain_text || '';
  const weekEpisodes = WEEK_EPISODES[weekNumber.toString()] || [];

  const handleEpisodeComplete = async () => {
    const completed = await loadProgress(userId);
    // Controlla completamento con popup (episodio appena completato)
    checkCompletion(completed, weekEpisodes, allSettimane, weekNumber, true);
  };

  const nextWeekInBeta = nextWeekNumber !== null && isWeekUnlockedInBeta(nextWeekNumber);

  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50 to-orange-100 py-8 px-4 pb-24">

      {/* Popup settimana completata */}
      {showWeekCompletePopup && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-scaleIn">
            <div className="text-7xl mb-4 animate-bounce">🏆</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Settimana completata!</h2>
            <p className="text-orange-700 font-semibold text-sm mb-1">{settimana}</p>
            <p className="text-gray-600 text-sm mb-6 leading-relaxed">
              Hai completato tutti gli episodi. Il tuo chakra cresce, shinobi! 🍥
            </p>

            {nextWeekId && nextWeekInBeta ? (
              <>
                <button
                  onClick={() => {
                    setShowWeekCompletePopup(false);
                    router.push(`/settimana/${nextWeekId}`);
                  }}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-3 rounded-2xl mb-3 transition-all shadow-md"
                >
                  Passa alla settimana successiva 🍥
                </button>
                <button
                  onClick={() => setShowWeekCompletePopup(false)}
                  className="w-full text-gray-400 hover:text-gray-600 text-sm py-2 transition-colors"
                >
                  Rimani qui
                </button>
              </>
            ) : nextWeekId && !nextWeekInBeta ? (
              <>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 text-xs text-amber-800">
                  🔒 La prossima settimana sarà disponibile nella versione completa del percorso. Stay tuned!
                </div>
                <button
                  onClick={() => setShowWeekCompletePopup(false)}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-3 rounded-2xl transition-all"
                >
                  Continua 🌅
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowWeekCompletePopup(false)}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-3 rounded-2xl transition-all"
              >
                Continua il percorso 🌅
              </button>
            )}
          </div>
        </div>
      )}

      {/* Header settimana */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="bg-white rounded-lg shadow-lg p-8 border-l-4 border-orange-500">
          <span className="text-sm font-semibold text-orange-600 bg-orange-100 px-3 py-1 rounded-full">
            {settimana}
          </span>
          {isWeekComplete && (
            <span className="ml-2 text-sm font-semibold text-green-600 bg-green-100 px-3 py-1 rounded-full">
              ✅ Completata
            </span>
          )}
          <h1 className="text-4xl font-bold text-gray-800 mt-4 mb-2">{titolo}</h1>
          <p className="text-lg text-gray-600 mb-6">{tema}</p>
          <button
            onClick={scrollToEpisodes}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-full transition-all shadow-md hover:shadow-lg mb-4"
          >
            📺 Vai agli episodi ↓
          </button>
          <div className="text-sm text-gray-500 border-t pt-4">📺 Episodi: {episodi}</div>
        </div>
      </div>

      {/* Approfondimento della settimana — collassabile, prima degli episodi */}
      {data.blocks && data.blocks.length > 0 && (
        <div className="max-w-4xl mx-auto mb-8">
          <details className="bg-white rounded-lg shadow-lg overflow-hidden">
            <summary className="p-6 cursor-pointer font-bold text-gray-800 text-xl flex items-center justify-between list-none hover:bg-orange-50 transition-colors">
              <span>📖 Approfondimento della settimana</span>
              <span className="text-sm font-normal text-gray-500 ml-2">Leggi il contesto completo</span>
            </summary>
            <div className="px-8 pb-8 prose max-w-none border-t border-gray-100 pt-6">
              {data.blocks.map((block: any, index: number) => (
                <div key={block.id || index} className="mb-4">{renderBlock(block)}</div>
              ))}
            </div>
          </details>
        </div>
      )}

      {/* Episodi */}
      <div className="max-w-4xl mx-auto mb-8" ref={episodesRef}>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">📺 Episodi della settimana</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {weekEpisodes.map((epNum) => {
              const isCompleted = completedEpisodes.includes(epNum);
              const isLocked = epNum > 1 && !completedEpisodes.includes(epNum - 1);
              return (
                <EpisodeCard
                  key={epNum}
                  episodeNumber={epNum}
                  title={EPISODE_TITLES[epNum] || `Episodio ${epNum}`}
                  isCompleted={isCompleted}
                  isLocked={isLocked}
                  weekNumber={weekNumber}
                  userId={userId}
                  onComplete={handleEpisodeComplete}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottone "Passa alla settimana successiva" — visibile quando la settimana è completa */}
      {isWeekComplete && nextWeekId && nextWeekInBeta && (
        <div className="max-w-4xl mx-auto mb-8">
          <button
            onClick={() => router.push(`/settimana/${nextWeekId}`)}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-lg"
          >
            🍥 Passa alla settimana successiva →
          </button>
        </div>
      )}

      {isWeekComplete && nextWeekId && !nextWeekInBeta && (
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
            <p className="text-amber-800 font-semibold text-sm">
              🔒 Hai completato tutte le settimane disponibili in Beta! La versione completa arriva presto. 🍥
            </p>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes scaleIn {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-scaleIn {
          animation: scaleIn 0.4s ease-out;
        }
      `}</style>

    </main>
  );
}

function renderBlock(block: any) {
  const { type } = block;

  switch (type) {
    case 'paragraph':
      const pTexts = block.paragraph?.rich_text || [];
      if (pTexts.length === 0) return <br />;
      return (
        <p className="text-gray-700 leading-relaxed">
          {pTexts.map((t: any, i: number) => (
            <span key={i} className={t.annotations?.bold ? 'font-bold' : ''}>
              {t.plain_text}
            </span>
          ))}
        </p>
      );

    case 'heading_1':
      const h1Texts = block.heading_1?.rich_text || [];
      return (
        <h1 className="text-3xl font-bold text-gray-800 mt-8 mb-4">
          {h1Texts.map((t: any) => t.plain_text).join('')}
        </h1>
      );

    case 'heading_2':
      const h2Texts = block.heading_2?.rich_text || [];
      return (
        <h2 className="text-2xl font-bold text-gray-800 mt-6 mb-3">
          {h2Texts.map((t: any) => t.plain_text).join('')}
        </h2>
      );

    case 'heading_3':
      const h3Texts = block.heading_3?.rich_text || [];
      return (
        <h3 className="text-xl font-bold text-gray-700 mt-5 mb-2">
          {h3Texts.map((t: any) => t.plain_text).join('')}
        </h3>
      );

    case 'bulleted_list_item':
      const liTexts = block.bulleted_list_item?.rich_text || [];
      return (
        <li className="text-gray-700 ml-6 mb-2 list-disc">
          {liTexts.map((t: any) => t.plain_text).join('')}
        </li>
      );

    case 'numbered_list_item':
      const numTexts = block.numbered_list_item?.rich_text || [];
      return (
        <li className="text-gray-700 ml-6 mb-2 list-decimal">
          {numTexts.map((t: any) => t.plain_text).join('')}
        </li>
      );

    case 'quote':
      const quoteTexts = block.quote?.rich_text || [];
      return (
        <blockquote className="border-l-4 border-orange-400 pl-4 py-2 my-4 italic text-gray-700 bg-orange-50 rounded">
          {quoteTexts.map((t: any) => t.plain_text).join('')}
        </blockquote>
      );

    case 'divider':
      return <hr className="my-8 border-gray-300" />;

    case 'toggle':
      const toggleTexts = block.toggle?.rich_text || [];
      const toggleTitle = toggleTexts.map((t: any) => t.plain_text).join('');
      return (
        <details className="bg-gray-50 p-4 rounded-lg my-3 cursor-pointer">
          <summary className="font-semibold text-gray-800 cursor-pointer hover:text-orange-600">
            ▶ {toggleTitle}
          </summary>
        </details>
      );

    case 'callout':
      const calloutTexts = block.callout?.rich_text || [];
      const emoji = block.callout?.icon?.emoji || '💡';
      return (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 my-4 rounded flex items-start gap-3">
          <span className="text-2xl">{emoji}</span>
          <p className="text-gray-700">
            {calloutTexts.map((t: any) => t.plain_text).join('')}
          </p>
        </div>
      );

    default:
      return null;
  }
}
