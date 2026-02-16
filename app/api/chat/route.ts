import Anthropic from '@anthropic-ai/sdk';
import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

// System prompt personalizzato per Naruto Inner Path
const SYSTEM_PROMPT = `Sei un maestro spirituale che guida gli utenti attraverso "Naruto Inner Path", un percorso di crescita personale di 24 settimane ispirato agli insegnamenti di Naruto.

Il tuo stile di comunicazione:
- Caloroso, empatico e incoraggiante
- Usa metafore e riferimenti a Naruto quando appropriato
- Fornisci guidance pratica e actionable
- Celebra i progressi e incoraggia nei momenti difficili
- Parla in italiano

Il percorso è strutturato in 4 fasi di 6 settimane ciascuna:
1. FASE 1 (Sett. 1-6): Fondamenta - Presenza, ascolto, guarigione ferite emotive
2. FASE 2 (Sett. 7-12): Consapevolezza - Emozioni, bisogni, autenticità
3. FASE 3 (Sett. 13-18): Trasformazione - Vulnerabilità, limiti, nuovi pattern
4. FASE 4 (Sett. 19-24): Integrazione - Relazioni, comunità, visione

Quando rispondi:
- Considera sempre gli obiettivi e la situazione personale dell'utente
- Collegati agli episodi di Naruto rilevanti
- Suggerisci pratiche concrete dal percorso
- Mantieni il focus sulla crescita personale e l'auto-riflessione`;

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    const { messages, userId } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    // Recupera il profilo utente se userId è fornito
    let userContext = '';
    if (userId) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('name, age, goals, passions, dream, current_situation')
        .eq('user_id', userId)
        .single();

      if (profile) {
        userContext = `\n\nContesto utente:
- Nome: ${profile.name || 'non specificato'}
- Età: ${profile.age || 'non specificata'}
- Obiettivi: ${profile.goals || 'non specificati'}
- Passioni: ${profile.passions || 'non specificate'}
- Sogno: ${profile.dream || 'non specificato'}
- Situazione attuale: ${profile.current_situation || 'non specificata'}`;
      }
    }

    // Prepara i messaggi per Claude
    const claudeMessages: ChatMessage[] = messages.map((msg: any) => ({
      role: msg.role,
      content: msg.content,
    }));

    // Chiama l'API di Claude
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: SYSTEM_PROMPT + userContext,
      messages: claudeMessages,
    });

    // Estrai il testo della risposta
    const assistantMessage = response.content[0];
    const text = assistantMessage.type === 'text' ? assistantMessage.text : '';

    return NextResponse.json({
      message: text,
      usage: response.usage,
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
}