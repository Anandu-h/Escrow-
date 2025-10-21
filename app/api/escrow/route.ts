import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const orderId = Number(searchParams.get("orderId") || 0)
  if (!orderId) {
    return NextResponse.json({ error: "Missing orderId" }, { status: 400 })
  }

  const rows = await query<
    {
      id: number
      product_id: number
      product_name: string
      amount_cents: number
      currency: string
      status: string
      escrow_hash: string | null
      buyer_wallet: string
      seller_wallet: string
      created_at: string
      release_date: string | null
    }[]
  >(
    `
    SELECT 
      o.id, 
      o.product_id,
      p.name as product_name,
      o.amount_cents, 
      o.currency, 
      o.status, 
      o.escrow_hash, 
      o.buyer_wallet, 
      o.seller_wallet, 
      o.created_at, 
      o.release_date
    FROM orders o
    JOIN products p ON o.product_id = p.id
    WHERE o.id = ?
    LIMIT 1
  `,
    [orderId],
  )

  if (!rows.length) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  return NextResponse.json({ escrow: rows[0] })
}
