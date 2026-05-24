import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    const { partner_id, action } = await request.json()
    // action: 'approve' | 'reject'

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const newStatus = action === 'approve' ? 'active' : 'rejected'

    const { data: partner, error } = await supabase
      .from('ed_partners')
      .update({ status: newStatus })
      .eq('id', partner_id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Send approval email
    if (action === 'approve' && partner.contact_email) {
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? 'https://student-essentials.com'}/api/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: partner.contact_email,
          subject: `Welcome to Student Essentials Ed-Partner Programme 🎉`,
          html: `
            <div style="font-family: DM Sans, sans-serif; max-width: 560px; margin: 0 auto; color: #0f1f17;">
              <div style="background: #1a3a2a; padding: 28px 32px; border-radius: 12px 12px 0 0;">
                <div style="font-size: 20px; font-weight: 500; color: #fff;">Student<span style="color: #6bbf8a;">Essentials</span></div>
                <div style="font-size: 11px; color: rgba(255,255,255,.4); margin-top: 2px;">Ed-Partner Programme</div>
              </div>
              <div style="background: #fff; padding: 32px; border: 0.5px solid rgba(26,58,42,.12); border-top: none; border-radius: 0 0 12px 12px;">
                <h2 style="font-size: 24px; margin-bottom: 8px;">You're approved, ${partner.contact_name ?? partner.name}! 🎉</h2>
                <p style="color: #4b5563; line-height: 1.7; margin-bottom: 24px;">
                  Welcome to the Student Essentials Ed-Partner Programme. Your application for <strong>${partner.name}</strong> has been approved.
                </p>

                <div style="background: #f0faf4; border: 0.5px solid rgba(46,125,82,.2); border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                  <div style="font-size: 13px; color: #374151; margin-bottom: 8px; font-weight: 500;">Your unique referral link:</div>
                  <div style="font-family: monospace; font-size: 14px; color: #1a3a2a; background: #fff; padding: 10px 14px; border-radius: 8px; word-break: break-all;">
                    https://student-essentials.com/?utm_partner=${partner.utm_code}
                  </div>
                  <div style="font-size: 12px; color: #6b7280; margin-top: 8px;">Share this with your students. Every signup and order via this link is attributed to you.</div>
                </div>

                <div style="margin-bottom: 24px;">
                  <div style="font-size: 13px; font-weight: 500; color: #374151; margin-bottom: 12px;">Your commission rate: <strong style="color: #1a3a2a;">${partner.commission_rate}%</strong></div>
                  <div style="font-size: 13px; color: #6b7280; line-height: 1.7;">
                    Commissions are calculated on all orders placed by your referred students and paid out monthly.
                    As your student volume grows, you'll automatically move to higher tiers (up to 10%).
                  </div>
                </div>

                <div style="background: #faf8f3; border-radius: 10px; padding: 16px 20px; margin-bottom: 28px;">
                  <div style="font-size: 13px; font-weight: 500; color: #374151; margin-bottom: 8px;">Next steps</div>
                  <div style="font-size: 13px; color: #6b7280; line-height: 1.9;">
                    1. Share your referral link with incoming students<br/>
                    2. Students sign up and order through the link<br/>
                    3. Track your referrals and earnings in your partner dashboard<br/>
                    4. Receive monthly commission payouts
                  </div>
                </div>

                <a href="mailto:care@student-essentials.com" style="display: inline-block; padding: 12px 24px; background: #1a3a2a; color: #fff; border-radius: 40px; text-decoration: none; font-size: 13px; font-weight: 500;">
                  Contact us with any questions
                </a>

                <p style="font-size: 12px; color: #9ca3af; margin-top: 28px;">
                  Student Essentials · care@student-essentials.com<br/>
                  3 Fulham Park Gardens, London SW6 4JX
                </p>
              </div>
            </div>
          `,
        }),
      })
    }

    return NextResponse.json({ success: true, status: newStatus })
  } catch (err) {
    console.error('Partner approve error:', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}