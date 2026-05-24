import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const revalidate = 0

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const { data: products, error } = await supabase
    .from('products')
    .select('*, product_variants(*)')
    .order('sort_order')
    .order('sort_order', { referencedTable: 'product_variants' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ items: products })
}

export async function POST(request: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const body = await request.json()
  const { variants, ...product } = body

  const { data, error } = await supabase
    .from('products')
    .insert({ ...product, updated_at: new Date().toISOString() })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (variants?.length) {
    await supabase.from('product_variants').insert(
      variants.map((v: { name: string; price: number }, i: number) => ({
        product_id: data.id, name: v.name, price: v.price, sort_order: i,
      }))
    )
  }
  return NextResponse.json({ product: data })
}