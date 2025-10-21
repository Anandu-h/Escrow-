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

  const rows = await query<
    {
      id: number
      product_name: string
      seller_name: string | null
      buyer_name: string | null
      amount_cents: number
      currency: string
      status: string
      progress: number
      delivery_status: string | null
      tracking_number: string | null
      escrow_hash: string | null
      created_at: string
      updated_at: string
    }[]
  >(
    `
    SELECT
      o.id,
      p.name as product_name,
      o.amount_cents,
      o.currency,
      o.status,
      o.progress,
      o.delivery_status,
      o.tracking_number,
      o.escrow_hash,
      o.created_at,
      o.updated_at,
      CONCAT(bu.first_name, ' ', bu.last_name) as buyer_name,
      CONCAT(su.first_name, ' ', su.last_name) as seller_name
    FROM orders o
    JOIN products p ON o.product_id = p.id
    JOIN users bu ON o.buyer_id = bu.id
    JOIN users su ON o.seller_id = su.id
    WHERE LOWER(o.${col}) = ?
    ORDER BY o.created_at DESC
  `,
    [wallet],
  )

  return NextResponse.json({ orders: rows })
}

export async function POST(req: Request) {
  try {
    const { productId, buyerWallet, buyerName, escrowHash } = await req.json()

    if (!productId || !buyerWallet) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      )
    }

    // Get the product details
    const product = await query<{
      id: number
      name: string
      price_cents: number
      currency: string
      seller_id: number
    }[]>(
      "SELECT id, name, price_cents, currency, seller_id FROM products WHERE id = ? AND is_active = TRUE",
      [productId]
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

    // Get or create buyer user
    let buyerId: number
    const existingBuyer = await query<{ id: number }[]>(
      "SELECT id FROM users WHERE wallet_address = ? LIMIT 1",
      [buyerWallet]
    )

    if (existingBuyer.length > 0) {
      buyerId = existingBuyer[0].id
    } else {
      // Create new buyer user
      const newBuyer = await query(
        "INSERT INTO users (email, password_hash, wallet_address, first_name, last_name) VALUES (?, ?, ?, ?, ?)",
        [`buyer_${Date.now()}@temp.com`, 'temp_hash', buyerWallet, buyerName || 'Buyer', '']
      )
      buyerId = newBuyer.insertId
    }

    // Use stored procedure to create order
    const result = await query(
      `CALL CreateOrder(?, ?, ?, ?, ?, ?, @order_id, @success, @message)`,
      [productId, buyerId, buyerWallet, productData.price_cents, productData.currency, escrowHash || 'temp_hash']
    )

    // Get the output parameters
    const [output] = await query<{ '@order_id': number, '@success': boolean, '@message': string }[]>(
      "SELECT @order_id, @success, @message"
    )

    if (!output[0]['@success']) {
      return NextResponse.json(
        { error: output[0]['@message'] },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      orderId: output[0]['@order_id'],
      message: output[0]['@message'],
    })
  } catch (error) {
    console.error("Error processing purchase:", error)
    return NextResponse.json(
      { error: "Failed to process purchase" },
      { status: 500 },
    )
  }
}