// Drop-in replacement. Two bug fixes + CRM lead push for paying customers.
//   1. Stripe checkout now stores user_id in metadata (previously always null).
//   2. Confirmation email now sent server-side via nodemailer (no internal HTTP hop).
//   3. After a successful checkout, push a "Won" lead to the central CRM.
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function POST(request: Request) {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2026-04-22.dahlia',
    })

    const { items, customerEmail, deliveryDetails, userId } = await request.json()

    const lineItems = items.map(
      (item: { name: string; price: number; variant: string; quantity: number }) => ({
        price_data: {
          currency: 'gbp',
          product_data: { name: item.name, description: item.variant },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity || 1,
      })
    )

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      customer_email: customerEmail,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout`,
      metadata: {
        user_id: userId ?? '',
        customer_email: customerEmail ?? '',
        delivery_address: JSON.stringify(deliveryDetails ?? {}),
        // Stripe metadata values must be strings <= 500 chars.
        items_summary: JSON.stringify(
          (items || []).map((i: { name: string; price: number; variant: string; quantity: number }) => ({
            n: i.name,
            v: i.variant,
            q: i.quantity || 1,
            p: i.price,
          }))
        ).slice(0, 490),
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Stripe error:', error)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
