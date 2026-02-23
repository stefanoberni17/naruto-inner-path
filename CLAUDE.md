# Naruto Inner Path — Guida al Progetto

## Panoramica

**Naruto Inner Path** è un'app di crescita personale a tema Naruto. Gli utenti compiono un percorso psicologico strutturato in settimane e episodi, guidati da un AI (il "Maestro") che funge da specchio consapevole — non terapeuta, non coach. Il contenuto (episodi, mantra, pratiche) è gestito su Notion come CMS.

**Tagline:** *La via del Guerriero Gentile*

**Stato attuale:** MVP in Beta. Settimane 1-4 disponibili (episodi 1-12), settimane 5-6 bloccate.

---

## Stack Tecnologico

| Layer | Tecnologia |
|-------|-----------|
| Framework | Next.js 16.1.6 (App Router) |
| Language | TypeScript 5 |
| Frontend | React 19.2.3 |
| Styling | Tailwind CSS 4 |
| Auth + DB | Supabase (PostgreSQL) |
| CMS | Notion API (`@notionhq/client`) |
| AI | Anthropic Claude Sonnet (`@anthropic-ai/sdk`) |
| Bot | Telegram (`node-telegram-bot-api`) |
| Icons | Lucide React |

---

## Struttura delle Cartelle

```
naruto-inner-path/
├── app/
│   ├── layout.tsx                 # Root layout: GlobalMeditationWrapper + BottomTabBar
│   ├── page.tsx                   # Dashboard (home) — richiede auth
│   ├── login/page.tsx
│   ├── register/page.tsx
│   ├── onboarding/page.tsx
│   ├── chat/page.tsx              # Chat con Maestro AI
│   ├── settimane/page.tsx         # Lista settimane con lock/unlock
│   ├── settimana/[id]/page.tsx    # Dettaglio settimana (id = Notion page ID)
│   ├── episodio/[id]/page.tsx     # Episodio (id = numero episodio 1-19)
│   ├── profilo/page.tsx
│   └── api/
│       ├── settimane/route.ts     # GET → lista 6 settimane da Notion DB
│       ├── settimana/route.ts     # GET ?id= → dettaglio pagina Notion + blocchi
│       ├── episodio/route.ts      # GET ?number=&userId=  /  POST completamento
│       ├── practices/route.ts     # GET/POST tracker pratiche (14 giorni × 3 pratiche)
│       ├── reflection/route.ts    # GET/POST riflessioni post-episodio
│       ├── chat/route.ts          # POST → Claude Sonnet con context utente
│       └── telegram/route.ts      # POST → webhook bot Telegram
├── components/
│   ├── BottomTabBar.tsx           # Nav fissa: Home / Percorso / Maestro / Profilo
│   ├── ChatBot.tsx                # UI chat (usata in /chat)
│   ├── EpisodeCard.tsx            # Card episodio per /settimana/[id]
│   ├── GlobalMeditationWrapper.tsx# Context provider meditazione (in layout)
│   ├── MeditationContext.tsx      # Context: { openMeditation, mantra, weekName }
│   ├── MeditationPopup.tsx        # Popup meditazione guidata (2 fasi)
│   └── Navigation.tsx             # (non in uso attivo)
├── lib/
│   ├── supabase.ts                # Client Supabase pubblico (browser)
│   ├── episodeMapping.ts          # Map episodio → Notion pageId, settimana
│   ├── weekUnlockLogic.ts         # Logica sblocco settimane sequenziale
│   └── maestro-ai.ts             # System prompt + buildUserContext + callClaude
├── public/
│   └── audio/
│       ├── nature-meditation.mp3
│       └── naruto-meditation.mp3
└── docs/                          # ← Documentazione progetto (da popolare)
```

---

## Variabili Ambiente (`.env.local`)

```
# Notion
NOTION_TOKEN=
NOTION_DATABASE_SETTIMANE=      # ID del database settimane su Notion
NOTION_DATABASE_EPISODI=        # ID del database episodi su Notion

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=      # Usata server-side in maestro-ai.ts

# Anthropic
ANTHROPIC_API_KEY=

# Telegram (opzionale)
TELEGRAM_BOT_TOKEN=
```

---

## Schema Database Supabase

### `profiles`
```sql
user_id                  UUID PRIMARY KEY  -- = auth.users.id
name                     TEXT
age                      INT
goals                    TEXT
passions                 TEXT
dream                    TEXT
current_situation        TEXT
current_week             INT DEFAULT 1     -- settimana attuale (1-6)
telegram_id              TEXT              -- per il bot Telegram
onboarding_completed     BOOLEAN DEFAULT false
last_meditation_completed DATE             -- usato per daily check meditazione
```

### `user_episode_progress`
```sql
user_id          UUID
episode_number   INT
week_number      INT
completed        BOOLEAN
completed_at     TIMESTAMPTZ
PRIMARY KEY (user_id, episode_number)
```

### `episode_reflections`
```sql
user_id              UUID
episode_number       INT
reflection_text      TEXT   -- risposta utente (max 500 char)
reflection_question  TEXT   -- domanda dell'episodio
created_at           TIMESTAMPTZ
updated_at           TIMESTAMPTZ
PRIMARY KEY (user_id, episode_number)
```

### `weekly_practices`
```sql
user_id          UUID
week_number      INT
practice_number  INT         -- 1, 2 o 3
completed_days   JSONB       -- { day1: bool, ..., day14: bool }
created_at       TIMESTAMPTZ
updated_at       TIMESTAMPTZ
PRIMARY KEY (user_id, week_number, practice_number)
```

---

## Struttura Contenuto (Notion)

Il contenuto educativo è su Notion. Due database principali:

### Database Settimane (`NOTION_DATABASE_SETTIMANE`)
6 pagine, una per ogni settimana. Ogni pagina ha le properties:
- `Settimana` — numero (1-6)
- `Titolo` / `Tema`
- `Mantra` — citazione settimanale (testo con `<br>` per a capo)
- `Pratiche` — 3 pratiche separate da `\n`
- `Episodi` — lista episodi di quella settimana

### Database Episodi (`NOTION_DATABASE_EPISODI`)
19 pagine. Ogni pagina ha:
- `Numero` — episodio 1-19
- `Titolo`
- `MiniLezione` — testo formativo
- `DomandaRiflettiva` — domanda per la riflessione
- `Tema` / `Concetti`
- Blocchi Notion completi (paragrafi, heading, quote, callout, toggle, list, ecc.)

### Mapping Settimane → Notion Page IDs
```typescript
// In GlobalMeditationWrapper.tsx e app/page.tsx (mantenere sincronizzati!)
const WEEK_IDS: Record<number, string> = {
  1: '2b1655f7-26c7-8025-8afe-df0ed131d708',  // Week 1-2: La ferita del rifiuto
  2: '2b1655f7-26c7-8025-8afe-df0ed131d708',
  3: '2b1655f7-26c7-8054-a0d4-c4a48c509852',  // Week 3-4: Presenza e ascolto
  4: '2b1655f7-26c7-8054-a0d4-c4a48c509852',
  5: '2b1655f7-26c7-8038-bd91-c3fa9e5b31cb',  // Week 5-6: Valore e appartenenza
  6: '2b1655f7-26c7-8038-bd91-c3fa9e5b31cb',
}
```
> ⚠️ Questo mapping è duplicato in più file — se cambia, aggiornare tutti.

---

## Struttura del Percorso (MVP)

| Settimane | Tema | Episodi |
|-----------|------|---------|
| 1-2 | La ferita del rifiuto | 1-5 |
| 3-4 | Presenza e ascolto | 6-12 |
| 5-6 | Valore e appartenenza | 13-19 |

**Logica sblocco settimane** (`lib/weekUnlockLogic.ts`):
- Week 1 sempre disponibile
- Week N si sblocca quando tutti gli episodi della week N-1 sono completati
- Beta: max week 4 (episodi 1-12), costante `BETA_MAX_WEEK = 4`

**Logica sblocco episodi** (`/api/episodio`):
- Episodio N si sblocca solo se N-1 è completato
- Episodio 1 sempre disponibile

---

## Flussi Principali

### Autenticazione
```
Register (email + profilo) → Email conferma Supabase
  → Login → Check profilo + onboarding
    → Se onboarding non completato → /onboarding
    → Se ok → / (home)
```
> Nessun middleware attivo (`middleware.ts.backup`). Auth gestita client-side in ogni page.

### Episodio
```
/settimane → /settimana/[id] → /episodio/[numero]
  → Leggi contenuto da Notion
  → Scrivi riflessione (max 500 char)
  → "Segna come completato" → POST /api/episodio
    → Salva in user_episode_progress
    → Auto-aggiorna current_week se fine coppia settimane
    → Mostra schermata di celebrazione (fullscreen orange)
      → Bottone manuale "Continua il percorso →" per tornare indietro
```

### Completamento Settimana
```
Quando l'utente completa l'ultimo episodio di una settimana:
  → checkCompletion() in settimana/[id]/page.tsx
    → Se appena completata in questa sessione: popup di celebrazione 🏆
      → Bottone "Passa alla settimana successiva" (se disponibile in Beta)
      → Messaggio "stay tuned" (se prossima settimana è Beta-locked)
    → Se già completata in sessioni precedenti: solo bottone fisso in fondo
```

**Nota**: Le settimane 1-2 condividono gli stessi episodi (1-5), così come 3-4 (6-12) e 5-6 (13-19). Completare gli episodi di week 1 sblocca sia week 2 che week 3.

### Meditazione Guidata
```
[Automatico al primo accesso del giorno] OPPURE [Pulsante "🧘 Fai la pratica di respiro" in home page]
  → Popup fase SETUP: scegli durata (1/2/3/5 min) + "Salta per oggi"
  → Fase MEDITAZIONE: timer countdown + respiro animato (4s ciclo) + audio opzionale
    → Pulsante ✕ in alto a destra per tornare al setup
    → Audio: 🌊 Natura / 🍥 Naruto / 🔇 Muto
  → Al completamento timer: bottone "Continua 🌅" → salva last_meditation_completed = oggi
```
**Context globale:** `useMeditation()` da `MeditationContext` espone `openMeditation()` per aprire il popup da qualsiasi componente.

### Maestro AI (`lib/maestro-ai.ts`)
```
User message → /api/chat
  → buildUserContext(): carica profilo + episodi completati + riflessioni
  → System prompt (~200 righe): ruolo Maestro, progressione 9 fasi,
    regole anti-spoiler, sicurezza per contenuti a rischio
  → Claude Sonnet (anthropic SDK)
  → Risposta personalizzata in chat
```
**Safety:** Intercetta keyword di rischio (suicidio, autolesionismo) e risponde con protocollo specifico prima di continuare.

### Bot Telegram
```
Messaggio Telegram → POST /api/telegram (webhook)
  → Cerca telegram_id in profiles
  → Se utente trovato: buildUserContext + Claude
  → Se non trovato: SYSTEM_PROMPT_NOT_REGISTERED
  → Risponde direttamente su Telegram API
```

---

## Pattern e Convenzioni

### Fetch dati Notion
Tutti i dati di contenuto passano per le API routes (BFF pattern). Il client non chiama mai Notion direttamente:
```typescript
// ✅ Corretto
const response = await fetch(`/api/settimana?id=${weekId}`);
const data = await response.json();
const mantra = data?.page?.properties?.Mantra?.rich_text?.[0]?.plain_text;

// ❌ Mai direttamente dal client
import { Client } from '@notionhq/client';
```

### Supabase client
Un singolo client pubblico in `lib/supabase.ts`. Per operazioni server-side privilegiate (come in `maestro-ai.ts`) si usa il `SUPABASE_SERVICE_ROLE_KEY`.

### Parsing testo Notion
I ritorni a capo nel CMS Notion vengono scritti come `<br>` → convertire sempre:
```typescript
const text = (properties.Mantra?.rich_text?.[0]?.plain_text || '').replace(/<br>/g, '\n');
```

### Autenticazione nelle page
Ogni pagina protetta fa il check manualmente (non c'è middleware):
```typescript
const { data: { session } } = await supabase.auth.getSession();
if (!session) { router.push('/login'); return; }
```

### Routing BottomTabBar
Il `BottomTabBar` si nasconde automaticamente su `/login`, `/register`, `/onboarding`. Aggiungere nuove rotte protette nella `skipPaths` del componente.

---

## Componente MeditationPopup — Note Importanti

Il popup ha **due fasi**:
1. **`setup`** — selezione durata (1/2/3/5 min) + pulsante "Salta per oggi" (non salva nulla)
2. **`meditating`** — timer attivo + respiro animato (scala 100%↔75% ogni 4s) + audio

**Props:**
- `manualOpen: boolean` — se true apre il popup (gestito da `GlobalMeditationWrapper`)
- `onClose?: () => void` — callback alla chiusura
- `mantra`, `weekName`, `userId`

**Apertura:** Il check giornaliero (non mostrare se già fatto oggi) avviene nell'`useEffect` con dep `[userId]`. L'apertura manuale è via `manualOpen` prop.

**Per aprire il popup da qualsiasi componente:**
```typescript
import { useMeditation } from '@/components/MeditationContext';
const { openMeditation } = useMeditation();
// ...
<button onClick={openMeditation}>🧘 Fai la pratica di respiro</button>
```

> ⚠️ Il container del popup usa `pb-24` e `overflow-y-auto` per evitare che la BottomTabBar copra il pulsante "Salta per oggi".

---

## Pagina Settimana (`/settimana/[id]`) — Note Importanti

### Ordine sezioni
1. **Header** — titolo, tema, badge "✅ Completata" (se week finita), bottone "Vai agli episodi ↓"
2. **📖 Approfondimento** — `<details>` collassabile con contenuto Notion (chiuso di default)
3. **📺 Episodi** — griglia 2 col con `EpisodeCard`
4. **Bottone "Passa alla settimana successiva"** — visibile solo se week completata e prossima disponibile

### Logica completamento settimana
```typescript
// checkCompletion() viene chiamata:
// - al caricamento (triggerPopup: false) → solo bottone, no popup
// - dopo ogni episodio completato (triggerPopup: true) → popup + bottone
const allDone = weekEps.every(ep => completedEpisodes.includes(ep));
```

### Popup vs bottone fisso
- **Popup**: appare solo quando si completa l'ultimo episodio **in questa sessione**
- **Bottone fisso**: sempre visibile a fondo pagina se week è completa (anche sessioni successive)
- **Beta-lock**: se la prossima week è > 4, mostra messaggio "stay tuned" invece del bottone navigazione

---

## Cose da Fare / Note di Sviluppo

- [ ] La cartella `/docs` è vuota — popolarla con documentazione dettagliata
- [ ] Il `middleware.ts` è disabilitato (`.backup`) — l'auth è solo client-side
- [ ] Il mapping `WEEK_IDS` è duplicato in più file (`GlobalMeditationWrapper`, `app/page.tsx`, `app/settimane/page.tsx`) — considerare una costante centralizzata in `/lib/constants.ts`
- [ ] Week 5-6 bloccate in Beta — da sbloccare rimuovendo la restrizione in `weekUnlockLogic.ts`
- [ ] Nessun test automatico — da aggiungere
- [ ] Il bot Telegram richiede configurazione webhook separata
- [ ] **Future (non MVP):** Sezione "Le mie riflessioni" in dashboard + pagina dedicata per rivedere e commentare le riflessioni salvate in `episode_reflections`

---

## Comandi Utili

```bash
npm run dev       # Avvia dev server su http://localhost:3000
npm run build     # Build produzione
npm run lint      # Linting ESLint
```
