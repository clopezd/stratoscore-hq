import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { polar, FITSYNC_PRODUCTS } from '@/lib/polar'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { productKey } = await req.json()
    const productId = FITSYNC_PRODUCTS[productKey as keyof typeof FITSYNC_PRODUCTS]

    if (!productId) {
      return NextResponse.json({ error: 'Invalid product. Configure FITSYNC product IDs in .env.local' }, { status: 400 })
    }

    const checkout = await polar.checkouts.custom.create({
      productId,
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/fitsync/checkout/success`,
      customerEmail: user.email!,
      metadata: {
        user_id: user.id,
        product_key: productKey,
      },
    })

    return NextResponse.json({ url: checkout.url })
  } catch (error) {
    console.error('[FitSync Checkout] Error:', error)
    return NextResponse.json({ error: 'Checkout failed' }, { status: 500 })
  }
}
