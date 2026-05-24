import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    const { first_name, email, university, country, utm_partner, utm_source, utm_campaign, user_id } = await request.json()

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Look up partner by utm_code
    let ed_partner_id = null
    if (utm_partner) {
      const { data: partner } = await supabase
        .from('ed_partners')
        .select('id')
        .eq('utm_code', utm_partner)
        .single()
      if (partner) ed_partner_id = partner.id
    }

    const source = utm_partner ? 'ed_partner' : 'website'

    // Upsert crm_students
    const { data: existingStudent } = await supabase
      .from('crm_students')
      .select('id')
      .eq('email', email)
      .single()

    if (!existingStudent) {
      await supabase.from('crm_students').insert({
        user_id, first_name, email, university, country,
        status: 'new_lead', source, ed_partner_id,
        utm_source: utm_partner ?? utm_source ?? null,
      })
    }

    // Create CRM lead
    const { error } = await supabase.from('crm_leads').insert({
      first_name: first_name ?? email?.split('@')[0] ?? 'Unknown',
      email, university, country,
      stage: 'new', source, ed_partner_id,
      utm_source: utm_partner ?? utm_source ?? null,
      utm_campaign: utm_campaign ?? null,
      user_id,
    })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('CRM leads error:', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}