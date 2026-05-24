import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function sb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const { data, error } = await sb()
    .from('products')
    .select('*, product_variants(*)')
    .eq('id', params.id)
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json(data)
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json()
  const { variants, ...fields } = body
  const supabase = sb()

  const { data, error } = await supabase
    .from('products')
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq('id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Replace variants if provided
  if (variants !== undefined) {
    await supabase.from('product_variants').delete().eq('product_id', params.id)
    if (variants.length > 0) {
      await supabase.from('product_variants').insert(
        variants.map((v: { name: string; price: number }, i: number) => ({
          product_id: params.id, name: v.name, price: v.price, sort_order: i,
        }))
      )
    }
  }
  return NextResponse.json({ product: data })
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const { error } = await sb().from('products').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}