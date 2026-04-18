import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { tenant_id, name, frequency, template, enabled } =
      await request.json();

    // Verify subscription
    const { data: subscription } = await supabase
      .from('advanced_analytics_subscriptions')
      .select('*')
      .eq('tenant_id', tenant_id)
      .eq('status', 'active')
      .single();

    if (!subscription) {
      return NextResponse.json(
        { error: 'Advanced analytics not enabled for this tenant' },
        { status: 403 }
      );
    }

    const now = new Date();
    const nextScheduled = new Date(now);

    switch (frequency) {
      case 'daily':
        nextScheduled.setDate(nextScheduled.getDate() + 1);
        break;
      case 'weekly':
        nextScheduled.setDate(nextScheduled.getDate() + 7);
        break;
      case 'monthly':
        nextScheduled.setMonth(nextScheduled.getMonth() + 1);
        break;
    }

    const { data: report, error } = await supabase
      .from('automated_reports')
      .insert({
        tenant_id,
        name,
        frequency,
        template,
        enabled,
        next_scheduled: nextScheduled.toISOString(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    console.error('Report creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create report' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const tenantId = request.nextUrl.searchParams.get('tenant_id');

    if (!tenantId) {
      return NextResponse.json(
        { error: 'tenant_id is required' },
        { status: 400 }
      );
    }

    const { data: reports, error } = await supabase
      .from('automated_reports')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(reports);
  } catch (error) {
    console.error('Report fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reports' },
      { status: 500 }
    );
  }
}
