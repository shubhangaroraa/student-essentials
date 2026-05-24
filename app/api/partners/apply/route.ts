import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { org_name, contact_name, contact_email, contact_phone, institution_type, student_count, message } = body

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Generate a UTM code from org name
    const utm_code = org_name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .slice(0, 20) + Math.floor(Math.random() * 100)

    // Insert as pending partner
    const { error } = await supabase.from('ed_partners').insert({
      name: org_name,
      contact_name,
      contact_email,
      contact_phone,
      institution: institution_type,
      utm_code,
      commission_rate: 5,
      status: 'pending',
      notes: `Students: ${student_count}. Message: ${message ?? ''}`,
    })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, utm_code })
  } catch (err) {
    console.error('Partner apply error:', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}