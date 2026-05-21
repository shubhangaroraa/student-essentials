import { NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function POST(request: Request) {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2026-04-22.dahlia',
    })

    const { items, customerEmail, deliveryDetails } = await request.json()

    const lineItems = items.map((item: { name: string; price: number; variant: string; quantity: number }) => ({
      price_data: {
        currency: 'gbp',
        product_data: {
          name: item.name,
          description: item.variant,
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity || 1,
    }))

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      customer_email: customerEmail,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout`,
      metadata: {
        delivery_address: JSON.stringify(deliveryDetails),
        customer_email: customerEmail,
      },
    })

    // Send confirmation email
    if (customerEmail && session.url) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: customerEmail,
            subject: `Order received — StudentEssentials 🎉`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: #1a3a2a; padding: 32px; border-radius: 16px; text-align: center; margin-bottom: 24px;">
                  <h1 style="color: #fff; margin: 0;">Pack Smart. Land Ready. ✅</h1>
                </div>
                <div style="background: #f5f0e8; padding: 32px; border-radius: 16px;">
                  <h2 style="color: #1a3a2a;">Your order is being processed!</h2>
                  <p style="color: #6b7a72; line-height: 1.7;">Thank you for ordering with StudentEssentials. We are processing your payment and will confirm your order shortly.</p>
                  <div style="text-align: center; margin: 24px 0;">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="background: #2e7d52; color: #fff; padding: 14px 32px; border-radius: 40px; text-decoration: none; font-weight: bold;">View dashboard →</a>
                  </div>
                  <p style="color: #6b7a72; font-size: 13px;">Questions? Email <a href="mailto:care@student-essentials.com" style="color: #2e7d52;">care@student-essentials.com</a></p>
                </div>
              </div>
            `,
          }),
        })
      } catch (emailError) {
        console.error('Email error:', emailError)
      }
    }

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Stripe error:', error)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}