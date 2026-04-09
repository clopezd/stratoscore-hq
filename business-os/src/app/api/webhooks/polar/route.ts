import { NextRequest, NextResponse } from 'next/server'
import { validateEvent, WebhookVerificationError } from '@polar-sh/sdk/webhooks'
import { POLAR_WEBHOOK_SECRET, getTierFromProductId } from '@/lib/polar'
import { createServiceClient } from '@/lib/supabase/service'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const headers = Object.fromEntries(request.headers.entries())

  let event: any
  try {
    event = validateEvent(body, headers, POLAR_WEBHOOK_SECRET)
  } catch (error) {
    if (error instanceof WebhookVerificationError) {
      console.error('[Polar Webhook] Invalid signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 })
    }
    throw error
  }

  const supabase = createServiceClient()

  try {
    switch (event.type) {
      case 'subscription.active':
        await handleSubscriptionActive(supabase, event.data)
        break

      case 'subscription.canceled':
      case 'subscription.revoked':
        await handleSubscriptionCanceled(supabase, event.data)
        break

      case 'checkout.updated':
        if (event.data.status === 'succeeded') {
          console.log(`[Polar Webhook] Checkout succeeded: ${event.data.id}`)
        }
        break

      default:
        console.log(`[Polar Webhook] Unhandled: ${event.type}`)
    }
  } catch (error) {
    console.error(`[Polar Webhook] Error handling ${event.type}:`, error)
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}

async function handleSubscriptionActive(supabase: any, subscription: any) {
  const userId = subscription.metadata?.user_id
  if (!userId) {
    console.error('[Polar Webhook] subscription.active without user_id in metadata')
    return
  }

  // Idempotency check
  const { data: existing } = await supabase
    .from('fs_subscriptions')
    .select('current_period_end')
    .eq('polar_subscription_id', subscription.id)
    .single()

  if (existing?.current_period_end === subscription.current_period_end) {
    console.log('[Polar Webhook] Duplicate subscription.active, skipping')
    return
  }

  const tier = getTierFromProductId(subscription.product_id || '')

  // Upsert subscription
  await supabase.from('fs_subscriptions').upsert(
    {
      user_id: userId,
      tier,
      status: 'active',
      polar_subscription_id: subscription.id,
      polar_customer_id: subscription.customer_id,
      polar_product_id: subscription.product_id,
      price_cents: subscription.amount,
      billing_interval: subscription.recurring_interval,
      current_period_end: subscription.current_period_end,
      cancel_at_period_end: false,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' },
  )

  // Update user profile tier
  await supabase
    .from('fs_user_profiles')
    .update({ tier })
    .eq('user_id', userId)

  console.log(`[Polar Webhook] Subscription active: ${userId} → ${tier}`)
}

async function handleSubscriptionCanceled(supabase: any, subscription: any) {
  const userId = subscription.metadata?.user_id
  if (!userId) return

  await supabase
    .from('fs_subscriptions')
    .update({
      status: 'canceled',
      cancel_at_period_end: true,
      updated_at: new Date().toISOString(),
    })
    .eq('polar_subscription_id', subscription.id)

  // Don't revoke immediately — they paid until period end
  // A cron job should check current_period_end and downgrade expired subs
  console.log(`[Polar Webhook] Subscription canceled: ${userId}`)
}
