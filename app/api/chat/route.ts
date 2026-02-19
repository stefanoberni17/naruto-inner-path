import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ⚠️ SAFETY KEYWORDS per detection contenuti a rischio
const SAFETY_KEYWORDS = [
  'suicidio', 'suicidarmi', 'voglio morire', 'uccidermi', 'togliermi la vita',
  'farla finita', 'ammazzarmi', 'non voglio più vivere',
  'autolesionismo', 'tagliarmi', 'farmi del male',
  'uccidere', 'ammazzare', 'fare del male a', 'voglio uccidere',
  'violenza', 'picchiare', 'aggredire'
];

// ⚠️ Invia alert email
async function sendSafetyAlert(userId: string, userName: string, messageContent: string) {
  try {
    // TODO: Implementa invio email con Resend o servizio email
    // Per ora solo log
    console.error('🚨 SAFETY ALERT:', {
      userId,
      userName,
      messagePreview: messageContent.substring(0, 100),
      timestamp: new Date().toISOString(),
    });

    // Invia email a foryou.innerpath@gmail.com
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'alerts@narutoinn erpath.app',
        to: 'foryou.innerpath@gmail.com',
        subject: '🚨 Safety Alert - Naruto Inner Path',
        html: `
          <h2>⚠️ Contenuto a Rischio Rilevato</h2>
          <p><strong>User ID:</strong> ${userId}</p>
          <p><strong>Nome:</strong> ${userName}</p>
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          <p><strong>Messaggio (primi 200 caratteri):</strong></p>
          <blockquote>${messageContent.substring(0, 200)}...</blockquote>
          <p>Accedi a Supabase per vedere i dettagli completi.</p>
        `,
      }),
    });
  } catch (error) {
    console.error('Errore invio alert:', error);
  }
}

// Controlla se il messaggio contiene keywords a rischio
function checkSafetyKeywords(text: string): boolean {
  const lowerText = text.toLowerCase();
  return SAFETY_KEYWORDS.some(keyword => lowerText.includes(keyword));
}

export async function POST(request: NextRequest) {
  try {
    const { messages, userId } = await request.json();

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: 'Messages required' }, { status: 400 });
    }

    // ✅ Carica profilo utente
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('name, current_week, age, goals, passions, dream, current_situation')
      .eq('user_id', userId)
      .single();

    // ✅ Carica episodi completati
    const { data: completedEpisodes } = await supabaseAdmin
      .from('user_episode_progress')
      .select('episode_number, week_number')
      .eq('user_id', userId)
      .eq('completed', true)
      .order('episode_number', { ascending: true });

    // ✅ Carica riflessioni utente (con domande)
    const { data: reflections } = await supabaseAdmin
      .from('episode_reflections')
      .select('episode_number, reflection_question, reflection_text, created_at')
      .eq('user_id', userId)
      .order('episode_number', { ascending: true });

    // ⚠️ Check safety nel messaggio utente
    const lastUserMessage = messages[messages.length - 1];
    if (lastUserMessage.role === 'user' && checkSafetyKeywords(lastUserMessage.content)) {
      await sendSafetyAlert(userId, profile?.name || 'Unknown', lastUserMessage.content);
    }

    // 📊 Costruisci context personalizzato
    const userContext = `
# CONTESTO UTENTE

**Nome:** ${profile?.name || 'Utente'}
**Età:** ${profile?.age || 'Non specificata'}
**Settimana corrente:** ${profile?.current_week || 1}

## Situazione e obiettivi
${profile?.current_situation ? `**Situazione attuale:** ${profile.current_situation}` : ''}
${profile?.goals ? `**Obiettivi:** ${profile.goals}` : ''}
${profile?.passions ? `**Passioni:** ${profile.passions}` : ''}
${profile?.dream ? `**Sogno:** ${profile.dream}` : ''}

## Progresso nel percorso
**Episodi completati:** ${completedEpisodes?.length || 0}
${completedEpisodes && completedEpisodes.length > 0 
  ? `**Ultimi episodi:** ${completedEpisodes.slice(-3).map(e => `Ep.${e.episode_number}`).join(', ')}`
  : 'Nessun episodio ancora completato'}

## Riflessioni dell'utente
${reflections && reflections.length > 0
  ? reflections.map(r => `
**Episodio ${r.episode_number}**
Domanda: "${r.reflection_question}"
Risposta: "${r.reflection_text}"
`).join('\n')
  : 'Nessuna riflessione ancora scritta'}

---

**IMPORTANTE:** Usa queste informazioni per dare risposte personalizzate e profonde. Le riflessioni dell'utente sono la chiave per capire il suo viaggio interiore.
`;

    // 🎯 System prompt aggiornato
    const systemPrompt = `Sei il Maestro AI di Naruto Inner Path, una guida spirituale che accompagna le persone in un percorso di crescita personale attraverso gli insegnamenti di Naruto.

# IL TUO RUOLO

Non sei un coach che dice cosa fare. Sei uno specchio che aiuta la persona a **vedere se stessa** più chiaramente.

## Principi fondamentali della tua guida:

1. **NON PRESCRIVERE MAI**
   - ❌ Non dire: "Dovresti fare X"
   - ❌ Non consigliare: "Ti consiglio di Y"
   - ❌ Non suggerire azioni specifiche
   - ✅ Fai domande: "Cosa senti quando...?"
   - ✅ Riporta alla persona: "Se ascolti il tuo corpo in questo momento, cosa ti dice?"
   - ✅ Rifletti: "Sembra che tu stia sentendo..."

2. **RIPORTA LA PERSONA A SÉ STESSA**
   - La risposta è sempre dentro di loro
   - Il tuo compito è aiutarli a sentire, non a pensare
   - Usa domande che portano all'ascolto interiore
   - Chiedi cosa sente il corpo, non cosa pensa la mente

3. **LINGUAGGIO SOMATICO**
   - "Cosa senti nel corpo quando pensi a questo?"
   - "Dove senti questa emozione nel corpo?"
   - "Se il tuo corpo potesse parlare ora, cosa direbbe?"
   - "Prova a portare attenzione al respiro... cosa emerge?"

4. **USA IL PERCORSO NARUTO**
   - Collega le loro esperienze ai personaggi e situazioni di Naruto
   - Ogni nemico/avversità in Naruto è un aspetto interno
   - Usa le metafore dell'anime quando appropriate
   - Riferisciti agli episodi che hanno completato e alle loro riflessioni

# ⚠️ SAFETY PROTOCOL - SITUAZIONI A RISCHIO

Se l'utente menziona:
- Pensieri suicidari
- Autolesionismo
- Voglia di fare del male a sé o altri
- Violenza grave

**LA TUA RISPOSTA DEVE:**
1. Essere **empatica** ma **ferma**
2. Riconoscere il dolore senza minimizzare
3. Suggerire **delicatamente ma chiaramente** di parlare con:
   - Uno psicologo/terapeuta
   - Una persona vicina di fiducia
   - Telefono amico (se in Italia): 02 2327 2327
4. NON fare diagnosi
5. NON sostituirti a un professionista

**Esempio di risposta safety:**
"Sento che stai attraversando un momento molto difficile, e apprezzo che tu abbia il coraggio di condividerlo. Quello che stai vivendo merita un sostegno più profondo di quello che posso darti io. Ti invito davvero a parlarne con uno psicologo o una persona cara di cui ti fidi. Nel frattempo, sono qui per ascoltarti."

# STILE COMUNICAZIONE

- **Tono:** Caldo, umano, presenza discreta
- **Lunghezza:** Risposte brevi (3-5 frasi max), a meno che richiesto diversamente
- **Emoji:** Usa con moderazione e solo quando appropriato
- **Formato:** Prose naturale, NO liste/bullet points a meno che esplicitamente richiesti

# WEEK 1-2: La ferita del rifiuto
Focus: Bisogno di essere visti, solitudine, riconoscimento
Pratiche: Osservazione senza giudizio

# WEEK 3-4: Presenza e ascolto  
Focus: Radicamento, corpo, qui e ora
Pratiche: Respiro, presenza fisica

# WEEK 5-6: Valore e appartenenza (🔒 Non disponibile in beta)
Focus: Valore personale, relazioni autentiche

${userContext}

**Ricorda:** La persona ha già tutto dentro. Tu sei solo uno specchio che l'aiuta a vederlo.`;

    // 🤖 Chiamata a Claude
    const completion = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      system: systemPrompt,
      messages: messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
    });

    const responseText = completion.content
      .filter((block: any) => block.type === 'text')
      .map((block: any) => block.text)
      .join('\n');

    return NextResponse.json({ 
      response: responseText,
      usage: completion.usage 
    });

  } catch (error: any) {
    console.error('Errore chat API:', error);
    return NextResponse.json(
      { error: 'Errore nel processing', details: error.message },
      { status: 500 }
    );
  }
}