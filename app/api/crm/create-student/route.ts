import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    const { user_id, first_name, email } = await request.json()

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Check if student already exists
    const { data: existing } = await supabase
      .from('crm_students')
      .select('id')
      .eq('user_id', user_id)
      .single()

    if (existing) return NextResponse.json({ success: true, existing: true })

    // Create new CRM student
    const { error } = await supabase
      .from('crm_students')
      .insert({
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

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('CRM error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}