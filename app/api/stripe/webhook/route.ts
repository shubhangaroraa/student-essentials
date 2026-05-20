import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil',
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error) {
    console.error('Webhook signature error:', error)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    try {
      // Generate order reference
      const orderRef = 'SE-' + new Date().getFullYear() + '-' + Math.floor(10000 + Math.random() * 90000)

      // Save order to Supabase
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          reference: orderRef,
          user_id: session.metadata?.user_id || null,
          status: 'confirmed',
          total_gbp: (session.amount_total || 0) / 100,
          stripe_session_id: session.id,
          delivery_address: session.metadata?.delivery_address
            ? JSON.parse(session.metadata.delivery_address)
            : null,
        })
        .select()
        .single()

      if (orderError) {
        console.error('Order save error:', orderError)
      } else {
        console.log('Order saved:', order.reference)
      }
    } catch (error) {
      console.error('Error saving order:', error)
    }
  }

  return NextResponse.json({ received: true })
}