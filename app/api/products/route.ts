import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const formData = await req.formData()

    const productName = (formData.get("productName") as string) || ""
    const description = (formData.get("description") as string) || ""
    const price = parseFloat((formData.get("price") as string) || "0")
    const currency = ((formData.get("currency") as string) || "USD").toUpperCase()
    const condition = (formData.get("condition") as string) || "good"
    const sellerWallet = (formData.get("sellerWallet") as string) || ""

    if (!sellerWallet) {
      return NextResponse.json({ error: "Seller wallet is required" }, { status: 400 })
    }

    const title = productName && productName.trim() !== "" ? productName.trim() : "Product"
    const priceCents = Number.isFinite(price) && price > 0 ? Math.round(price * 100) : 0

    // Resolve or auto-create seller by wallet
    let users = await query<{ id: number }[]>(
      "SELECT id FROM users WHERE LOWER(wallet_address) = LOWER(?) LIMIT 1",
      [sellerWallet],
    )

    if (users.length === 0) {
      const email = `${sellerWallet.toLowerCase()}@local`
      const passwordHash = "autocreated"
      const insertUser = await query<{ insertId: number }>(
        `INSERT INTO users (email, password_hash, wallet_address) VALUES (?, ?, ?)`,
        [email, passwordHash, sellerWallet],
      )
      users = [{ id: (insertUser as any).insertId }]
    }

    const sellerId = users[0].id

    const result = await query<{ insertId: number }>(
      `INSERT INTO products (
        seller_id,
        name,
        description,
        price_cents,
        currency,
        condition_enum,
        is_active
      ) VALUES (?, ?, ?, ?, ?, ?, 1)`,
      [sellerId, title, description, priceCents, currency, condition.toLowerCase()],
    )

    return NextResponse.json({ success: true, productId: (result as any).insertId })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 },
    )
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const sellerId = searchParams.get("sellerId")

    let sql = `
      SELECT 
        p.id,
        p.name,
        p.price_cents,
        p.currency,
        p.created_at,
        u.email AS seller_name
      FROM products p
      LEFT JOIN users u ON u.id = p.seller_id
      WHERE p.is_active = 1
    `
    const params: any[] = []

    if (sellerId) {
      sql += " AND p.seller_id = ?"
      params.push(Number(sellerId))
    }

    sql += " ORDER BY p.created_at DESC"

    const rows = await query<any[]>(sql, params)

    const products = rows.map((r) => ({
      id: r.id,
      product: r.name,
      amount_cents: r.price_cents,
      currency: r.currency,
      created_at: r.created_at,
      seller_name: r.seller_name || "Seller",
      status: "available",
    }))

    return NextResponse.json({ products })
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 },
    )
  }
}
