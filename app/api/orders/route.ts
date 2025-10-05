import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const role = (searchParams.get("role") || "").toLowerCase()
  const wallet = (searchParams.get("wallet") || "").toLowerCase()

  if (!["buyer", "seller"].includes(role)) {
    return NextResponse.json({ error: "Missing or invalid role" }, { status: 400 })
  }
  if (!wallet) {
    return NextResponse.json({ error: "Missing wallet address" }, { status: 400 })
  }

  // Map role to column
  const col = role === "buyer" ? "buyer_wallet" : "seller_wallet"

  const rows = await query<
    {
      id: number
      product: string
      seller_name: string | null
      buyer_name: string | null
      amount_cents: number
      currency: string
      status: string
      progress: number
      delivery_status: string | null
      escrow_hash: string | null
      created_at: string
    }[]
  >(
    `
    SELECT
      o.id,
      o.product,
      o.amount_cents,
      o.currency,
      o.status,
      o.progress,
      o.delivery_status,
      o.escrow_hash,
      o.created_at,
      o.buyer_name,
      o.seller_name
    FROM orders o
    WHERE LOWER(o.${col}) = ?
    ORDER BY o.created_at DESC
  `,
    [wallet],
  )

  return NextResponse.json({ orders: rows })
}
