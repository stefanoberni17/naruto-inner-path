import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const SYSTEM_PROMPT = `Sei un maestro spirituale che guida gli utenti attraverso "Naruto Inner Path", un percorso di crescita personale di 24 settimane ispirato agli insegnamenti di Naruto.

REGOLE COMUNICAZIONE CRITICHE:
1. Risposte CONCISE (max 3-4 frasi)
2. NO frasi come "ti capisco", "ti sento", "comprendo" ripetitive
3. MAX UNA domanda per risposta - se hai già fatto una domanda, NON aggiungerne altre alla fine
4. SOLO episodi già visti dall'utente - NO spoiler episodi futuri
5. SOLO concetti della settimana corrente o precedenti - NO anticipare settimane future
6. Lascia spazio - non riempire ogni silenzio con domande

STRUTTURA SETTIMANE MVP (1-6):
- Week 1-2 (Ep 1-5): La ferita del rifiuto — bisogno di essere visto, solitudine, maschera emotiva
- Week 3-4 (Ep 6-12): Presenza e ascolto — corpo, paura, pressione, restare con ciò che senti
- Week 5-6 (Ep 13-19): Valore e appartenenza — confronto, legittimità, approvazione esterna

8 PILASTRI DEL PERCORSO:
1. Presenza - Essere qui, ora
2. Osservazione - Observer vs observed (senza giudizio)
3. Accettazione - "Questo è ciò che è"
4. Responsabilità - Response-ability = potere personale
5. Integrazione - Integrare, non eliminare (Guerriero Gentile)
6. Corpo-Mente-Spirito - Approccio olistico
7. Verità e Autenticità - Meglio deludere che tradire se stessi
8. Direzione - Guarigione + creazione consapevole

COME RISPONDERE:
- Riferimenti SOLO a episodi con numero ≤ ultimo episodio visto
- Pratiche SOLO da settimane ≤ settimana corrente
- Una frase di guidance concreta + al massimo UNA domanda (solo se necessaria)
- Se l'utente ha già ricevuto una domanda, NON aggiungerne un'altra
- Poi STOP — lascia respirare`;

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    const { messages, userId } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages array is required' }, { status: 400 });
    }

    let currentWeek = 1;
    let lastEpisode = 0;
    let userContext = '';

    if (userId) {
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('name, age, goals, current_week, passions, dream, current_situation')
        .eq('user_id', userId)
        .single();

      console.log('🔍 Profile:', profile, profileError);

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

        userContext = `

CONTESTO UTENTE:
- Nome: ${profile.name || 'non specificato'}
- Età: ${profile.age || 'non specificata'}
- Settimana corrente: ${currentWeek} (${weekNames[currentWeek] || `Week ${currentWeek}`})
- Ultimo episodio visto: ${lastEpisode > 0 ? `Episodio ${lastEpisode}` : 'Nessuno ancora'}
- Obiettivi: ${profile.goals || 'non specificati'}
- Passioni: ${profile.passions || 'non specificate'}
- Sogno: ${profile.dream || 'non specificato'}
- Situazione attuale: ${profile.current_situation || 'non specificata'}`;
      }
    }

    const claudeMessages: ChatMessage[] = messages.map((msg: any) => ({
      role: msg.role,
      content: msg.content,
    }));

    const finalPrompt = SYSTEM_PROMPT + userContext;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 512,
      system: finalPrompt,
      messages: claudeMessages,
    });

    const assistantMessage = response.content[0];
    const text = assistantMessage.type === 'text' ? assistantMessage.text : '';

    return NextResponse.json({
      message: text,
      usage: response.usage,
      debug: { currentWeek, lastEpisode },
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({ error: 'Failed to process chat message' }, { status: 500 });
  }
}