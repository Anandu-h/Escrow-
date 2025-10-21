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

  const col = role === "buyer" ? "o.buyer_wallet" : "o.seller_wallet"

  const rows = await query<any[]>(
    `
    SELECT
      o.id,
      COALESCE(p.name, o.product) AS product,
      o.amount_cents,
      o.currency,
      o.status,
      o.progress,
      o.delivery_status,
      o.escrow_hash,
      o.created_at,
      COALESCE(b.email, o.buyer_name) AS buyer_name,
      COALESCE(s.email, o.seller_name) AS seller_name
    FROM orders o
    LEFT JOIN products p ON p.id = o.product_id
    LEFT JOIN users b ON b.id = o.buyer_id
    LEFT JOIN users s ON s.id = o.seller_id
    WHERE LOWER(${col}) = ?
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
        { status: 400 },
      )
    }

    // Load product and seller
    const product = await query<any[]>(
      `SELECT p.id, p.seller_id, p.name, p.price_cents, p.currency, u.wallet_address AS seller_wallet, u.email AS seller_name
       FROM products p
       LEFT JOIN users u ON u.id = p.seller_id
       WHERE p.id = ? AND p.is_active = 1
       LIMIT 1`,
      [productId],
    )

    if (product.length === 0) {
      return NextResponse.json({ error: "Product not found or inactive" }, { status: 404 })
    }

    const prod = product[0]

    // Resolve or auto-create buyer user
    let buyer = await query<{ id: number }[]>(
      "SELECT id FROM users WHERE LOWER(wallet_address) = LOWER(?) LIMIT 1",
      [buyerWallet],
    )
    if (buyer.length === 0) {
      const email = `${buyerWallet.toLowerCase()}@local`
      const passwordHash = "autocreated"
      const ins = await query<{ insertId: number }>(
        `INSERT INTO users (email, password_hash, wallet_address) VALUES (?, ?, ?)`,
        [email, passwordHash, buyerWallet],
      )
      buyer = [{ id: (ins as any).insertId }]
    }

    // Create order tied to product and users, and lock escrow state
    await query(
      `INSERT INTO orders (
         product_id,
         buyer_id,
         seller_id,
         buyer_wallet,
         seller_wallet,
         buyer_name,
         seller_name,
         amount_cents,
         currency,
         status,
         progress,
         delivery_status,
         estimated_delivery_date
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'locked', 10, 'Processing', DATE_ADD(CURDATE(), INTERVAL 7 DAY))`,
      [
        prod.id,
        buyer[0].id,
        prod.seller_id,
        buyerWallet,
        prod.seller_wallet || "",
        buyerName || "Buyer",
        prod.seller_name || "Seller",
        prod.price_cents,
        prod.currency,
      ],
    )

    return NextResponse.json({
      success: true,
      message: "Purchase initiated successfully",
    })
  } catch (error) {
    console.error("Error processing purchase:", error)
    return NextResponse.json(
      { error: "Failed to process purchase" },
      { status: 500 },
    )
  }
}