import { NextResponse } from 'next/server'

// Live inventory feed from the CRM. Re-fetched every 30s (ISR).
export const revalidate = 30

export async function GET() {
  try {
    const res = await fetch(`${process.env.CRM_API_URL}/api/public/inventory`, {
      headers: { 'x-api-key': process.env.CRM_API_KEY! },
      next: { revalidate: 30 },
    })
    if (!res.ok) {
      return NextResponse.json({ items: [], error: `CRM ${res.status}` }, { status: 200 })
    }
    const data = await res.json()
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60' },
    })
  } catch (err) {
    console.error('Inventory fetch error:', err)
    return NextResponse.json({ items: [], error: 'Failed to load inventory' }, { status: 200 })
  }
}
