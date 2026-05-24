// Bug fixes + CRM push.
//   1. Order rows now carry user_id from session.metadata.
//   2. Order line items persist as `items` jsonb column.
//   3. Confirmation email sent via nodemailer.
//   4. Push a "Won" lead into the CRM.
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
})

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
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (error) {
    console.error('Webhook signature error:', error)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const orderRef = 'SE-' + new Date().getFullYear() + '-' + Math.floor(10000 + Math.random() * 90000)

    const itemsSummary = session.metadata?.items_summary
      ? JSON.parse(session.metadata.items_summary)
      : []

    const serviceNames = itemsSummary.map((i: { name: string }) => i.name).join(', ') || 'Order'

    // ── Save order to Supabase ──
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        reference: orderRef,
        user_id: session.metadata?.user_id || null,
        customer_email: session.customer_email || null,
        status: 'confirmed',
        total_gbp: (session.amount_total || 0) / 100,
        stripe_session_id: session.id,
        delivery_address: session.metadata?.delivery_address
          ? JSON.parse(session.metadata.delivery_address)
          : null,
        items: itemsSummary,
      })
      .select()
      .single()

    if (orderError) {
      console.error('Order save error:', orderError)
    } else {
      console.log('Order saved:', order?.reference)
    }

    // ── Update CRM lead to Won if user exists ──
    if (session.metadata?.user_id) {
      await supabase
        .from('crm_leads')
        .update({ stage: 'won', updated_at: new Date().toISOString() })
        .eq('user_id', session.metadata.user_id)
        .in('stage', ['new', 'contacted', 'qualified', 'proposal'])
        .order('created_at', { ascending: false })
        .limit(1)

      // Update student status to active customer
      await supabase
        .from('crm_students')
        .update({ status: 'active' })
        .eq('user_id', session.metadata.user_id)
    }

    // ── Confirmation email ──
    const customerEmail = session.customer_email
    if (customerEmail) {
      try {
        await transporter.sendMail({
          from: `"StudentEssentials" <${process.env.GMAIL_USER}>`,
          to: customerEmail,
          subject: `Order confirmed — ${orderRef} 🎉`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f5f0e8; padding: 40px 20px;">
              <div style="background: #1a3a2a; padding: 32px; border-radius: 16px; text-align: center; margin-bottom: 24px;">
                <h1 style="color: #fff; font-size: 28px; margin: 0 0 8px;">Pack Smart. Land Ready. ✅</h1>
                <p style="color: rgba(255,255,255,0.6); margin: 0;">Your StudentEssentials order is confirmed</p>
              </div>
              <div style="background: #fff; padding: 32px; border-radius: 16px;">
                <h2 style="color: #1a3a2a; margin: 0 0 8px;">Order ${orderRef}</h2>
                <p style="color: #6b7a72; margin: 0 0 20px;">You ordered: <strong>${serviceNames}</strong></p>
                <p style="color: #6b7a72; margin: 0 0 20px;"><strong>Total: £${((session.amount_total || 0) / 100).toFixed(2)}</strong></p>
                <p style="color: #6b7a72; line-height: 1.7;">We'll be in touch shortly with delivery details and next steps.</p>
                <p style="color: #6b7a72; font-size: 13px; margin-top: 24px;">Questions? Email <a href="mailto:care@student-essentials.com" style="color: #2e7d52;">care@student-essentials.com</a></p>
              </div>
            </div>
          `,
        })
      } catch (emailError) {
        console.error('Email error:', emailError)
      }
    }
  }

  return NextResponse.json({ received: true })
}