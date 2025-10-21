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

    // Convert price to cents for storage
    const amountCents = Math.round(price * 100)

    // Handle image uploads (for now, just store image count)
    const imageCount = Array.from(formData.keys()).filter(key => key.startsWith('image_')).length

    // Get or create seller user
    let sellerId: number
    const existingSeller = await query<{ id: number }[]>(
      "SELECT id FROM users WHERE wallet_address = ? LIMIT 1",
      [sellerWallet]
    )

    if (existingSeller.length > 0) {
      sellerId = existingSeller[0].id
    } else {
      // Create new seller user
      const newSeller = await query(
        "INSERT INTO users (email, password_hash, wallet_address, first_name, last_name) VALUES (?, ?, ?, ?, ?)",
        [`seller_${Date.now()}@temp.com`, 'temp_hash', sellerWallet, sellerName || 'Seller', '']
      )
      sellerId = newSeller.insertId
    }

    // Get category ID
    const categoryResult = await query<{ id: number }[]>(
      "SELECT id FROM categories WHERE name = ? AND is_active = TRUE LIMIT 1",
      [category]
    )
    const categoryId = categoryResult.length > 0 ? categoryResult[0].id : null

    // Create images JSON array
    const images = Array.from({ length: imageCount }, (_, i) => `image_${i + 1}.jpg`)

    // Insert product into products table
    const result = await query(
      `INSERT INTO products (
        seller_id, 
        category_id,
        name, 
        description, 
        price_cents, 
        currency, 
        condition_enum,
        brand,
        model,
        warranty_info,
        shipping_method,
        return_policy,
        estimated_delivery_days,
        images
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        sellerId,
        categoryId,
        productName,
        description,
        amountCents,
        currency,
        condition,
        brand || null,
        model || null,
        warranty || null,
        shippingMethod || null,
        returnPolicy || null,
        parseInt(estimatedDelivery) || null,
        JSON.stringify(images)
      ]
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
    const category = searchParams.get("category")
    const sellerWallet = searchParams.get("sellerWallet")
    const limit = parseInt(searchParams.get("limit") || "50")
    const offset = parseInt(searchParams.get("offset") || "0")

    let sql = `
      SELECT 
        p.id,
        p.name,
        p.description,
        p.price_cents,
        p.currency,
        p.condition_enum,
        p.brand,
        p.model,
        p.warranty_info,
        p.shipping_method,
        p.return_policy,
        p.estimated_delivery_days,
        p.images,
        p.view_count,
        p.created_at,
        u.first_name as seller_name,
        u.wallet_address as seller_wallet,
        c.name as category_name
      FROM products p
      JOIN users u ON p.seller_id = u.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = TRUE
    `
    const params: any[] = []

    if (category) {
      sql += " AND c.name = ?"
      params.push(category)
    }

    if (sellerWallet) {
      sql += " AND u.wallet_address = ?"
      params.push(sellerWallet)
    }

    sql += " ORDER BY p.created_at DESC LIMIT ? OFFSET ?"
    params.push(limit, offset)

    const products = rows.map((r) => ({
      id: r.id,
      product: r.name,
      amount_cents: r.price_cents,
      currency: r.currency,
      created_at: r.created_at,
      seller_name: r.seller_name || "Seller",
      status: "available",
    }))

    // Get total count for pagination
    let countSql = `
      SELECT COUNT(*) as total
      FROM products p
      JOIN users u ON p.seller_id = u.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = TRUE
    `
    const countParams: any[] = []

    if (category) {
      countSql += " AND c.name = ?"
      countParams.push(category)
    }

    if (sellerWallet) {
      countSql += " AND u.wallet_address = ?"
      countParams.push(sellerWallet)
    }

    const [countResult] = await query<{ total: number }[]>(countSql, countParams)
    const total = countResult[0]?.total || 0

    return NextResponse.json({ 
      products,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    })
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 },
    )
  }
}
