import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

// GET - Carica pratiche della settimana
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const weekNumber = parseInt(searchParams.get('weekNumber') || '1');

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('weekly_practices')
      .select('*')
      .eq('user_id', userId)
      .eq('week_number', weekNumber)
      .order('practice_number', { ascending: true });

    if (error) throw error;

    // Se non esistono, crea 3 pratiche vuote
    if (!data || data.length === 0) {
      const practices = await Promise.all([1, 2, 3].map(async (num) => {
        const { data: newPractice } = await supabaseAdmin
          .from('weekly_practices')
          .insert({
            user_id: userId,
            week_number: weekNumber,
            practice_number: num,
          })
          .select()
          .single();
        return newPractice;
      }));

      return NextResponse.json({ practices });
    }

    return NextResponse.json({ practices: data });
  } catch (error: any) {
    console.error('Errore GET practices:', error);
    return NextResponse.json(
      { error: 'Errore nel caricamento', details: error.message },
      { status: 500 }
    );
  }
}

// POST - Aggiorna completamento giorno pratica
export async function POST(request: NextRequest) {
  try {
    const { userId, weekNumber, practiceNumber, day, completed } = await request.json();

    if (!userId || !weekNumber || !practiceNumber || !day) {
      return NextResponse.json(
        { error: 'userId, weekNumber, practiceNumber e day richiesti' },
        { status: 400 }
      );
    }

    // Carica pratica esistente
    const { data: existing } = await supabaseAdmin
      .from('weekly_practices')
      .select('completed_days')
      .eq('user_id', userId)
      .eq('week_number', weekNumber)
      .eq('practice_number', practiceNumber)
      .single();

    const currentDays = existing?.completed_days || {
      mon: false,
      tue: false,
      wed: false,
      thu: false,
      fri: false,
      sat: false,
      sun: false,
    };

    // Aggiorna il giorno specifico
    currentDays[day as DayKey] = completed;

    const { data, error } = await supabaseAdmin
      .from('weekly_practices')
      .update({
        completed_days: currentDays,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('week_number', weekNumber)
      .eq('practice_number', practiceNumber)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, practice: data });
  } catch (error: any) {
    console.error('Errore POST practices:', error);
    return NextResponse.json(
      { error: 'Errore nel salvataggio', details: error.message },
      { status: 500 }
    );
  }
}