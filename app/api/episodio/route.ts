import { NextRequest, NextResponse } from 'next/server';
import { Client } from '@notionhq/client';
import { createClient } from '@supabase/supabase-js';
import { getEpisodePageId, getWeekFromEpisode, isEpisodeInMVP } from '@/lib/episodeMapping';

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

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
      return NextResponse.json({ error: 'Episodio fuori scope MVP (1-19)', locked: true }, { status: 400 });
    }

    if (userId && episodeNumber > 1) {
      const { data: previousProgress } = await supabaseAdmin
        .from('user_episode_progress')
        .select('completed')
        .eq('user_id', userId)
        .eq('episode_number', episodeNumber - 1)
        .single();

      if (!previousProgress?.completed) {
        return NextResponse.json({
          locked: true,
          message: `Completa l'episodio ${episodeNumber - 1} per sbloccare questo`,
          episodeNumber,
        });
      }
    }

    let isCompleted = false;
    if (userId) {
      const { data: currentProgress } = await supabaseAdmin
        .from('user_episode_progress')
        .select('completed')
        .eq('user_id', userId)
        .eq('episode_number', episodeNumber)
        .single();
      isCompleted = currentProgress?.completed || false;
    }

    const pageId = getEpisodePageId(episodeNumber);
    if (!pageId) {
      return NextResponse.json({ error: 'ID Notion non configurato', episodeNumber }, { status: 404 });
    }

    const page = await notion.pages.retrieve({ page_id: pageId });
    const properties = (page as any).properties;

    const episodeData = {
      number: episodeNumber,
      title: properties['Titolo episodio']?.rich_text?.[0]?.plain_text ||
             properties.Episodio?.title?.[0]?.plain_text || `Episodio ${episodeNumber}`,
      miniLesson: properties['Mini-lezione breve']?.rich_text?.[0]?.plain_text || '',
      reflectionQuestion: properties['Domanda riflessiva']?.rich_text?.[0]?.plain_text || '',
      mainTheme: properties['Tema principale']?.rich_text?.[0]?.plain_text || '',
      concepts: properties['Concetti collegati']?.rich_text?.[0]?.plain_text || '',
      weekNumber: getWeekFromEpisode(episodeNumber),
      locked: false,
      completed: isCompleted,
    };

    return NextResponse.json({ episode: episodeData, locked: false });

  } catch (error: any) {
    console.error('Errore API episodio:', error);
    return NextResponse.json({ error: 'Errore nel caricamento episodio', details: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { episodeNumber, userId } = await request.json();

    if (!userId || !episodeNumber) {
      return NextResponse.json({ error: 'userId e episodeNumber richiesti' }, { status: 400 });
    }

    if (!isEpisodeInMVP(episodeNumber)) {
      return NextResponse.json({ error: 'Episodio fuori scope MVP' }, { status: 400 });
    }

    const weekNumber = getWeekFromEpisode(episodeNumber);

    const { data, error } = await supabaseAdmin
      .from('user_episode_progress')
      .upsert({
        user_id: userId,
        episode_number: episodeNumber,
        week_number: weekNumber,
        completed: true,
        completed_at: new Date().toISOString(),
      }, { onConflict: 'user_id,episode_number' })
      .select()
      .single();

    if (error) throw error;

    console.log(`✅ Episodio ${episodeNumber} completato per utente ${userId}`);

    return NextResponse.json({
      success: true,
      progress: data,
      nextEpisode: episodeNumber + 1,
      unlockedNext: episodeNumber < 19,
    });

  } catch (error: any) {
    console.error('Errore POST episodio:', error);
    return NextResponse.json({ error: 'Errore nel salvataggio progresso', details: error.message }, { status: 500 });
  }
}