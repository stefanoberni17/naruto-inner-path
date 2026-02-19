import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const SYSTEM_PROMPT = `Sei un maestro spirituale che guida gli utenti attraverso "Naruto Inner Path", un percorso di crescita personale di 24 settimane ispirato agli insegnamenti di Naruto.

Il tuo stile di comunicazione:
- Caloroso, empatico e incoraggiante
- Usa metafore e riferimenti a Naruto quando appropriato
- Fornisci guidance pratica e actionable
- Celebra i progressi e incoraggia nei momenti difficili
- Parla in italiano
- Risposte concise (max 3-4 frasi)
- MAX una domanda per risposta

Il percorso è strutturato in 4 fasi di 6 settimane ciascuna:
1. FASE 1 (Sett. 1-6): Fondamenta - Presenza, ascolto, guarigione ferite emotive
2. FASE 2 (Sett. 7-12): Consapevolezza - Emozioni, bisogni, autenticità
3. FASE 3 (Sett. 13-18): Trasformazione - Vulnerabilità, limiti, nuovi pattern
4. FASE 4 (Sett. 19-24): Integrazione - Relazioni, comunità, visione`;

async function sendTelegramMessage(chatId: number, text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN!;
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const message = body?.message;

    if (!message || !message.text) {
      return NextResponse.json({ ok: true });
    }

    const chatId = message.chat.id;
    const telegramUserId = message.from.id.toString();
    const userText = message.text;

    const { data: profile } = await supabase
      .from('profiles')
      .select('name, age, goals, passions, dream, current_situation, current_week')
      .eq('telegram_id', telegramUserId)
      .single();

    let userContext = '';
    if (profile) {
      userContext = `\n\nContesto utente:
- Nome: ${profile.name || 'non specificato'}
- Età: ${profile.age || 'non specificata'}
- Settimana corrente: ${profile.current_week || 1}
- Obiettivi: ${profile.goals || 'non specificati'}
- Passioni: ${profile.passions || 'non specificate'}
- Sogno: ${profile.dream || 'non specificato'}
- Situazione attuale: ${profile.current_situation || 'non specificata'}`;
    } else {
      userContext = `\n\nQuesto utente non è ancora registrato su Naruto Inner Path. Invitalo gentilmente a registrarsi su naruto-inner-path.vercel.app e poi a collegare il suo account Telegram dal profilo.`;
    }

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 512,
      system: SYSTEM_PROMPT + userContext,
      messages: [{ role: 'user', content: userText }],
    });

    const replyText = response.content[0].type === 'text'
      ? response.content[0].text
      : 'Mi dispiace, non riesco a rispondere in questo momento.';

    await sendTelegramMessage(chatId, replyText);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Telegram webhook error:', error);
    return NextResponse.json({ ok: true });
  }
}