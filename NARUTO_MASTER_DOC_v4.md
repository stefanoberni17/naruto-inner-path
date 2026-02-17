# 🍥 NARUTO INNER PATH — MASTER DOCUMENT v4.0

**Data:** 17 Febbraio 2026  
**Developer:** Stefano Berni  
**Sessioni completate:** 4  
**Stato MVP:** ~80%

---

## 📋 INDICE

1. [Info Progetto](#info-progetto)
2. [Tech Stack & Setup](#tech-stack--setup)
3. [Struttura File Completa](#struttura-file-completa)
4. [Variabili Ambiente](#variabili-ambiente)
5. [Database Supabase](#database-supabase)
6. [Database Notion](#database-notion)
7. [Codice Completo — Tutti i File](#codice-completo)
8. [Logica Unlock](#logica-unlock)
9. [Chatbot AI — Regole e Prompt](#chatbot-ai)
10. [Sessioni Sviluppo](#sessioni-sviluppo)
11. [Problemi Risolti](#problemi-risolti)
12. [Prossimi Step](#prossimi-step)

---

## 📊 INFO PROGETTO

| Campo | Valore |
|-------|--------|
| **Nome** | Naruto Inner Path |
| **Descrizione** | Percorso crescita personale 24 settimane ispirato a Naruto |
| **Repository** | https://github.com/stefanoberni17/naruto-inner-path |
| **Deploy** | https://naruto-inner-path.vercel.app |
| **Stato** | MVP ~80% — Beta testing imminente |
| **Scope MVP** | Week 1-6, Episodi 1-19 |

### **Filosofia "For You" — 8 Pilastri:**
1. **Presenza** — Essere qui, ora
2. **Osservazione** — Observer vs observed (senza giudizio)
3. **Accettazione** — "Questo è ciò che è"
4. **Responsabilità** — Response-ability = potere personale
5. **Integrazione** — Integrare, non eliminare (Guerriero Gentile)
6. **Corpo-Mente-Spirito** — Approccio olistico
7. **Verità e Autenticità** — Meglio deludere che tradire se stessi
8. **Direzione** — Guarigione + creazione consapevole

---

## 🚀 TECH STACK & SETUP

| Tool | Versione | Uso |
|------|----------|-----|
| Next.js | 16.1.6 | Framework frontend (App Router) |
| TypeScript | 5.x | Linguaggio |
| Tailwind CSS | 3.4.17 | Styling |
| Supabase | 2.95.3 | Auth + Database |
| Notion API | @notionhq/client 5.9.0 | CMS contenuti |
| Anthropic Claude | claude-sonnet-4-20250514 | Chatbot AI |
| Lucide React | 0.468.0 | Icone |
| Vercel | — | Deploy |

### **Installazione da zero:**
```bash
git clone https://github.com/stefanoberni17/naruto-inner-path.git
cd naruto-inner-path
npm install
# Crea .env.local (vedi sezione Variabili Ambiente)
npm run dev
```

---

## 📁 STRUTTURA FILE COMPLETA

```
naruto-inner-path/
├── app/
│   ├── api/
│   │   ├── chat/
│   │   │   └── route.ts          ✅ API Claude chatbot (context-aware)
│   │   ├── episodio/
│   │   │   └── route.ts          ✅ API episodio (GET + POST unlock logic)
│   │   ├── settimane/
│   │   │   └── route.ts          ✅ API lista settimane da Notion
│   │   └── settimana/
│   │       └── route.ts          ✅ API singola settimana (page + blocks)
│   ├── chat/
│   │   └── page.tsx              ✅ Pagina chat AI (con auth check)
│   ├── dashboard/
│   │   └── page.tsx              ✅ Dashboard con progress reale
│   ├── episodio/
│   │   └── [id]/
│   │       └── page.tsx          ✅ Pagina episodio singolo
│   ├── login/
│   │   └── page.tsx              ✅ Login
│   ├── profilo/
│   │   └── page.tsx              ✅ Profilo con dropdown week corrente
│   ├── register/
│   │   └── page.tsx              ✅ Registrazione con 6 campi
│   ├── settimana/
│   │   └── [id]/
│   │       └── page.tsx          ✅ Pagina settimana con lista episodi
│   ├── favicon.ico
│   ├── globals.css               ✅ Tailwind + custom CSS input
│   ├── layout.tsx                ✅ Layout con BottomTabBar
│   └── page.tsx                  ✅ Homepage con unlock settimane
├── components/
│   ├── BottomTabBar.tsx          ✅ Tab bar mobile (4 tab)
│   ├── ChatBot.tsx               ✅ Componente chat con userId
│   └── EpisodeCard.tsx           ✅ Card episodio con stati 🔒📺✅
├── lib/
│   ├── episodeMapping.ts         ✅ Mapping episodi → Notion IDs
│   ├── supabase.ts               ✅ Client Supabase (browser)
│   └── weekUnlockLogic.ts        ✅ Logica unlock settimane
├── .env.local                    ✅ Variabili ambiente (non committare!)
├── next.config.mjs
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## 🔑 VARIABILI AMBIENTE

### **`.env.local` completo:**
```env
# Notion API
NOTION_TOKEN=secret_ntn_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_DATABASE_SETTIMANE=2b1655f726c780a08e3aeb678195415d
NOTION_DATABASE_EPISODI=2b1655f726c780899607f157d76a6edf

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://hgnxncssllmnwmydljig.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Anthropic Claude API
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### **⚠️ Note importanti:**
- `.env.local` è in `.gitignore` — non viene mai committato
- Su **Vercel**: aggiungi TUTTE manualmente (Settings → Environment Variables)
- `SUPABASE_SERVICE_ROLE_KEY` serve per le API routes server-side (bypassa RLS)
- Riavvia server dopo modifiche al `.env.local`

---

## 🗄️ DATABASE SUPABASE

### **Progetto:** naruto-inner-path
### **URL:** https://hgnxncssllmnwmydljig.supabase.co

---

### **Tabella `profiles`**

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  age INT4,
  current_week INT4 DEFAULT 1,    -- ✅ AGGIUNTO SESSIONE 4
  goals TEXT,
  passions TEXT,
  dream TEXT,
  current_situation TEXT
);

CREATE INDEX idx_profiles_user_id ON profiles(user_id);
```

---

### **Tabella `user_episode_progress`** ✅ NUOVA — Sessione 4

```sql
CREATE TABLE user_episode_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  episode_number INT4 NOT NULL,
  week_number INT4 NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(user_id, episode_number)
);

CREATE INDEX idx_episode_progress_user ON user_episode_progress(user_id);
CREATE INDEX idx_episode_progress_week ON user_episode_progress(user_id, week_number);
```

---

### **RLS Policies:**

```sql
-- PROFILES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
WITH CHECK (true); -- true perché durante signup l'utente non è ancora authenticated

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

-- USER_EPISODE_PROGRESS
ALTER TABLE user_episode_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own progress"
ON user_episode_progress FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
ON user_episode_progress FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
ON user_episode_progress FOR UPDATE TO authenticated
USING (auth.uid() = user_id);
```

> **NOTA:** Le API routes usano `SUPABASE_SERVICE_ROLE_KEY` che bypassa RLS!

---

### **Query utili:**

```sql
-- Vedi tutti gli utenti
SELECT id, email FROM auth.users;

-- Vedi tutti i profili
SELECT user_id, name, current_week FROM profiles;

-- Vedi progressi episodi di un utente
SELECT episode_number, week_number, completed_at 
FROM user_episode_progress 
WHERE user_id = 'xxx' 
ORDER BY episode_number;

-- Reset test utente
DELETE FROM user_episode_progress WHERE user_id = 'xxx';
```

---

## 📒 DATABASE NOTION

### **Database Settimane**
- **URL:** https://www.notion.so/2b1655f726c780a08e3aeb678195415d
- **Proprietà:** Numero, Settimana (title), Titolo, Tema principale, Episodi, Stato

### **Database Episodi**
- **URL:** https://www.notion.so/2b1655f726c780899607f157d76a6edf
- **Proprietà:** Numero, Episodio (title), Titolo episodio, Mini-lezione breve, Domanda riflessiva, Tema principale, Concetti collegati, Settimana, Pratiche consigliate

### **Episodi Notion IDs (MVP 1-15 popolati):**

| Ep | Titolo | Notion ID |
|----|--------|-----------|
| 1 | Enter: Naruto Uzumaki! | 2b1655f726c780a89749c23c9dab1a3f |
| 2 | My Name is Konohamaru! | 2b1655f726c7806696e9c7032458099e |
| 3 | Sasuke and Sakura: Friends or Foes? | 2b1655f726c78070a7d0f14414e537e9 |
| 4 | Pass or Fail: Survival Test | 2b1655f726c7809da5e1efc76b083063 |
| 5 | You Failed! Kakashi's Final Decision | 2b1655f726c78060a330fc1856659f37 |
| 6 | A Dangerous Mission! Land of Waves! | 2b1655f726c7809bb3d8d6f4a077ec23 |
| 7 | The Assassin of the Mist! | 2b1655f726c780ad8f8cde821a99ea88 |
| 8 | The Oath of Pain | 2b1655f726c78093abe0e398b8be7421 |
| 9 | Kakashi: Sharingan Warrior! | 2b1655f726c780099243edc9151fe53b |
| 10 | The Forest of Chakra | 2b1655f726c78030bf8bcafb5c64b4aa |
| 11 | The Land Where a Hero Once Lived | 2b1655f726c7802bb43ff1b53846299b |
| 12 | Battle on the Bridge! Zabuza Returns! | 2b1655f726c780aab64dd6ccd7ce6396 |
| 13 | Haku's Secret Jutsu: Crystal Ice Mirrors | 2b1655f726c780eebac5d5cb928a1d4a |
| 14 | The Number One Hyperactive Ninja! | 2b1655f726c780be82c6de51da91012e |
| 15 | Zero Visibility: The Sharingan Shatters | 2b1655f726c780b8b8d1d8a384b9bf0f |
| 16-19 | Da aggiungere | TODO |

### **Week Pages:**
- Week 1-2: https://www.notion.so/2b1655f726c780258afedf0ed131d708
- Week 3-4: https://www.notion.so/2b1655f726c78054a0d4c4a48c509852
- Week 5-6: https://www.notion.so/2b1655f726c78038bd91c3fa9e5b31cb
- Week 17-18: https://www.notion.so/2b1655f726c780bdab48ebca2253874e

---

## 💻 CODICE COMPLETO

### **`lib/supabase.ts`**
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

---

### **`lib/episodeMapping.ts`**
```typescript
export const EPISODE_MAPPING: Record<number, string> = {
  1: '2b1655f726c780a89749c23c9dab1a3f',
  2: '2b1655f726c7806696e9c7032458099e',
  3: '2b1655f726c78070a7d0f14414e537e9',
  4: '2b1655f726c7809da5e1efc76b083063',
  5: '2b1655f726c78060a330fc1856659f37',
  6: '2b1655f726c7809bb3d8d6f4a077ec23',
  7: '2b1655f726c780ad8f8cde821a99ea88',
  8: '2b1655f726c78093abe0e398b8be7421',
  9: '2b1655f726c780099243edc9151fe53b',
  10: '2b1655f726c78030bf8bcafb5c64b4aa',
  11: '2b1655f726c7802bb43ff1b53846299b',
  12: '2b1655f726c780aab64dd6ccd7ce6396',
  13: '2b1655f726c780eebac5d5cb928a1d4a',
  14: '2b1655f726c780be82c6de51da91012e',
  15: '2b1655f726c780b8b8d1d8a384b9bf0f',
  16: '', // TODO
  17: '', // TODO
  18: '', // TODO
  19: '', // TODO
};

export const EPISODE_TO_WEEK: Record<number, number> = {
  1: 1, 2: 1, 3: 1, 4: 1, 5: 2,
  6: 3, 7: 3, 8: 3, 9: 4, 10: 4, 11: 4, 12: 4,
  13: 5, 14: 5, 15: 5, 16: 6, 17: 6, 18: 6, 19: 6,
};

export function getEpisodePageId(episodeNumber: number): string | null {
  return EPISODE_MAPPING[episodeNumber] || null;
}

export function getWeekFromEpisode(episodeNumber: number): number {
  return EPISODE_TO_WEEK[episodeNumber] || 1;
}

export function isEpisodeInMVP(episodeNumber: number): boolean {
  return episodeNumber >= 1 && episodeNumber <= 19;
}
```

---

### **`lib/weekUnlockLogic.ts`**
```typescript
const WEEK_EPISODES: Record<number, { start: number; end: number }> = {
  1: { start: 1, end: 5 },
  2: { start: 1, end: 5 },
  3: { start: 6, end: 12 },
  4: { start: 6, end: 12 },
  5: { start: 13, end: 19 },
  6: { start: 13, end: 19 },
};

interface EpisodeProgress {
  episode_number: number;
  completed: boolean;
}

export function getUnlockedWeeks(completedEpisodes: EpisodeProgress[]): number[] {
  const completedNumbers = completedEpisodes
    .filter(ep => ep.completed)
    .map(ep => ep.episode_number);

  const unlockedWeeks: number[] = [];

  for (let week = 1; week <= 6; week++) {
    if (week === 1) {
      unlockedWeeks.push(1);
      continue;
    }
    const { start, end } = WEEK_EPISODES[week - 1];
    const allPreviousCompleted = Array.from(
      { length: end - start + 1 },
      (_, i) => start + i
    ).every(epNum => completedNumbers.includes(epNum));

    if (allPreviousCompleted) unlockedWeeks.push(week);
  }

  return unlockedWeeks;
}

export function isWeekUnlocked(weekNumber: number, completedEpisodes: EpisodeProgress[]): boolean {
  return getUnlockedWeeks(completedEpisodes).includes(weekNumber);
}
```

---

### **`app/layout.tsx`**
```typescript
import type { Metadata } from "next";
import "./globals.css";
import BottomTabBar from "@/components/BottomTabBar";

export const metadata: Metadata = {
  title: "Naruto Inner Path",
  description: "La via del Guerriero Gentile",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body className="pb-20">
        {children}
        <BottomTabBar />
      </body>
    </html>
  );
}
```

---

### **`app/globals.css`**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

input, textarea, select {
  color: rgb(31 41 55) !important;
}

input::placeholder, textarea::placeholder {
  color: rgb(107 114 128);
  opacity: 1;
}
```

---

### **`components/BottomTabBar.tsx`**
```typescript
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LayoutDashboard, MessageCircle, User } from 'lucide-react';

export default function BottomTabBar() {
  const pathname = usePathname();

  if (pathname === '/login' || pathname === '/register') return null;

  const tabs = [
    { href: '/', label: 'Percorso', icon: Home },
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/chat', label: 'Maestro AI', icon: MessageCircle },
    { href: '/profilo', label: 'Profilo', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-around items-center h-16">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                  isActive ? 'text-orange-600' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Icon className={`w-6 h-6 ${isActive ? 'stroke-[2.5]' : ''}`} />
                <span className="text-xs mt-1 font-medium">{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
```

---

### **`components/EpisodeCard.tsx`**
```typescript
'use client';

import { useRouter } from 'next/navigation';

interface EpisodeCardProps {
  episodeNumber: number;
  title: string;
  isCompleted: boolean;
  isLocked: boolean;
  weekNumber: number;
  userId: string;
  onComplete: () => void;
}

export default function EpisodeCard({ 
  episodeNumber, title, isCompleted, isLocked, weekNumber, userId, onComplete
}: EpisodeCardProps) {
  const router = useRouter();

  const handleClick = () => {
    if (isLocked) return;
    router.push(`/episodio/${episodeNumber}?userId=${userId}`);
  };

  const handleComplete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCompleted || isLocked) return;
    try {
      const response = await fetch('/api/episodio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ episodeNumber, userId }),
      });
      if (response.ok) onComplete();
    } catch (error) {
      console.error('Errore completamento episodio:', error);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`bg-white rounded-lg shadow p-4 transition-all ${
        isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-lg'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-gray-600">Episodio {episodeNumber}</span>
        <span className="text-2xl">{isLocked ? '🔒' : isCompleted ? '✅' : '📺'}</span>
      </div>
      <h3 className={`font-bold text-sm mb-3 ${isLocked ? 'text-gray-400' : 'text-gray-800'}`}>
        {title}
      </h3>
      {isLocked && (
        <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
          🔒 Completa episodio {episodeNumber - 1} per sbloccare
        </p>
      )}
      {!isLocked && !isCompleted && (
        <button
          onClick={handleComplete}
          className="w-full mt-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold py-2 px-3 rounded transition-all"
        >
          ✓ Segna come completato
        </button>
      )}
      {isCompleted && (
        <div className="mt-2 text-xs text-green-600 bg-green-50 p-2 rounded text-center">
          ✅ Completato
        </div>
      )}
    </div>
  );
}
```

---

### **`app/episodio/[id]/page.tsx`**
```typescript
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
        const response = await fetch(`/api/episodio?number=${episodeNumber}&userId=${userId}`);
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
          <h1 className="text-4xl font-bold text-gray-800 mb-4">{episodeData?.title}</h1>
          {episodeData?.mainTheme && (
            <p className="text-lg text-orange-600 font-semibold mb-6">🎯 {episodeData.mainTheme}</p>
          )}
          {episodeData?.miniLesson && (
            <div className="bg-orange-50 border-l-4 border-orange-500 p-6 rounded mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-3">📖 Mini-lezione</h2>
              <p className="text-gray-700 leading-relaxed">{episodeData.miniLesson}</p>
            </div>
          )}
          {episodeData?.reflectionQuestion && (
            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-3">💭 Domanda riflessiva</h2>
              <p className="text-gray-700 italic">{episodeData.reflectionQuestion}</p>
            </div>
          )}
          {episodeData?.concepts && (
            <div className="bg-gray-50 p-6 rounded mb-6">
              <h3 className="font-semibold text-gray-700 mb-2">🔑 Concetti chiave</h3>
              <p className="text-gray-600 text-sm">{episodeData.concepts}</p>
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
```

---

### **`app/api/episodio/route.ts`**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { Client } from '@notionhq/client';
import { createClient } from '@supabase/supabase-js';
import { getEpisodePageId, getWeekFromEpisode, isEpisodeInMVP } from '@/lib/episodeMapping';

const notion = new Client({ auth: process.env.NOTION_TOKEN });

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const episodeNumber = parseInt(searchParams.get('number') || '1');
  const userId = searchParams.get('userId');

  try {
    if (!isEpisodeInMVP(episodeNumber)) {
      return NextResponse.json({ error: 'Episodio fuori scope MVP', locked: true }, { status: 400 });
    }

    if (userId && episodeNumber > 1) {
      const { data: prev } = await supabaseAdmin
        .from('user_episode_progress')
        .select('completed')
        .eq('user_id', userId)
        .eq('episode_number', episodeNumber - 1)
        .single();

      if (!prev?.completed) {
        return NextResponse.json({
          locked: true,
          message: `Completa l'episodio ${episodeNumber - 1} per sbloccare questo`,
          episodeNumber,
        });
      }
    }

    let isCompleted = false;
    if (userId) {
      const { data: curr } = await supabaseAdmin
        .from('user_episode_progress')
        .select('completed')
        .eq('user_id', userId)
        .eq('episode_number', episodeNumber)
        .single();
      isCompleted = curr?.completed || false;
    }

    const pageId = getEpisodePageId(episodeNumber);
    if (!pageId) {
      return NextResponse.json({ error: 'ID Notion non configurato', episodeNumber }, { status: 404 });
    }

    const page = await notion.pages.retrieve({ page_id: pageId });
    const properties = (page as any).properties;

    return NextResponse.json({
      episode: {
        number: episodeNumber,
        title: properties['Titolo episodio']?.rich_text?.[0]?.plain_text || `Episodio ${episodeNumber}`,
        miniLesson: properties['Mini-lezione breve']?.rich_text?.[0]?.plain_text || '',
        reflectionQuestion: properties['Domanda riflessiva']?.rich_text?.[0]?.plain_text || '',
        mainTheme: properties['Tema principale']?.rich_text?.[0]?.plain_text || '',
        concepts: properties['Concetti collegati']?.rich_text?.[0]?.plain_text || '',
        weekNumber: getWeekFromEpisode(episodeNumber),
        locked: false,
        completed: isCompleted,
      },
      locked: false,
    });

  } catch (error: any) {
    console.error('Errore API episodio:', error);
    return NextResponse.json({ error: 'Errore nel caricamento', details: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { episodeNumber, userId } = await request.json();

    if (!userId || !episodeNumber) {
      return NextResponse.json({ error: 'userId e episodeNumber richiesti' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('user_episode_progress')
      .upsert({
        user_id: userId,
        episode_number: episodeNumber,
        week_number: getWeekFromEpisode(episodeNumber),
        completed: true,
        completed_at: new Date().toISOString(),
      }, { onConflict: 'user_id,episode_number' })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      progress: data,
      nextEpisode: episodeNumber + 1,
      unlockedNext: episodeNumber < 19,
    });

  } catch (error: any) {
    return NextResponse.json({ error: 'Errore nel salvataggio', details: error.message }, { status: 500 });
  }
}
```

---

### **`app/api/chat/route.ts`**
```typescript
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const SYSTEM_PROMPT = `Sei un maestro spirituale che guida gli utenti attraverso "Naruto Inner Path".

REGOLE COMUNICAZIONE CRITICHE:
1. Risposte CONCISE (max 3-4 frasi)
2. NO "ti capisco", "ti sento", "comprendo" ripetitivi
3. MAX UNA domanda per risposta - se hai già fatto domande NON aggiungerne altre
4. SOLO episodi già visti - NO spoiler episodi futuri
5. SOLO concetti settimana corrente o precedenti - NO anticipare settimane future
6. Lascia spazio - non riempire ogni silenzio con domande

SETTIMANE MVP (1-6):
- Week 1-2 (Ep 1-5): La ferita del rifiuto
- Week 3-4 (Ep 6-12): Presenza e ascolto
- Week 5-6 (Ep 13-19): Valore e appartenenza`;

export async function POST(request: NextRequest) {
  try {
    const { messages, userId } = await request.json();

    let currentWeek = 1;
    let lastEpisode = 0;
    let userContext = '';

    if (userId) {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('name, age, goals, current_week, passions, dream, current_situation')
        .eq('user_id', userId)
        .single();

      if (profile) {
        currentWeek = profile.current_week || 1;

        const { data: progress } = await supabaseAdmin
          .from('user_episode_progress')
          .select('episode_number')
          .eq('user_id', userId)
          .eq('completed', true)
          .order('episode_number', { ascending: false })
          .limit(1)
          .single();

        lastEpisode = progress?.episode_number || 0;

        const weekNames: Record<number, string> = {
          1: 'Week 1 - La ferita del rifiuto',
          2: 'Week 2 - La ferita del rifiuto',
          3: 'Week 3 - Presenza e ascolto',
          4: 'Week 4 - Presenza e ascolto',
          5: 'Week 5 - Valore e appartenenza',
          6: 'Week 6 - Valore e appartenenza',
        };

        userContext = `\n\nCONTESTO UTENTE:
- Nome: ${profile.name}
- Settimana corrente: ${currentWeek} (${weekNames[currentWeek]})
- Ultimo episodio visto: ${lastEpisode > 0 ? `Episodio ${lastEpisode}` : 'Nessuno ancora'}
- Obiettivi: ${profile.goals || 'non specificati'}
- Passioni: ${profile.passions || 'non specificate'}
- Sogno: ${profile.dream || 'non specificato'}
- Situazione attuale: ${profile.current_situation || 'non specificata'}`;
      }
    }

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 512,
      system: SYSTEM_PROMPT + userContext,
      messages: messages.map((m: any) => ({ role: m.role, content: m.content })),
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';

    return NextResponse.json({ message: text, debug: { currentWeek, lastEpisode } });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({ error: 'Failed to process chat message' }, { status: 500 });
  }
}
```

---

## 🔓 LOGICA UNLOCK

### **Episodi:**
- Episodio 1: sempre disponibile
- Episodio N: disponibile solo se episodio N-1 completato
- Stati: 🔒 Locked | 📺 Available | ✅ Completed

### **Settimane:**
- Week 1: sempre disponibile
- Week 2: disponibile se tutti gli episodi 1-5 completati
- Week 3: disponibile se tutti gli episodi 1-5 completati (stessi di Week 2)
- Week 4: disponibile se tutti gli episodi 6-12 completati
- Week 5: disponibile se tutti gli episodi 6-12 completati
- Week 6: disponibile se tutti gli episodi 13-19 completati

---

## 🤖 CHATBOT AI

### **Modello:** claude-sonnet-4-20250514
### **Max tokens:** 512 (risposte concise)
### **Context passato:**
- Nome utente
- Settimana corrente
- Ultimo episodio visto
- Obiettivi, passioni, sogno, situazione attuale

### **Regole:**
1. Risposte concise (max 3-4 frasi)
2. NO "ti capisco", "ti sento" ripetitivi
3. MAX una domanda per risposta
4. NO spoiler episodi non ancora visti
5. NO concetti settimane future
6. Lascia spazio alla fine

---

## 📅 SESSIONI SVILUPPO

### **SESSIONE 1 — Setup & Contenuti Base (3 ore)**
- Setup Next.js 16 + Tailwind
- Integrazione Notion API
- Homepage grid settimane
- Pagina dettaglio settimana con rendering blocchi
- Deploy Vercel

### **SESSIONE 2 — Autenticazione Completa (4 ore)**
- Setup Supabase
- Tabella `profiles` con 6 campi
- RLS policies
- Login / Register / Dashboard / Profilo
- Protezione routes

### **SESSIONE 3 — Chatbot AI + UI Moderna (2.5 ore)**
- Chatbot Claude Sonnet 4
- Bottom Tab Bar mobile-style
- Cleanup UI (rimossi header duplicati)
- Lucide icons

### **SESSIONE 4 — Unlock Progressivo + Context-Aware (3 ore)**
- Tabella `user_episode_progress`
- Campo `current_week` in profiles
- Logica unlock settimane
- Logica unlock episodi
- EpisodeCard con stati 🔒📺✅
- Pagina episodio singolo
- Chatbot context-aware (sa dove sei)
- Fix RLS con service role key

---

## 🐛 PROBLEMI RISOLTI

| Problema | Causa | Soluzione |
|----------|-------|-----------|
| `notion.pages.query is not a function` | SDK v5.9.0 incompatibile | Dual-approach: SDK + fetch HTTP |
| RLS blocca INSERT profiles | Policy richiede auth durante signup | `WITH CHECK (true)` |
| RLS blocca INSERT progress | API server-side usa client anonimo | `SUPABASE_SERVICE_ROLE_KEY` |
| package.json sovrascritto | Copia sbagliata | `git checkout package.json` |
| Font Geist mancante | layout.tsx sovrascritto | Rimuovere import font |
| Tailwind non funziona | globals.css sbagliato | Ripristinare `@tailwind` directives |
| ChatBot non passa userId | Mancava prop nella fetch | Aggiunto `userId` nel body |
| Pagina chat server component | Mancava `'use client'` | Aggiunto + auth check |
| Episodio page 404 | Cartella non creata | `mkdir -p app/episodio/[id]` |

---

## 🚀 PROSSIMI STEP

### **SESSIONE 5: Versione Estesa Episodio (1-2 ore)**
Nella pagina episodio, aggiungere toggle "Leggi versione estesa" che carica i blocchi completi dalla pagina Notion dell'episodio.

**Task:**
- Aggiungi `GET /api/episodio?number=X&extended=true` che fetcha anche i blocks
- Nella pagina `/episodio/[id]` aggiungi bottone "📖 Leggi versione estesa"
- Toggle che mostra/nasconde il contenuto completo
- Renderizza blocchi Notion (stesso renderBlock già fatto nella pagina settimana)

### **SESSIONE 6: Episodi 16-19 IDs (30 min)**
- Recuperare Notion IDs episodi 16-19 mancanti
- Aggiornare `lib/episodeMapping.ts`

### **SESSIONE 7: Polish + Beta (2 ore)**
- Mobile optimization
- Bug fixing
- Preparare beta testing Instagram

---

## 🔗 QUICK REFERENCE

```bash
# Development
cd ~/progetti/naruto-inner-path
npm run dev

# Commit
git add .
git commit -m "Descrizione"
git push

# Clean cache
rm -rf .next && npm run dev
```

```sql
-- Reset progresso utente (test)
DELETE FROM user_episode_progress WHERE user_id = 'xxx';

-- Vedi stato utente
SELECT p.name, p.current_week, COUNT(ep.id) as episodi_completati
FROM profiles p
LEFT JOIN user_episode_progress ep ON p.user_id = ep.user_id AND ep.completed = true
GROUP BY p.name, p.current_week;
```

---

*🍥 NARUTO INNER PATH — La via del Guerriero Gentile*  
*Master Document v4.0 — 17 Febbraio 2026*
