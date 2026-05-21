import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-04-22.dahlia',
  })

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

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
      const orderRef = 'SE-' + new Date().getFullYear() + '-' + Math.floor(10000 + Math.random() * 90000)

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
        // Send confirmation email
try {
  const customerEmail = session.customer_email
  if (customerEmail) {
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: customerEmail,
        subject: `Order confirmed — ${orderRef} 🎉`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f5f0e8; padding: 40px 20px;">
            <div style="background: #1a3a2a; padding: 32px; border-radius: 16px; text-align: center; margin-bottom: 24px;">
              <h1 style="color: #fff; font-size: 28px; margin: 0 0 8px;">Pack Smart. Land Ready. ✅</h1>
              <p style="color: rgba(255,255,255,0.6); margin: 0;">Your StudentEssentials order is confirmed</p>
            </div>
            <div style="background: #fff; padding: 32px; border-radius: 16px; margin-bottom: 24px;">
              <h2 style="color: #1a3a2a; margin: 0 0 16px;">Order confirmed!</h2>
              <p style="color: #6b7a72;">Your order reference is:</p>
              <div style="background: #e0f0e8; padding: 16px; border-radius: 10px; text-align: center; margin: 16px 0;">
                <span style="font-family: monospace; font-size: 20px; font-weight: bold; color: #1a3a2a;">${orderRef}</span>
              </div>
              <p style="color: #6b7a72; line-height: 1.7;">We are processing your order and will keep you updated every step of the way. Everything will be ready and waiting when you arrive in the UK.</p>
            </div>
            <div style="display: grid; gap: 12px; margin-bottom: 24px;">
              <div style="background: #fff; padding: 20px; border-radius: 12px; display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 24px;">📦</span>
                <div>
                  <div style="font-weight: bold; color: #1a3a2a;">Processing your order</div>
                  <div style="color: #6b7a72; font-size: 14px;">We will confirm delivery details shortly</div>
                </div>
              </div>
              <div style="background: #fff; padding: 20px; border-radius: 12px; display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 24px;">📱</span>
                <div>
                  <div style="font-weight: bold; color: #1a3a2a;">WhatsApp updates coming</div>
                  <div style="color: #6b7a72; font-size: 14px;">We will message you on WhatsApp with tracking info</div>
                </div>
              </div>
            </div>
            <div style="text-align: center; margin-bottom: 24px;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="background: #2e7d52; color: #fff; padding: 14px 32px; border-radius: 40px; text-decoration: none; font-weight: bold; display: inline-block;">View your dashboard →</a>
            </div>
            <div style="text-align: center; color: #6b7a72; font-size: 12px;">
              <p>Student Solutions Pvt Limited · 3 Fulham Park Gardens, London SW6 4JX</p>
              <p>Questions? Email us at <a href="mailto:care@student-essentials.com" style="color: #2e7d52;">care@student-essentials.com</a></p>
            </div>
          </div>
        `,
      }),
    })
  }
} catch (emailError) {
  console.error('Email send error:', emailError)
}
      }
    } catch (error) {
      console.error('Error saving order:', error)
    }
  }
// Send confirmation email immediately
if (customerEmail) {
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
              <p style="color: #6b7a72;">Questions? Email <a href="mailto:care@student-essentials.com" style="color: #2e7d52;">care@student-essentials.com</a></p>
            </div>
          </div>
        `,
      }),
    })
  } catch (e) {
    console.error('Email error:', e)
  }
}
  return NextResponse.json({ received: true })
}