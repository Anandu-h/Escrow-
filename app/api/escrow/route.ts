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
      product: string
      amount_cents: number
      currency: string
      status: string
      escrow_hash: string | null
      buyer_wallet: string
      seller_wallet: string
      created_at: string
      estimated_release_at: string | null
    }[]
  >(
    `
    SELECT id, product, amount_cents, currency, status, escrow_hash, buyer_wallet, seller_wallet, created_at, estimated_release_at
    FROM orders
    WHERE id = ?
    LIMIT 1
  `,
    [orderId],
  )

  if (!rows.length) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  return NextResponse.json({ escrow: rows[0] })
}
