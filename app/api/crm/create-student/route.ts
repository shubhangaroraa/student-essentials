import { NextRequest, NextResponse } from 'next/server'

 HEAD
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
=======
export async function POST(req: NextRequest) {
>>>>>>> 288c5f3 (Push new signups to Lovable CRM)
  try {
    const body = await req.json()

    const apiKey = process.env.CRM_API_KEY
    const crmUrl = process.env.CRM_API_URL || 'https://student-essentials.lovable.app'

 HEAD
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

    if (!apiKey) {
      console.error('CRM_API_KEY is not set')
      return NextResponse.json({ error: 'CRM not configured' }, { status: 500 })
    }

    const res = await fetch(`${crmUrl}/api/public/leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({
        name: body.name,
        email: body.email,
        phone: body.phone,
        source: body.source || 'website',
        message: body.message,
      }),
    })

    const data = await res.json().catch(() => ({}))

    if (!res.ok) {
      console.error('CRM push failed', res.status, data)
      return NextResponse.json({ error: 'CRM push failed', details: data }, { status: res.status })
    }

    return NextResponse.json({ ok: true, id: data.id })
  } catch (err: any) {
    console.error('push-lead error', err)
    return NextResponse.json({ error: err?.message || 'Unknown error' }, { status: 500 })
288c5f3 (Push new signups to Lovable CRM)
  }
}
