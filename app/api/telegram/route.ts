import { NextRequest, NextResponse } from 'next/server';
import {
  supabaseAdmin,
  buildUserContext,
  callClaude,
  checkSafetyKeywords,
  SYSTEM_PROMPT,
  SYSTEM_PROMPT_NOT_REGISTERED
} from '@/lib/maestro-ai';

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

    /* disabilitato per ora
    if (checkSafetyKeywords(userText)) {
      await sendSafetyAlert(telegramUserId, '', userText);
    }
    */

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('user_id')
      .eq('telegram_id', telegramUserId)
      .single();

    let systemPrompt = '';

    if (profile?.user_id) {
      const userContext = await buildUserContext(profile.user_id);
      systemPrompt = SYSTEM_PROMPT + '\n\n' + userContext;
    } else {
      systemPrompt = SYSTEM_PROMPT_NOT_REGISTERED;
    }

    const { text } = await callClaude(
      systemPrompt,
      [{ role: 'user', content: userText }],
      1500
    );

    await sendTelegramMessage(chatId, text);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Telegram webhook error:', error);
    return NextResponse.json({ ok: true });
  }
}