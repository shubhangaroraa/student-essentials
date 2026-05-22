import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Fire-and-forget: also push this signup as a lead into the CRM.
async function pushToCRM(payload: Record<string, unknown>) {
  if (!process.env.CRM_API_URL || !process.env.CRM_API_KEY) return
  try {
    await fetch(`${process.env.CRM_API_URL}/api/public/leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.CRM_API_KEY,
      },
      body: JSON.stringify(payload),
    })
  } catch (e) {
    console.error('CRM lead push failed:', e)
  }
}

export async function POST(request: Request) {
  try {
    const { user_id, first_name, email } = await request.json()

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: existing } = await supabase
      .from('crm_students')
      .select('id')
      .eq('user_id', user_id)
      .single()

    if (existing) {
      return NextResponse.json({ success: true, existing: true })
    }

    const { error } = await supabase.from('crm_students').insert({
      user_id,
      first_name,
      email,
      status: 'new_lead',
      source: 'website',
    })

    if (error) {
      console.error('CRM insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Mirror into the central CRM as a lead.
    await pushToCRM({
      name: first_name || email,
      email,
      source: 'website_signup',
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('CRM error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
