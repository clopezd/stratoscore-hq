import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function POST(request: NextRequest) {
  try {
    const { tenant_id, user_id, query, data_source } = await request.json();

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

    // Store analysis request
    const { data: analysisRecord } = await supabase
      .from('analysis_requests')
      .insert({
        tenant_id,
        user_id,
        query,
        data_source,
        status: 'pending',
      })
      .select()
      .single();

    // Call Claude for analysis
    const message = await anthropic.messages.create({
      model: 'claude-opus-4-7',
      max_tokens: 1024,
      system: `You are a business intelligence analyst. Analyze the following query and provide:
1. A comprehensive analysis
2. 3-5 key insights
3. 2-3 actionable recommendations

Format your response as JSON with keys: analysis, insights (array), recommendations (array)`,
      messages: [
        {
          role: 'user',
          content: query,
        },
      ],
    });

    const responseText =
      message.content[0].type === 'text' ? message.content[0].text : '';

    let parsedResponse = {
      analysis: responseText,
      insights: [],
      recommendations: [],
    };

    try {
      parsedResponse = JSON.parse(responseText);
    } catch (e) {
      // If JSON parsing fails, use the raw text as analysis
      parsedResponse = {
        analysis: responseText,
        insights: [],
        recommendations: [],
      };
    }

    // Update analysis record
    await supabase
      .from('analysis_requests')
      .update({
        status: 'completed',
        analysis: parsedResponse.analysis,
      })
      .eq('id', analysisRecord.id);

    return NextResponse.json({
      query,
      analysis: parsedResponse.analysis,
      insights: parsedResponse.insights || [],
      recommendations: parsedResponse.recommendations || [],
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to perform analysis' },
      { status: 500 }
    );
  }
}
