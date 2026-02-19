'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';

interface EpisodeData {
  number: number;
  title: string;
  miniLesson: string;
  reflectionQuestion: string;
  mainTheme: string;
  concepts: string;
  weekNumber: number;
  locked: boolean;
  completed: boolean;
}

function renderBlock(block: any): React.ReactNode {
  const { type, id } = block;

  switch (type) {
    case 'paragraph': {
      const texts = block.paragraph?.rich_text || [];
      const content = texts.map((t: any) => t.plain_text).join('');
      if (!content.trim()) return <div key={id} className="h-3" />;
      return (
        <p key={id} className="text-gray-700 leading-relaxed mb-3 text-sm">
          {texts.map((t: any, i: number) => {
            const ann = t.annotations || {};
            let el: React.ReactNode = t.plain_text;
            if (ann.bold) el = <strong key={i}>{el}</strong>;
            if (ann.italic) el = <em key={i}>{el}</em>;
            if (ann.code) el = <code key={i} className="bg-gray-100 px-1 rounded text-xs">{el}</code>;
            return el;
          })}
        </p>
      );
    }

    case 'heading_1':
    case 'heading_2':
    case 'heading_3': {
      const texts = block[type]?.rich_text || [];
      const content = texts.map((t: any) => t.plain_text).join('');
      const Tag = type === 'heading_1' ? 'h2' : type === 'heading_2' ? 'h3' : 'h4';
      const cls =
        type === 'heading_1' ? 'text-lg font-bold text-gray-800 mt-6 mb-2' :
        type === 'heading_2' ? 'text-base font-bold text-gray-800 mt-5 mb-2' :
        'text-sm font-bold text-gray-700 mt-4 mb-1';
      return <Tag key={id} className={cls}>{content}</Tag>;
    }

    case 'bulleted_list_item': {
      const texts = block.bulleted_list_item?.rich_text || [];
      const content = texts.map((t: any) => t.plain_text).join('');
      return (
        <div key={id} className="flex gap-2 mb-1">
          <span className="text-orange-400 mt-1 flex-shrink-0">•</span>
          <p className="text-gray-700 text-sm leading-relaxed">{content}</p>
        </div>
      );
    }

    case 'numbered_list_item': {
      const texts = block.numbered_list_item?.rich_text || [];
      const content = texts.map((t: any) => t.plain_text).join('');
      return (
        <div key={id} className="flex gap-2 mb-1">
          <span className="text-orange-500 font-bold text-sm flex-shrink-0">›</span>
          <p className="text-gray-700 text-sm leading-relaxed">{content}</p>
        </div>
      );
    }

    case 'quote': {
      const texts = block.quote?.rich_text || [];
      const content = texts.map((t: any) => t.plain_text).join('');
      return (
        <blockquote key={id} className="border-l-4 border-orange-400 bg-orange-50 px-4 py-3 my-3 rounded-r-lg">
          <p className="text-gray-700 italic text-sm leading-relaxed">{content}</p>
        </blockquote>
      );
    }

    case 'callout': {
      const texts = block.callout?.rich_text || [];
      const emoji = block.callout?.icon?.emoji || '💡';
      const content = texts.map((t: any) => t.plain_text).join('');
      return (
        <div key={id} className="bg-blue-50 border-l-4 border-blue-400 p-4 my-3 rounded flex items-start gap-3">
          <span className="text-xl flex-shrink-0">{emoji}</span>
          <p className="text-gray-700 text-sm leading-relaxed">{content}</p>
        </div>
      );
    }

    case 'divider':
      return <hr key={id} className="border-orange-100 my-4" />;

    case 'toggle': {
      const texts = block.toggle?.rich_text || [];
      const summary = texts.map((t: any) => t.plain_text).join('');
      return (
        <details key={id} className="my-2 bg-gray-50 rounded-lg">
          <summary className="px-4 py-3 cursor-pointer font-semibold text-gray-700 text-sm list-none flex items-center gap-2">
            <span className="text-orange-500">▶</span> {summary}
          </summary>
          <div className="px-4 pb-3 pt-1 text-sm text-gray-500 italic">
            Apri in Notion per il contenuto completo
          </div>
        </details>
      );
    }

    default:
      return null;
  }
}

function StepProgress({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-6">
      {Array.from({ length: total }, (_, i) => {
        const n = i + 1;
        const isDone = n < current;
        const isActive = n === current;
        return (
          <div key={n} className="flex items-center flex-1 last:flex-none">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300 flex-shrink-0 ${
              isDone
                ? 'bg-orange-500 border-orange-500 text-white'
                : isActive
                ? 'bg-orange-50 border-orange-500 text-orange-600'
                : 'bg-white border-gray-200 text-gray-400'
            }`}>
              {isDone ? '✓' : n}
            </div>
            {n < total && (
              <div className="flex-1 h-0.5 mx-1.5 bg-gray-200 overflow-hidden rounded">
                <div
                  className="h-full bg-orange-500 transition-all duration-500"
                  style={{ width: isDone ? '100%' : '0%' }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function EpisodioPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [episodeData, setEpisodeData] = useState<EpisodeData | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [completing, setCompleting] = useState(false);
  const [completed, setCompleted] = useState(false);

  const [extendedBlocks, setExtendedBlocks] = useState<any[]>([]);
  const [loadingExtended, setLoadingExtended] = useState(false);
  const [showExtended, setShowExtended] = useState(false);

  // ✅ JOURNALING STATE
  const [reflectionText, setReflectionText] = useState('');
  const [savingReflection, setSavingReflection] = useState(false);
  const [reflectionSaved, setReflectionSaved] = useState(false);

  const episodeNumber = parseInt(params.id as string);
  const userId = searchParams.get('userId');
  const TOTAL_STEPS = 4;
  const MAX_CHARS = 500;

  const conceptTags = episodeData?.concepts
    ? episodeData.concepts.split(',').map(c => c.trim()).filter(Boolean)
    : [];

  useEffect(() => {
    const fetchEpisode = async () => {
      try {
        const response = await fetch(`/api/episodio?number=${episodeNumber}&userId=${userId}`);
        const data = await response.json();
        if (data.locked) {
          alert(data.message);
          router.back();
          return;
        }
        setEpisodeData(data.episode);
        setCompleted(data.episode.completed);
        setLoading(false);

        // ✅ Carica riflessione esistente
        const reflectionRes = await fetch(`/api/reflection?userId=${userId}&episodeNumber=${episodeNumber}`);
        const reflectionData = await reflectionRes.json();
        if (reflectionData.reflection) {
          setReflectionText(reflectionData.reflection.reflection_text);
          setReflectionSaved(true);
        }
      } catch (error) {
        console.error('Errore caricamento episodio:', error);
        router.back();
      }
    };
    fetchEpisode();
  }, [episodeNumber, userId, router]);

  // ✅ Auto-save riflessione dopo 2 secondi di inattività
  useEffect(() => {
    if (!reflectionText.trim() || reflectionText.length > MAX_CHARS) return;

    const timer = setTimeout(async () => {
      setSavingReflection(true);
      try {
        await fetch('/api/reflection', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            episodeNumber,
            reflectionText: reflectionText.trim(),
            reflectionQuestion: episodeData?.reflectionQuestion || '',
          }),
        });
        setReflectionSaved(true);
      } catch (error) {
        console.error('Errore salvataggio riflessione:', error);
      } finally {
        setSavingReflection(false);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [reflectionText, userId, episodeNumber]);

  const handleLoadExtended = async () => {
    if (extendedBlocks.length > 0) {
      setShowExtended(true);
      return;
    }
    setLoadingExtended(true);
    try {
      const res = await fetch(`/api/episodio?number=${episodeNumber}&userId=${userId}&extended=true`);
      const data = await res.json();
      setExtendedBlocks(data.blocks || []);
      setShowExtended(true);
    } catch (e) {
      console.error('Errore caricamento versione estesa:', e);
    } finally {
      setLoadingExtended(false);
    }
  };

  const handleComplete = async () => {
    if (completed || completing) return;

    // ✅ Verifica riflessione salvata
    if (!reflectionSaved || !reflectionText.trim()) {
      alert('Devi completare la riflessione prima di procedere.');
      return;
    }

    setCompleting(true);
    try {
      const response = await fetch('/api/episodio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ episodeNumber, userId }),
      });
      if (response.ok) {
        setCompleted(true);
        setCompleting(false);
        setTimeout(() => router.back(), 1200);
      }
    } catch (error) {
      console.error('Errore completamento:', error);
      setCompleting(false);
    }
  };

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

  // Se versione estesa attiva, mostra full page
  if (showExtended) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-orange-50 to-orange-100 py-6 px-4 pb-28">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => setShowExtended(false)}
            className="flex items-center gap-2 text-sm text-gray-500 font-medium mb-5 hover:text-orange-600 transition-colors"
          >
            ← Torna all'episodio
          </button>

          <div className="bg-white rounded-2xl shadow-lg p-6 mb-4">
            <span className="text-xs font-bold text-orange-600 bg-orange-100 px-3 py-1 rounded-full">
              Episodio {episodeData?.number} · Versione estesa
            </span>
            <h1 className="text-xl font-extrabold text-gray-800 mt-3 mb-1">
              {episodeData?.title}
            </h1>
            <p className="text-orange-600 font-semibold text-sm">🎯 {episodeData?.mainTheme}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            {extendedBlocks.length > 0
              ? extendedBlocks.map((block: any) => renderBlock(block))
              : <p className="text-sm text-gray-400 italic">Nessun contenuto aggiuntivo.</p>
            }
          </div>

          <div className="mt-6">
            {completed ? (
              <div className="w-full bg-green-50 border border-green-200 text-green-700 text-sm font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2">
                ✅ Episodio completato
              </div>
            ) : reflectionSaved ? (
              <button
                onClick={handleComplete}
                disabled={completing}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-60 shadow-sm"
              >
                {completing ? <><span className="animate-spin">⏳</span> Salvataggio...</> : <>✓ Completa episodio</>}
              </button>
            ) : (
              <div className="w-full bg-amber-50 border border-amber-200 text-amber-700 text-sm font-medium py-3.5 px-4 rounded-xl flex items-center justify-center gap-2">
                ⚠️ Completa la riflessione per procedere
              </div>
            )}
          </div>
        </div>
      </main>
    );
  }

  // Vista normale con step card
  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50 to-orange-100 py-6 px-4 pb-28">
      <div className="max-w-lg mx-auto">

        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-gray-500 font-medium mb-5 hover:text-orange-600 transition-colors"
        >
          ← Torna indietro
        </button>

        <StepProgress current={currentStep} total={TOTAL_STEPS} />

        <div className="bg-white rounded-2xl shadow-lg p-6 min-h-72">

          {/* STEP 1 — Intro */}
          {currentStep === 1 && (
            <div>
              <div className="mb-4">
                <span className="text-xs font-bold text-orange-600 bg-orange-100 px-3 py-1 rounded-full">
                  Episodio {episodeData?.number} · Week {episodeData?.weekNumber}
                </span>
              </div>
              <h1 className="text-2xl font-extrabold text-gray-800 leading-tight mb-3">
                {episodeData?.title}
              </h1>
              {episodeData?.mainTheme && (
                <p className="text-orange-600 font-semibold text-sm mb-5">
                  🎯 {episodeData.mainTheme}
                </p>
              )}
              <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
                <p className="text-xs text-orange-700 font-semibold uppercase tracking-wide mb-1">In questo episodio</p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Leggerai la mini-lezione, la domanda di riflessione e i concetti chiave. Prenditi il tempo che ti serve per ogni step.
                </p>
              </div>
            </div>
          )}

          {/* STEP 2 — Mini-lezione */}
          {currentStep === 2 && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                  📖
                </div>
                <div>
                  <p className="font-bold text-gray-800 text-sm">Mini-lezione</p>
                  <p className="text-xs text-gray-500">L'insegnamento di questo episodio</p>
                </div>
              </div>
              <div className="w-full h-px bg-gray-100 mb-4" />
              <p className="text-sm text-gray-700 leading-relaxed border-l-4 border-orange-400 pl-4">
                {episodeData?.miniLesson || 'Contenuto non ancora disponibile.'}
              </p>
            </div>
          )}

          {/* STEP 3 — Domanda riflessiva + JOURNALING */}
          {currentStep === 3 && (
            <div>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100 mb-4">
                <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-3">
                  💭 Domanda riflessiva
                </p>
                <p className="text-gray-800 text-sm leading-relaxed italic font-medium">
                  "{episodeData?.reflectionQuestion || 'Domanda non ancora disponibile.'}"
                </p>
              </div>

              {/* ✅ TEXT AREA JOURNALING */}
              <div className="mb-3">
                <label className="block text-xs font-bold text-gray-700 mb-2">
                  ✍️ La tua riflessione (obbligatoria)
                </label>
                <textarea
                  value={reflectionText}
                  onChange={(e) => {
                    if (e.target.value.length <= MAX_CHARS) {
                      setReflectionText(e.target.value);
                      setReflectionSaved(false);
                    }
                  }}
                  placeholder="Scrivi qui la tua riflessione..."
                  className="w-full h-32 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 resize-none text-sm text-gray-700 transition-all"
                  maxLength={MAX_CHARS}
                />
                <div className="flex items-center justify-between mt-2">
                  <span className={`text-xs ${
                    reflectionText.length >= MAX_CHARS 
                      ? 'text-red-500 font-bold' 
                      : 'text-gray-500'
                  }`}>
                    {reflectionText.length}/{MAX_CHARS} caratteri
                  </span>
                  {savingReflection && (
                    <span className="text-xs text-blue-600 flex items-center gap-1">
                      <span className="animate-spin">⏳</span> Salvataggio...
                    </span>
                  )}
                  {reflectionSaved && !savingReflection && reflectionText.trim() && (
                    <span className="text-xs text-green-600 flex items-center gap-1">
                      ✓ Salvato
                    </span>
                  )}
                </div>
              </div>

              {!reflectionText.trim() && (
                <div className="bg-amber-50 border-l-4 border-amber-400 p-3 rounded">
                  <p className="text-xs text-amber-800">
                    💡 Devi scrivere una riflessione per completare questo episodio
                  </p>
                </div>
              )}
            </div>
          )}

          {/* STEP 4 — Concetti + versione estesa + completa */}
          {currentStep === 4 && (
            <div>
              {conceptTags.length > 0 && (
                <div className="mb-5">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                    🔑 Concetti chiave
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {conceptTags.map((tag, i) => (
                      <span key={i} className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full font-medium border border-gray-200">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={handleLoadExtended}
                disabled={loadingExtended}
                className="w-full border-2 border-dashed border-orange-200 bg-orange-50 text-orange-700 text-sm font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 mb-4 hover:bg-orange-100 hover:border-orange-300 transition-all disabled:opacity-50"
              >
                {loadingExtended
                  ? <><span className="animate-spin">⏳</span> Caricamento...</>
                  : <>📚 Leggi la versione estesa</>
                }
              </button>

              {completed ? (
                <div className="w-full bg-green-50 border border-green-200 text-green-700 text-sm font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2">
                  ✅ Episodio completato
                </div>
              ) : reflectionSaved && reflectionText.trim() ? (
                <button
                  onClick={handleComplete}
                  disabled={completing}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-60 shadow-sm"
                >
                  {completing
                    ? <><span className="animate-spin">⏳</span> Salvataggio...</>
                    : <>✓ Completa episodio</>
                  }
                </button>
              ) : (
                <div className="w-full bg-amber-50 border border-amber-200 text-amber-700 text-sm font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2">
                  ⚠️ Completa la riflessione per procedere
                </div>
              )}
            </div>
          )}

        </div>

        {/* Nav buttons */}
        <div className="flex gap-3 mt-4">
          {currentStep > 1 && (
            <button
              onClick={() => setCurrentStep(s => s - 1)}
              className="flex-1 bg-white border-2 border-gray-200 text-gray-600 font-semibold text-sm py-3.5 rounded-xl hover:border-gray-300 transition-all"
            >
              ← Indietro
            </button>
          )}
          {currentStep < TOTAL_STEPS && (
            <button
              onClick={() => setCurrentStep(s => s + 1)}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm py-3.5 px-6 rounded-xl transition-all shadow-sm"
            >
              Continua →
            </button>
          )}
        </div>

      </div>
    </main>
  );
}
