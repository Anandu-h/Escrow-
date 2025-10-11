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

export async function POST(req: Request) {
  try {
    const { productId, buyerWallet, buyerName } = await req.json()

    if (!productId || !buyerWallet) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Get the product details
    const product = await query<{
      id: number
      product: string
      seller_name: string
      seller_wallet: string
      amount_cents: number
      currency: string
    }[]>(
      "SELECT id, product, seller_name, seller_wallet, amount_cents, currency FROM orders WHERE id = ? AND status = 'pending'",
      [productId]
    )

    if (product.length === 0) {
      return NextResponse.json(
        { error: "Product not found or not available" },
        { status: 404 }
      )
    }

    const productData = product[0]

    // Update the order to mark it as purchased
    await query(
      `UPDATE orders SET 
        buyer_wallet = ?, 
        buyer_name = ?, 
        status = 'locked',
        progress = 10
      WHERE id = ?`,
      [buyerWallet, buyerName || "Buyer", productId]
    )

    return NextResponse.json({
      success: true,
      orderId: productId,
      message: "Purchase initiated successfully",
    })
  } catch (error) {
    console.error("Error processing purchase:", error)
    return NextResponse.json(
      { error: "Failed to process purchase" },
      { status: 500 }
    )
  }
}